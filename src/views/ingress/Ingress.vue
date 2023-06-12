<template>
    <div class="ingress">
        <el-row>
            <!-- 1 头部1 -->
            <el-col :span="24">
                <div>
                    <el-card class="ingress-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <el-row>
                            <!-- 1.1 命名空间 -->
                            <el-col :span="6">
                                <div>
                                    <span>命名空间: </span>
                                    <!-- 下拉框 -->
                                    <!-- filterable：带搜索功能 -->
                                    <!-- placeholder 默认提示 -->
                                    <!-- label 显示内容 -->
                                    <!-- value 绑定到v-model的值中 -->
                                    <el-select v-model="namespaceValue" filterable placeholder="请选择">
                                        <el-option v-for="(item, index) in namespaceList" :key="index"
                                            :label="item.metadata.name" :value="item.metadata.name">
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <!-- 1.2 刷新按钮 -->
                            <el-col :span="2" :offset="16">
                                <div>
                                    <el-button style="border-radius: 2px;" icon="Refresh" plain @click="getIngresss()">刷新</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>


            <!-- 头部2 -->
            <el-col :span="24">
                <div>
                    <!-- 包一层卡片 -->
                    <el-card class="ingress-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <el-row>
                            <!-- 创建按钮 -->
                            <el-col :span="2">
                                <div>
                                    <!-- 点击后打开抽屉，填入创建ingress需要的数据 -->
                                    <el-button style="border-radius:2px;" 
                                    icon="Edit" 
                                    type="primary"
                                    v-loading.fullscreen.lock="fullscreenLoading"
                                    @click="createIngressDrawer = true">创建</el-button>
                                </div>
                            </el-col>
                            <!-- 搜索输入框和搜索按钮 -->
                            <el-col :span="6">
                                <div>
                                    <!-- 搜索输入框 -->
                                    <el-input class="ingress-head-search" 
                                    clearable placeholder="请输入"
                                    v-model="searchInput"></el-input>
                                    <!-- 搜索按钮 -->
                                    <el-button style="border-radius:2px;" icon="Search" type="primary" plain @click="getIngresss()">搜索</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>


            <!-- 数据表格 -->
            <el-col :span="24">
                <div>
                    <el-card class="ingress-body-card" shadow="never" :body-style="{padding:'5px'}">
                        <!-- 数据表格 -->
                        <!-- v-loading用于加载时的loading动画 -->
                        <el-table style="width: 100%; font-size:12px; margin-bottom:10px" :data="ingressList" v-loading="appLoading">
                            <!-- 最左侧留出20px的宽度，更加美观 -->
                            <el-table-column width="20"></el-table-column>
                            <!-- ingress名字 -->
                            <el-table-column align=left label="Ingress名">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <a class="ingress-body-ingressname">{{scope.row.metadata.name}}</a>
                                </template>
                            </el-table-column>
                            <!-- 标签 -->
                            <el-table-column align=center label="标签">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <!-- for循环，每个label只显示固定长度，鼠标悬停后气泡弹出框显示完整长度 -->
                                    <div v-for="(val, key) in scope.row.metadata.labels" :key="key">
                                        <!-- 气泡弹出框 -->
                                        <!-- placement 弹出位置 -->
                                        <!-- trigger 触发条件 -->
                                        <!-- content 弹出框内容 -->
                                        <el-popover 
                                        placement="right"
                                        :width="200"
                                        trigger="hover"
                                        :content="key + ':' + val">
                                            <template #reference>
                                                <el-tag style="margin-bottom:5px;" type="warning">{{ellipsis(key + ':' + val)}}</el-tag>
                                            </template>
                                        </el-popover>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- Host -->
                            <el-table-column align=center label="Host" min-width='120'>
                                <template v-slot="scope">
                                    <div v-for="(item, index) in scope.row.spec.rules" :key="index">
                                        <el-popover
                                            placement="right"
                                            :width="200"
                                            trigger="hover"
                                            :content="item.host">
                                            <template #reference>
                                                <el-tag style="margin-bottom: 5px" type="danger">{{ ellipsis(item.host) }}</el-tag>
                                            </template>
                                        </el-popover>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- Path -->
                            <el-table-column align=center label="Path">
                                <template v-slot="scope">
                                    <div v-for="(item, index) in scope.row.spec.rules" :key="index">
                                        <el-popover
                                            placement="right"
                                            :width="100"
                                            trigger="hover"
                                            :content="item.http.paths[0].path">
                                            <template #reference>
                                                <el-tag style="margin-bottom: 5px" type="danger">{{ item.http.paths[0].path }}</el-tag>
                                            </template>
                                        </el-popover>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- external IP -->
                            <el-table-column align=center label="EXTERNAL-IP">
                                <template v-slot="scope">
                                    <span>{{ scope.row.status.loadBalancer.ingress ? scope.row.status.loadBalancer.ingress[0].ip : '' }} </span>
                                </template>
                            </el-table-column>
                            <!-- TLS -->
                            <el-table-column align=center label="TLS">
                                <template v-slot="scope">
                                    <span>{{ scope.row.spec.tls ? 'YES' : '' }} </span>
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
                                    <el-button size="small" style="border-radius:2px;" icon="Edit" type="primary" plain @click="getIngressDetail(scope)">YAML</el-button>
                                    <el-button size="small" disabled v-if="scope.row.metadata.name == 'kubernetes' " style="border-radius:2px;" icon="Delete" type="danger" @click="handleConfirm(scope, '删除', delIngress)">删除</el-button>
                                    <el-button size="small" v-else style="border-radius:2px;" icon="Delete" type="danger" @click="handleConfirm(scope, '删除', delIngress)">删除</el-button>
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
                        class="ingress-body-pagination" 
                        background 
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="pagesizeList"
                        :page-size="pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="ingressTotal">
                        </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>

        
        <!-- =================================新建============================= -->
        <!-- 抽屉：创建Ingress的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-Drawer v-model="createIngressDrawer"
        :direction="direction"
        :before-close="handleClose"
        size="40%">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>创建Ingress</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="createIngress" :rules="createIngressRules" :model="createIngress" label-width="100px">
                            <!-- prop用于rules中的校验规则的key -->
                            <el-form-item class="ingress-create-form" label="名称" prop="name">
                                <el-input v-model="createIngress.name"></el-input>
                            </el-form-item>
                            <!-- 名称空间 -->
                            <el-form-item class="ingress-create-form" label="命名空间" prop="namespace">
                                <el-select v-model="createIngress.namespace" filterable placeholder="请选择">
                                    <el-option v-for="(item, index) in namespaceList" :key="index"
                                        :label="item.metadata.name" :value="item.metadata.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <!-- 标签 -->
                            <el-form-item class="ingress-create-form" label="Ingress标签">
                                <el-input v-model="createIngress.label_str" placeholder="示例: project=ms,app=gateway"></el-input>
                            </el-form-item>
                            <!-- Annotations -->
                            <el-form-item class="ingress-create-form" label="Annotations">
                                <el-input v-model="createIngress.annotations_str" type="textarea" placeholder="示例: kubernetes.io/ingress.class=nginx, xxx=yyy  如果没有输入，则默认添加kubernetes.io/ingress.class=nginx"></el-input>
                            </el-form-item>
                            
                            <!-- 域名列表 -->
                            <template v-for="(item, index) in ingressRuleList" :key="index">
                                <el-form-item class="ingress-create-form" >
                                    <template #label>
                                          Rule{{ index+1 }}
                                     </template>
                                    <template  class="ingress-create-form-hosts">
                                        <el-alert :description="ingressRuleListTmp[index]" type="success" style=" margin-right: 5px; padding: 0;" :closable="false" />
                                        <el-icon color="#409EFC" @click="deleteFormRulesDrawer(index)"><Delete /></el-icon>
                                    </template>
                                </el-form-item>
                            </template>
                        </el-form>

                        <!-- 子窗口添加规则 -->
                        <!-- <el-button @click="innerDrawer = true">添加Rules</el-button> -->
                        <el-button @click="openFormDialog()">添加Rules</el-button>
                       
                        <el-dialog
                            v-model="innerDrawer"
                            title="创建规则"
                            width="40%"
                            :append-to-body="true"
                            :before-close="handleCloseDialog">
                            <!-- form表单，即每次点击添加时候的一条rules规则 -->
                            <el-form ref="ingressHosts" :model="ingressHosts" :rules="createIngressRules2" label-width="100px" class="demo-dynamic">
                                <!-- rules中的hosts -->
                                <el-form-item class="deploy-create-form" label="域名" prop="host">
                                    <el-input v-model="ingressHosts.host" placeholder="示例: www.example.com"></el-input>
                                </el-form-item>
                                <el-card shadow="never" class="ingress-paths-card" v-for="(item, index) in ingressHosts.paths" :key="index">
                                    <template #header>
                                        <div class="ingress-paths-card-header">
                                            <span>path{{ index + 1 }}</span>
                                            <el-icon color="#409EFC" @click="deleteFormRules(index)"><Delete /></el-icon>
                                        </div>
                                    </template>
                                    <!-- path -->
                                    <el-form-item :prop="'paths.' + index + '.path'" label="path" :rules="{required: true, message: '请填写路径', trigger: 'change'}">
                                        <el-input v-model="item.path" placeholder="示例: /abc"></el-input>
                                    </el-form-item>
                                    <!-- pathType -->
                                    <el-form-item :prop="'paths.' + index + '.path_type'" label="匹配类型" :rules="{required: true, message: '请选择匹配类型', trigger: 'change'}">
                                        <el-select v-model="item.path_type" placeholder="请选择">
                                            <el-option value="Prefix" label="Prefix"></el-option>
                                            <el-option value="Exact" label="Exact"></el-option>
                                            <el-option value="ImplementationSpecific" label="ImplementationSpecific"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <!-- Service 名字 -->
                                    <el-form-item :prop="'paths.' + index + '.service_name'"  label="Service名" :rules="{required: true, message: '请填写Service名称', trigger: 'change'}">
                                        <el-input  v-model="item.service_name"></el-input>
                                    </el-form-item>
                                    <!-- Service 端口 -->
                                    <el-form-item :prop="'paths.' + index + '.service_port'" label="Service端口" :rules="{required: true, message: '请填写Service端口', trigger: 'change'}">
                                        <el-input v-model="item.service_port" placeholder="示例: 80"></el-input>
                                    </el-form-item>
                                </el-card>
                            </el-form>
                            <template #footer>
                                <el-button type="primary" @click="addPathDialog()">添加</el-button>
                                <el-button type="primary" @click="submitFormRules('ingressHosts')">确定</el-button>
                            </template>
                        </el-dialog>
                    </el-col>
                </el-row>
            </template> 

            
            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="createIngressDrawer = false">取消</el-button>
                <el-button type="primary" @click="submitForm('createIngress')">立即创建</el-button>
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
                    <el-button type="primary" @click="updateIngress()">更 新</el-button>
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
            createIngressDrawer: false,
            direction: 'rtl',
            // 创建-子抽屉 Dailog
            innerDrawer: false,
            // 创建ingress的属性
            createIngress: {
                name: '',
                namespace: '',
                annotations_str: '',
                annotations: {},
                label_str: '',
                label: {},
                hosts: {}, 
                cluster: '',
            },

            // 发送请求的参数
            createIngressData: {
                url: common.k8sIngressCreate,
                params: {},
            },
            // 创建ingress的表单校验规则1（）
            createIngressRules: {
                name: [{
                    required: true,
                    message: '请填写名称',
                    trigger: 'change'
                }],
                namespace: [{
                    required: true,
                    message: '请选择命名空间',
                    trigger: 'change'
                }],
                host: [{
                    required: true,
                    message: '请填写域名',
                    trigger: 'change'
                }],
            },
            // 创建ingress的表单校验规则2， 用于校验dailog中的rules规则
            createIngressRules2: {
                host: [{required: true, message: '请填写域名', trigger: 'change' }]
            },
            // 用于存放每一条ingressHosts数据
            ingressRuleList: [],
            // 用于存放每一条ingressHosts数据(只是存储hosts，用于页面回显)
            ingressRuleListTmp: [],
             // dialog中添加 ingress 的rules时需要的数据
            ingressHosts: {
                host: '',
                paths: [{ path: '', path_type: '', service_name: '', service_port: '' }]
            },

            // 表格列表
            ingressList: [],
            ingressTotal: 0, // 用于分页
            appLoading: false, // loading效果
            getIngresssData: {
                url: common.k8sIngressList,
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
            ingressDetail: {},
            getIngressDetailData: {
                url: common.k8sIngressDetail,
                params: {
                    ingress_name: '',
                    namespace: '',
                    cluster: '',
                }
            },
            // 更新
            updateIngressData: {
                url: common.k8sIngressUpdate,
                params: {
                    namespace: '',
                    content: '',
                    cluster: '',
                }
            },

            // 删除ingress
            deleteIngressData: {
                url: common.k8sIngressDel,
                params: {
                    namespace: '',
                    ingress_name: '',
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
            this.getIngresss()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getIngresss()
        }, 
        // 字符串截取、拼接并返回
        ellipsis(value){
            return value.length > 15 ? value.substring(0,15)+"...":value
        },
        // 字符串空格处理
        strTrimmed(value){
            return value.replace(/\s/g, "");
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

        // 创建Ingress，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.createIngressFunc()
                } else {
                    false
                }
            })
        },

        // 创建ingress，加Func的原因是因为createIngress用于属性了
        createIngressFunc(){
            // 正则匹配，验证标签annotations和label的合法性
            let reg = new RegExp("(^[A-Za-z/.]+=[A-Za-z0-9]+).*")
            if (this.createIngress.label_str.length > 3 && !reg.test(this.createIngress.label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }
            if (this.createIngress.annotations_str.length != "" && !reg.test(this.createIngress.annotations_str)){
                this.$message.warning({
                    message: "Annotations填写异常，请确认后重新填写"
                })
                return
            }
            // 如果没有rule规则，则不允许创建，至少有一条规则
            if (this.ingressRuleList.length < 1){
                this.$message.warning({
                    message: "至少需要一条rules规则，请添加后再创建"
                })
                return
            }

            //加载loading动画
            this.fullscreenLoading = true

            // 定义label、annotations
            // 'app=xxx,version=yyy'
            // ['app=xxx','version=yyy']
            // [['app','xxx'],['version','yyy']]
            // map['app']='xxx',map['version']=yyy
            let label = new Map()
            if (this.createIngress.label_str != ''){
                let a = (this.strTrimmed(this.createIngress.label_str)).split(",")
                a.forEach(item => {
                    let b = item.split("=")
                    label[b[0]] = b[1]
                })
            }

            let annotations = new Map()
            if (this.createIngress.annotations_str != ''){
                let c = (this.strTrimmed(this.createIngress.annotations_str)).split(',')
                c.forEach(item=>{
                    let d = item.split('=')
                    annotations[d[0]] = d[1]
                })
            }else{
                annotations['kubernetes.io/ingress.class'] = 'nginx'
            }
            
            // 处理rules，以及将port转换为int类型
            let hosts = {}
            let rulis = this.ingressRuleList
            rulis.forEach(item => {
                item.paths.forEach(p => {
                    let new_service_port = 0
                    new_service_port = parseInt(p.service_port)
                    p.service_port = new_service_port
                })
                hosts[item.host] = item.paths
            })

            // 赋值
            this.createIngressData.params = this.createIngress
            this.createIngressData.params.annotations = annotations
            this.createIngressData.params.label = label
            this.createIngressData.params.hosts = hosts
            this.createIngressData.params.cluster = this.selectClusterValue

            // 发起请求
            httpClient.post(this.createIngressData.url, this.createIngressData.params).then(res=>{
                this.$message.success({
                    message: res.msg
                })
                // 创建后重新获取列表
                this.getIngresss()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            
            // 重置表单（只能重置必填项的内容）
            this.resetForm('createIngress')
            this.resetFormDialog('ingressHosts')
            // 清空非必填项的内容
            this.createIngress.label_str = ''
            this.createIngress.annotations_str = ''
            this.ingressRuleList = []
            // 关闭加载动画
            this.fullscreenLoading = false
            // 关闭抽屉
            this.createIngressDrawer = false
        },
        // 获取Ingress列表
        getIngresss() {
            // 表格加载动画开启
            this.appLoading = true
            //getIngresssData是用于发起ingress列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getIngresssData.params.filter_name = this.searchInput
            this.getIngresssData.params.namespace = this.namespaceValue
            this.getIngresssData.params.page = this.currentPage
            this.getIngresssData.params.limit = this.pagesize
            this.getIngresssData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getIngresssData.url, {params: this.getIngresssData.params}).then(res => {
                this.ingressList = res.data.items
                this.ingressTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },
        // 获取Ingress详情，e参数标识传入的scope插槽，.row是该行的数据
        getIngressDetail(e){
            //getIngresssData是用于发起ingress列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getIngressDetailData.params.namespace = this.namespaceValue
            this.getIngressDetailData.params.ingress_name = e.row.metadata.name
            this.getIngressDetailData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getIngressDetailData.url, {params: this.getIngressDetailData.params}).then(res => {
                //响应成功，获得ingress详情
                this.ingressDetail = res.data
                //将对象转成yaml格式的字符串
                this.contentYaml = this.transYaml(this.ingressDetail)
                //打开弹出框
                this.yamlDialog = true
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 更新Ingress
        updateIngress(){
            //将yaml格式的ingress对象转为json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.updateIngressData.params.content = content
            this.updateIngressData.params.namespace = this.namespaceValue
            this.updateIngressData.params.cluster = this.selectClusterValue
            httpClient.put(this.updateIngressData.url, this.updateIngressData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                //更新后重新获取列表
                this.getIngresss()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            //关闭弹出框
            this.yamlDialog = false
        },

        // 删除ingress
        delIngress(e){
            this.deleteIngressData.params.namespace = this.namespaceValue
            this.deleteIngressData.params.ingress_name = e.row.metadata.name 
            this.deleteIngressData.params.cluster = this.selectClusterValue
            httpClient.delete(this.deleteIngressData.url, {data: this.deleteIngressData.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后重新获取列表
                this.getIngresss()
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
                //restartIngress(e)或者delIngress(e)
                fn(obj)
            }).catch(()=>{
                this.$message.info({
                    message: '已取消操作'
                })
            })
        },


        // 打开Dialog窗口
        openFormDialog(){
            // 打开Dialog窗口
            this.innerDrawer = true
        },
        // dialog中，添加添加按钮，新增一条数据假如
        addPathDialog(){
            this.ingressHosts.paths.push({ path: '', path_type: '', service_name: '', service_port: '' })
        },
        // 删除Dialog中rules规则，
        deleteFormRules(index){
            // 首先判断长度，如果只有一条则不能删除
            if (this.ingressHosts.paths.length === 1){
                this.$message.error({
                    message: "至少保留1条 Path 规则"
                })
                return
            }
            // 根据传入的下标，删除对应的数据项 rules的paths
            this.ingressHosts.paths.splice(index, 1)
        },
        // 删除Drawer中的rules规则
        deleteFormRulesDrawer(index){
            this.ingressRuleList.splice(index, 1)
        },
        // 重置Dialog表单方法 
        resetFormDialog(formName) {
            this.$refs[formName].resetFields()
        },
        // 校验Rules表单
        submitFormRules(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    // 校验通过，执行提交逻辑
                    console.log('表单校验通过，执行提交逻辑');
                    // 如果表单校验成功了，将该条rules数据添加到ingressRuleList中
                    this.appendRulesFunc()
                } else {
                    // 校验未通过，进行相应的处理
                    console.log('表单校验未通过');
                    false
                }
            });
        },
        // 校验通过了执行的方法
        appendRulesFunc(){
            // 创建ingressHosts对象的副本（如果不创建副本，那么每次push都会是最新的值），如果表单校验成功了，将该条rules数据添加到ingressRuleList中。
            const ingressHostsCopy = JSON.parse(JSON.stringify(this.ingressHosts));
            this.ingressRuleList.push(ingressHostsCopy)
            const ingressHostsCopyTmp = JSON.stringify(this.ingressHosts);
            this.ingressRuleListTmp.push(ingressHostsCopyTmp)
            // 关闭dialog
            this.innerDrawer = false
            // // 重置表单的内容
            // this.resetFormDialog('ingressHosts')
        },
        
        // 关闭diallog，即创建rules的子弹窗 即点击右上角的关闭按钮
        handleCloseDialog(done){
            done()
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
                //获取ingress列表
                this.getIngresss()
            }
        },
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getNamespaceList()
                this.getIngresss()
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
        this.getNamespaceList()
        this.getIngresss()
    }
}
</script>


<style scoped>
/* 卡片属性 */
.ingress-head-card,
.ingress-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}
/*创建rules相关样式*/
.ingress-paths-card {
    margin-bottom: 10px;
}
.ingress-paths-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.ingress-create-form-hosts {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
/* 搜索框 */
.ingress-head-search{
    width: 160px;
    margin-right: 10px;
}
/* 数据表格ingress名颜色 */
.ingress-body-ingressname {
    color: #4795EE;
}
    /* ingress名鼠标悬停 */
.ingress-body-ingressname:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
}

</style>