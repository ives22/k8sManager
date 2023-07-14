<template>
    <div class="persistentvolume">
        <el-row>
            <!-- 头部1 -->
            <el-col :span="24">
                <div>
                    <!-- 包一层卡片 -->
                    <el-card class="persistentvolume-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <el-row>
                            <!-- 创建按钮 -->
                            <el-col :span="2">
                                <div>
                                    <!-- 点击后打开抽屉，填入创建persistentvolume需要的数据 -->
                                    <el-button style="border-radius:2px;" 
                                    icon="Edit" 
                                    type="primary"
                                    v-loading.fullscreen.lock="fullscreenLoading"
                                    disabled
                                    @click="createPersistentVolumeDrawer = true">创建</el-button>
                                </div>
                            </el-col>
                            <!-- 搜索输入框和搜索按钮 -->
                            <el-col :span="6">
                                <div>
                                    <!-- 搜索输入框 -->
                                    <el-input class="persistentvolume-head-search" 
                                    clearable placeholder="请输入"
                                    v-model="searchInput"></el-input>
                                    <!-- 搜索按钮 -->
                                    <el-button style="border-radius:2px;" icon="Search" type="primary" plain @click="getPersistentVolumes()">搜索</el-button>
                                </div>
                            </el-col>
                            <!-- 1.2 刷新按钮 -->
                            <el-col :span="2" :offset="14">
                                <div>
                                    <el-button style="border-radius: 2px;" icon="Refresh" plain
                                        @click="getPersistentVolumes()">刷新</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>

            <!-- 数据表格 -->
            <el-col :span="24">
                <div>
                    <el-card class="persistentvolume-body-card" shadow="never" :body-style="{padding:'5px'}">
                        <!-- 数据表格 -->
                        <!-- v-loading用于加载时的loading动画 -->
                        <el-table style="width: 100%; font-size:12px; margin-bottom:10px" :data="persistentvolumeList" v-loading="appLoading">
                            <!-- 最左侧留出20px的宽度，更加美观 -->
                            <el-table-column width="20"></el-table-column>
                            <!-- persistentvolume名字 -->
                            <el-table-column align=left label="PV名">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <!-- <a href="" class="persistentvolume-body-persistentvolumename">{{scope.row.metadata.name}}</a> -->
                                    <a class="persistentvolume-body-persistentvolumename">{{scope.row.metadata.name}}</a>
                                </template>
                            </el-table-column>
                            <!-- 状态 -->
                            <el-table-column align=center label="状态">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <span :class="[scope.row.status.phase === 'Bound' ? 'success-status' : 'error-status']">{{ scope.row.status.phase }} </span>
                                </template>
                            </el-table-column>
                            <!-- 访问模式 -->
                            <el-table-column align=center label="访问模式">
                                <template v-slot="scope">
                                    <div v-for="(val, key) in scope.row.spec.accessModes" :key="key">
                                        <el-tag type="info" style="font-weight:700;"> {{ val }}</el-tag>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- 容量 -->
                            <el-table-column align=center prop="spec.capacity.storage" label="容量"></el-table-column>
                            <el-table-column align=center prop="spec.claimRef.name" label="PVC"></el-table-column>
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
                                    <el-button size="small" style="border-radius:2px;" icon="Edit" type="primary" plain @click="getPersistentVolumeDetail(scope)">YAML</el-button>
                                    <el-button size="small" style="border-radius:2px;" icon="Delete" type="danger" @click="handleConfirm(scope, '删除', delPersistentVolume)">删除</el-button>
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
                        class="persistentvolume-body-pagination" 
                        background 
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="pagesizeList"
                        :page-size="pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="persistentvolumeTotal">
                        </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>

        

        <!-- =================================新建============================= -->
        <!-- 抽屉：创建PersistentVolume的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-Drawer v-model="createPersistentVolumeDrawer"
        :direction="direction"
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>创建PersistentVolume</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="createPersistentVolume" :rules="createPersistentVolumeRules" :model="createPersistentVolume" label-width="80px">
                            <!-- prop用于rules中的校验规则的key -->
                            <el-form-item class="persistentvolume-create-form" label="名称" prop="name">
                                <el-input v-model="createPersistentVolume.name"></el-input>
                            </el-form-item>
                            <el-form-item class="persistentvolume-create-form" label="标签" prop="label_str">
                                <el-input v-model="createPersistentVolume.label_str" placeholder="示例: project=ms,app=gateway"></el-input>
                            </el-form-item>
                            
                        </el-form>
                    </el-col>
                </el-row>
            </template> 

            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="createPersistentVolumeDrawer = false">取消</el-button>
                <el-button type="primary" @click="submitForm('createPersistentVolume')">立即创建</el-button>
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
                    <el-button disabled type="primary" @click="updatePersistentVolume()">更 新</el-button>
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
            persistentvolumeValue: 'default',
            persistentvolumeList: [],
            persistentvolumeListUrl: common.k8sPersistentVolumeList,
            // 创建
            fullscreenLoading: false,
            createPersistentVolumeDrawer: false,
            direction: 'rtl',
            // 创建PersistentVolume的属性
            createPersistentVolume: {
                name: '',
                label_str: '',
                label: {},
                cluster: ''
            },
            // 发送请求的参数
            createPersistentVolumeData: {
                url: common.k8sPersistentVolumeCreate,
                params: {},
            },
            // 创建persistentvolume的表单校验规则
            createPersistentVolumeRules: {
                name: [{
                    required: true,
                    message: '请填写名称',
                    trigger: 'change'
                }],
                label_str: [{
                    required: false,
                    message: '请填写标签',
                    trigger: 'change'
                }]
            },

            // 表格列表
            persistentvolumeList: [],
            persistentvolumeTotal: 0, // 用于分页
            appLoading: false, // loading效果
            getPersistentVolumesData: {
                url: common.k8sPvList,
                params: {
                    filter_name: '',
                    persistentvolume: '',
                    page: 1,
                    limit: 10,
                    cluster: ''
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
            persistentvolumeDetail: {},
            getPersistentVolumeDetailData: {
                url: common.k8sPvDetail,
                params: {
                    pv_name: '',
                    cluster: ''
                }
            },
            // 更新
            updatePersistentVolumeData: {
                url: common.k8sStatefulSetUpdate,
                params: {
                    persistentvolume: '',
                    content: '',
                    cluster: ''
                }
            },

            // 删除persistentvolume
            deletePersistentVolumeData: {
                url: common.k8sPvDel,
                params: {
                    pv_name: '',
                    cluster: ''
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
            this.getPersistentVolumes()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getPersistentVolumes()
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

        // 创建PersistentVolume，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.createPersistentVolumeFunc()
                } else {
                    false
                }
            })
        },
        // 创建persistentvolume，加Func的原因是因为createPersistentVolume用于属性了
        createPersistentVolumeFunc(){
            if (this.createPersistentVolume.label_str !== ""){
                // 正则匹配，验证label的合法性
                let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
                if (!reg.test(this.createPersistentVolume.label_str)) {
                    this.$message.warning({
                        message: "标签填写异常，请确认后重新填写"
                    })
                    return
                }
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
            let a = (this.createPersistentVolume.label_str).split(',')
            a.forEach(item=>{
                let b = item.split('=')
                label[b[0]] = b[1]
            })
            
            // 赋值
            this.createPersistentVolumeData.params = this.createPersistentVolume
            this.createPersistentVolumeData.params.label = label

            // 发起请求
            httpClient.post(this.createPersistentVolumeData.url, this.createPersistentVolumeData.params).then(res=>{
                this.$message.success({
                    message: res.msg
                })
                // 创建后重新获取列表
                this.getPersistentVolumes()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            
            // 重置表单
            this.resetForm('createPersistentVolume')
            // 关闭加载动画
            this.fullscreenLoading = false
            // 关闭抽屉
            this.createPersistentVolumeDrawer = false
        },
        // 获取PersistentVolume列表
        getPersistentVolumes() {
            // 表格加载动画开启
            this.appLoading = true
            //getPersistentVolumesData是用于发起persistentvolume列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getPersistentVolumesData.params.filter_name = this.searchInput
            this.getPersistentVolumesData.params.page = this.currentPage
            this.getPersistentVolumesData.params.limit = this.pagesize
            this.getPersistentVolumesData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getPersistentVolumesData.url, {params: this.getPersistentVolumesData.params}).then(res => {
                this.persistentvolumeList = res.data.items
                this.persistentvolumeTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },
        // 获取PersistentVolume详情，e参数标识传入的scope插槽，.row是该行的数据
        getPersistentVolumeDetail(e){
            //getPersistentVolumesData是用于发起persistentvolume列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getPersistentVolumeDetailData.params.pv_name = e.row.metadata.name
            this.getPersistentVolumeDetailData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getPersistentVolumeDetailData.url, {params: this.getPersistentVolumeDetailData.params}).then(res => {
                //响应成功，获得persistentvolume详情
                this.persistentvolumeDetail = res.data
                //将对象转成yaml格式的字符串
                this.contentYaml = this.transYaml(this.persistentvolumeDetail)
                //打开弹出框
                this.yamlDialog = true
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 更新PersistentVolume
        updatePersistentVolume(){
            //将yaml格式的persistentvolume对象转为json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.updatePersistentVolumeData.params.content = content
            this.updatePersistentVolumeData.params.persistentvolume = this.persistentvolumeValue
            this.updatePersistentVolumeData.params.cluster = this.selectClusterValue
            httpClient.put(this.updatePersistentVolumeData.url, this.updatePersistentVolumeData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                //更新后重新获取列表
                this.getPersistentVolumes()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            //关闭弹出框
            this.yamlDialog = false
        },

        // 删除persistentvolume
        delPersistentVolume(e){
            this.deletePersistentVolumeData.params.pv_name = e.row.metadata.name 
            this.deletePersistentVolumeData.params.cluster = this.selectClusterValue
            httpClient.delete(this.deletePersistentVolumeData.url, {data: this.deletePersistentVolumeData.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后重新获取列表
                this.getPersistentVolumes()
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
                //restartPersistentVolume(e)或者delPersistentVolume(e)
                fn(obj)
            }).catch(()=>{
                this.$message.info({
                    message: '已取消操作'
                })
            })
        },
        // 计算persistentvolume的规格
        specTrans(str) {
            if ( str.indexOf('Ki') == -1 ) {
                return str
            }
            let num = str.slice(0,-2) / 1024 / 1024
            return num.toFixed(0)
        },
    },

    watch: {
        //监听persistentvolume的值,若发生变化，则执行handler方法中的内容
        persistentvolumeValue: {
            handler(){
                //将persistentvolume的值存入本地，用于path切换时依旧能获取得到
                localStorage.setItem('persistentvolume', this.persistentvolumeValue)
                //重置当前页为1
                this.currentPage = 1
                //获取persistentvolume列表
                this.getPersistentVolumes()
            }
        },
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getPersistentVolumes()
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
        //加载页面时先获取localStorage中的persistentvolume值，若获取不到则默认default
        if (localStorage.getItem('persistentvolume') !== undefined && localStorage.getItem('persistentvolume') != null) {
            this.persistentvolumeValue = localStorage.getItem('persistentvolume')
        }
        this.getPersistentVolumes()
    }
}
</script>


<style scoped>
/* 卡片属性 */
.persistentvolume-head-card,
.persistentvolume-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}
/* 搜索框 */
.persistentvolume-head-search{
    width: 160px;
    margin-right: 10px;
}
/* 数据表格persistentvolume名颜色 */
.persistentvolume-body-persistentvolumename {
    color: #4795EE;
}
    /* persistentvolume名鼠标悬停 */
.persistentvolume-body-persistentvolumename:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
}
.success-status {
    color: rgb(27, 202, 21);
}

.warning-status {
    color: rgb(233, 200, 16);
}

.error-status {
    color: rgb(226, 23, 23);
}

</style>