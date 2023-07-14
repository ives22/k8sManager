<template>
    <div class="node">
        <el-row>
            <!-- 头部1 -->
            <el-col :span="24">
                <div>
                    <!-- 包一层卡片 -->
                    <el-card class="node-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <el-row>
                            <!-- 创建按钮 -->
                            <el-col :span="2">
                                <div>
                                    <!-- 点击后打开抽屉，填入创建node需要的数据 -->
                                    <el-button style="border-radius:2px;" 
                                    icon="Edit" 
                                    type="primary"
                                    disabled
                                    v-loading.fullscreen.lock="fullscreenLoading"
                                    @click="createNodeDrawer = true">创建</el-button>
                                </div>
                            </el-col>
                            <!-- 搜索输入框和搜索按钮 -->
                            <el-col :span="6">
                                <div>
                                    <!-- 搜索输入框 -->
                                    <el-input class="node-head-search" 
                                    clearable placeholder="请输入"
                                    v-model="searchInput"></el-input>
                                    <!-- 搜索按钮 -->
                                    <el-button style="border-radius:2px;" icon="Search" type="primary" plain @click="getNodes()">搜索</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>

            <!-- 数据表格 -->
            <el-col :span="24">
                <div>
                    <el-card class="node-body-card" shadow="never" :body-style="{padding:'5px'}">
                        <!-- 数据表格 -->
                        <!-- v-loading用于加载时的loading动画 -->
                        <el-table style="width: 100%; font-size:12px; margin-bottom:10px" :data="nodeList" v-loading="appLoading">
                            <!-- 最左侧留出20px的宽度，更加美观 -->
                            <el-table-column width="20"></el-table-column>
                            <!-- node名字 -->
                            <el-table-column align=left label="Node名">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <!-- <a href="" class="node-body-nodename">{{scope.row.metadata.name}}</a> -->
                                    <a class="node-body-nodename">{{scope.row.metadata.name}}</a>
                                </template>
                            </el-table-column>
                            <!-- IP -->
                            <el-table-column align=center label="IP">
                                <template v-slot="scope">
                                    <span>{{ scope.row.status.addresses[0].address }}</span>
                                </template>
                            </el-table-column>
                            
                            <!-- 规格 -->
                            <el-table-column align=center label="规格">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <el-tag type="warning">{{ scope.row.status.capacity.cpu }}核{{
                                        specTrans(scope.row.status.capacity.memory) }}G</el-tag>
                                </template>
                            </el-table-column>
                            <!-- POD网段 -->
                            <el-table-column align=center label="POD-CIDR">
                                <template v-slot="scope">
                                    <span>{{ scope.row.spec.podCIDR }}</span>
                                </template>
                            </el-table-column>
                            <!-- kubernetes 版本 -->
                            <el-table-column align=center label="版本">
                                <template v-slot="scope">
                                    <span>{{ scope.row.status.nodeInfo.kubeletVersion }}</span>
                                </template>
                            </el-table-column>
                            <!-- 创建时间 -->
                            <el-table-column align=center min-width="100" label="创建时间">
                                <!-- timeTrans函数用于将格林威治时间转成北京时间 -->
                                <template v-slot="scope">
                                    <el-tag type="info">{{ timeTrans(scope.row.metadata.creationTimestamp) }} </el-tag>
                                </template>
                            </el-table-column>
                            <!-- 操作列，放按钮 -->
                            <el-table-column align=center label="操作" width="400">
                                <template v-slot="scope">
                                    <el-button size="small" style="border-radius:2px;" icon="Edit" type="primary" plain @click="getNodeDetail(scope)">YAML</el-button>
                                    <el-button size="small" disabled style="border-radius:2px;" icon="Delete" type="danger" @click="handleConfirm(scope, '删除', delNode)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- 分页配置 -->
                        <!-- background 背景色灰 -->
                        <!-- size-change 单页大小改变后触发 -->
                        <!-- current-change 页数改变后触发 -->
                        <!-- current-page 当前页 -->
                        <!-- page-size 单页大小 -->
                        <!-- layout 分页器支持的功能 -->
                        <!-- total 数据总条数 -->
                        <el-pagination 
                        class="node-body-pagination" 
                        background 
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="pagesizeList"
                        :page-size="pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="nodeTotal">
                        </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>

        

        <!-- =================================新建============================= -->
        <!-- 抽屉：创建Node的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-Drawer v-model="createNodeDrawer"
        :direction="direction"
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>创建Node</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="createNode" :rules="createNodeRules" :model="createNode" label-width="80px">
                            <!-- prop用于rules中的校验规则的key -->
                            <el-form-item class="node-create-form" label="名称" prop="name">
                                <el-input v-model="createNode.name"></el-input>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="命名空间" prop="namespace">
                                <el-select v-model="createNode.namespace" filterable placeholder="请选择">
                                    <el-option v-for="(item, index) in namespaceList" :key="index"
                                        :label="item.metadata.name" :value="item.metadata.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="副本数" prop="replicas">
                                <el-input-number v-model="createNode.replicas" :min="1" :max="10"></el-input-number>
                                <el-popover placement="top" :width="100" trigger="hover" content="副本数上限为10个">
                                    <template #reference>
                                        <el-icon style="width:2em;fontsize:18px;color:#4795EE"><WarningFilled/></el-icon>
                                    </template>
                                </el-popover>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="镜像" prop="image">
                                <el-input v-model="createNode.image"></el-input>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="标签" prop="label_str">
                                <el-input v-model="createNode.label_str" placeholder="示例: project=ms,app=gateway"></el-input>
                            </el-form-item>
                            <!-- 下拉框，用于规格的选择，之后用/分割，得到cpu和内存 -->
                            <el-form-item class="node-create-form" label="资源配额" prop="resource">
                                <el-select v-model="createNode.resource" placeholder="请选择">
                                    <el-option value="0.5/1" label="0.5C1G"></el-option>
                                    <el-option value="1/2" label="1C2G"></el-option>
                                    <el-option value="2/4" label="2C4G"></el-option>
                                    <el-option value="4/8" label="4C8G"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="容器端口" prop="container_port">
                                <el-input v-model="createNode.container_port" placeholder="示例: 80"></el-input>
                            </el-form-item>
                            <el-form-item class="node-create-form" label="健康检查" prop="health">
                                <el-switch v-model="createNode.health_check" />
                            </el-form-item>
                            <el-form-item class="node-create-form" label="检查路径" prop="healthPath">
                                <el-input v-model="createNode.health_path" placeholder="示例: /health"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template> 

            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="createNodeDrawer = false">取消</el-button>
                <el-button type="primary" @click="submitForm('createNode')">立即创建</el-button>
            </template>
        </el-Drawer>


        <!-- =================================YAML============================= -->
        <!-- 展示YAML信息的弹框 -->
        <el-dialog
        title="YAML信息"
        v-model="yamlDialog"
        width="45%"
        top="2%">
            <!-- codemirror编辑器 -->
            <!-- border 带边框 -->
            <!-- options 编辑器配置 -->
            <!-- change 编辑器中的内容变化时触发 -->
            <codemirror 
            :value="contentYaml"
            border
            :options="cmOptions"
            height="500"
            style="font-size:14px;"
            @change="onChange"></codemirror>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="yamlDialog = false">取 消</el-button>
                    <el-button disabled type="primary" @click="updateNode()">更 新</el-button>
                </span>
            </template>
        </el-dialog>



    </div>
</template>

<script>
import common from "../common/Config"
import httpClient from "@/utils/request"
import yaml2obj from "js-yaml"
import json2yaml from "json2yaml"

export default {
    data() {
        return {
            // 当前选中的cluster
            selectClusterValue: localStorage.getItem('k8s_cluster'),
            // 搜索
            searchInput: '',
            // 命名空间
            namespaceValue: 'default',
            namespaceList: [],
            namespaceListUrl: common.k8sNamespaceList,
            // 创建
            fullscreenLoading: false,
            createNodeDrawer: false,
            direction: 'rtl',
            // 创建node都属性
            createNode: {
                name: '',
                namespace: '',
                replicas: 1,
                image: '',
                resource: '',
                health_check: false,
                health_path: '',
                label_str: '',
                label: {},
                container_port: '',
                cluster: '',
            },
            // 发送请求的参数
            createNodeData: {
                url: common.k8sNodeCreate,
                params: {},
            },
            // 创建node的表单校验规则
            createNodeRules: {
                name: [{
                    required: true,
                    message: '请填写名称',
                    trigger: 'change'
                }],
                image: [{
                    required: true,
                    message: '请填写镜像',
                    trigger: 'change'
                }],
                namespace: [{
                    required: true,
                    message: '请选择命名空间',
                    trigger: 'change'
                }],
                resource: [{
                    required: true,
                    message: '请选择配额',
                    trigger: 'change'
                }],
                label_str: [{
                    required: true,
                    message: '请填写标签',
                    trigger: 'change'
                }],
                container_port: [{
                    required: true,
                    message: '请填写容器端口',
                    trigger: 'change'
                }],
            },

            // 表格列表
            nodeList: [],
            nodeTotal: 0, // 用于分页
            appLoading: false, // loading效果
            getNodesData: {
                url: common.k8sNodeList,
                params: {
                    filter_name: '',
                    namespace: '',
                    page: 1,
                    limit: 10,
                    cluster: '',
                }
            },
            // 分页
            currentPage: 1,
            pagesize: 10,
            pagesizeList: [10, 20, 30],

            // 编辑器配置
            cmOptions: common.cmOptions,
            contentYaml: '',
            // 详情
            yamlDialog: false,
            nodeDetail: {},
            getNodeDetailData: {
                url: common.k8sNodeDetail,
                params: {
                    node_name: '',
                    namespace: '',
                    cluster: '',
                }
            },
            // 更新
            updateNodeData: {
                url: common.k8sStatefulSetUpdate,
                params: {
                    namespace: '',
                    content: '',
                    cluster: '',
                }
            },

            // 删除node
            deleteNodeData: {
                url: common.k8sStatefulSetDel,
                params: {
                    namespace: '',
                    node_name: '',
                    cluster: '',
                }
            },

        }
    },
    methods: {
        // json转yaml
        transYaml(content){
            return json2yaml.stringify(content)
        },
        // yaml转对象
        transObj(content){
            return yaml2obj.load(content)
        },
        // 编辑器内容发生变换时触发的方法，用于将更新的内容复制到变量中
        onChange(val){
            this.contentYaml = val
        },
        // 分页, 页面大小发生变化时触发，赋值并重新获取列表
        handleSizeChange(size) {
            this.pagesize = size
            this.getNodes()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getNodes()
        }, 
        // 字符串截取、拼接并返回
        ellipsis(value){
            return value.length > 15 ? value.substring(0,15)+"...":value
        },
        //格林威治时间转为北京时间
        timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        },

        // 获取Namespace列表
        getNamespaceList() {
            httpClient.get(this.namespaceListUrl, {params: {"cluster": this.selectClusterValue}}).then(res => {
                this.namespaceList = res.data.items
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 处理抽屉的关闭，doble check，增加体验
        handleClose(done){
            this.$confirm('确认关闭？').then(()=>{
                done();
            }).catch(()=>{})
        },

        // 重置表单方法 
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },

        // 创建Node，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.createNodeFunc()
                } else {
                    false
                }
            })
        },
        // 创建node，加Func的原因是因为createNode用于属性了
        createNodeFunc(){
            // 正则匹配，验证label的合法性
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.createNode.label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }

            //加载loading动画
            this.fullscreenLoading = true

            // 定义label、cpu和memory变量
            // 'app=xxx,version=yyy'
            // ['app=xxx','version=yyy']
            // [['app','xxx'],['version','yyy']]
            // map['app']='xxx',map['version']=yyy
            let label = new Map()
            let cpu, memory
            let a = (this.createNode.label_str).split(',')
            a.forEach(item=>{
                let b = item.split('=')
                label[b[0]] = b[1]
            })
            //将node的规格转成cpu和memory
            let resourceList = this.createNode.resource.split("/")
            cpu = resourceList[0]
            memory = resourceList[1] + "Gi"

            // 赋值
            this.createNodeData.params = this.createNode
            this.createNodeData.params.container_port = parseInt(this.createNode.container_port)
            this.createNodeData.params.label = label
            this.createNodeData.params.cpu = cpu
            this.createNodeData.params.memory = memory
            this.createNodeData.params.cluster = this.selectClusterValue

            // 发起请求
            httpClient.post(this.createNodeData.url, this.createNodeData.params).then(res=>{
                this.$message.success({
                    message: res.msg
                })
                // 创建后重新获取列表
                this.getNodes()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            
            // 重置表单
            this.resetForm('createNode')
            // 关闭加载动画
            this.fullscreenLoading = false
            // 关闭抽屉
            this.createNodeDrawer = false
        },
        // 获取Node列表
        getNodes() {
            // 表格加载动画开启
            this.appLoading = true
            //getNodesData是用于发起node列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getNodesData.params.filter_name = this.searchInput
            this.getNodesData.params.page = this.currentPage
            this.getNodesData.params.limit = this.pagesize
            this.getNodesData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getNodesData.url, {params: this.getNodesData.params}).then(res => {
                this.nodeList = res.data.items
                this.nodeTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },
        // 获取Node详情，e参数标识传入的scope插槽，.row是该行的数据
        getNodeDetail(e){
            //getNodesData是用于发起node列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getNodeDetailData.params.namespace = this.namespaceValue
            this.getNodeDetailData.params.node_name = e.row.metadata.name
            this.getNodeDetailData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getNodeDetailData.url, {params: this.getNodeDetailData.params}).then(res => {
                //响应成功，获得node详情
                this.nodeDetail = res.data
                //将对象转成yaml格式的字符串
                this.contentYaml = this.transYaml(this.nodeDetail)
                //打开弹出框
                this.yamlDialog = true
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 更新Node
        updateNode(){
            //将yaml格式的node对象转为json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.updateNodeData.params.content = content
            this.updateNodeData.params.namespace = this.namespaceValue
            this.updateNodeData.params.cluster = this.selectClusterValue
            httpClient.put(this.updateNodeData.url, this.updateNodeData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                //更新后重新获取列表
                this.getNodes()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            //关闭弹出框
            this.yamlDialog = false
        },

        // 删除node
        delNode(e){
            this.deleteNodeData.params.namespace = this.namespaceValue
            this.deleteNodeData.params.node_name = e.row.metadata.name 
            this.deleteNodeData.params.cluster = this.selectClusterValue
            httpClient.delete(this.deleteNodeData.url, {data: this.deleteNodeData.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后重新获取列表
                this.getNodes()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 弹出确认框，用于危险操作的double check
        // obj 是行数据，opeateName是操作名，fn是操作的方法
        handleConfirm(obj, operateName, fn){
            this.confirmContent = '确认继续' + operateName + '操作吗？'
            // $confirm用于弹出确认框
            this.$confirm(this.confirmContent, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(()=>{
                //restartNode(e)或者delNode(e)
                fn(obj)
            }).catch(()=>{
                this.$message.info({
                    message: '已取消操作'
                })
            })
        },
        // 计算node的规格
        specTrans(str) {
            if ( str.indexOf('Ki') == -1 ) {
                return str
            }
            let num = str.slice(0,-2) / 1024 / 1024
            return num.toFixed(0)
        },
    },

    watch: {
        //监听namespace的值,若发生变化，则执行handler方法中的内容
        namespaceValue: {
            handler(){
                //将namespace的值存入本地，用于path切换时依旧能获取得到
                localStorage.setItem('namespace', this.namespaceValue)
                //重置当前页为1
                this.currentPage = 1
            }
        },
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getNamespaceList()
                this.getNodes()
            }
        }
    },
    mounted(){     
        //需要将vue实例赋值给_this,这样在window.addEventListener中通过_this可以为vue实例上data中的变量赋值
        let _this=this;
        window.addEventListener("setItemEvent", function(e){
             //e.key : 是值发生变化的key
            //e.newValue : 是可以对应的新值
            if(e.key==="k8s_cluster"){
                _this.selectClusterValue = e.newValue
            }
        })
    },
    beforeMount() {
        //加载页面时先获取localStorage中的namespace值，若获取不到则默认default
        if (localStorage.getItem('namespace') !== undefined && localStorage.getItem('namespace') != null) {
            this.namespaceValue = localStorage.getItem('namespace')
        }
        this.getNodes()
    }
}
</script>


<style scoped>
/* 卡片属性 */
.node-head-card,
.node-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}
/* 搜索框 */
.node-head-search{
    width: 160px;
    margin-right: 10px;
}
/* 数据表格node名颜色 */
.node-body-nodename {
    color: #4795EE;
}
    /* node名鼠标悬停 */
.node-body-nodename:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
}
</style>