<template>
    <div class="release">
        <el-row>
            <!-- 1 头部1 -->
            <el-col :span="24">
                <div>
                    <el-card class="release-head-card" shadow="never" :body-style="{ padding: '10px' }">
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
                            <!-- 1.2 搜索输入框和搜索按钮 -->
                            <el-col :span="6">
                                <div style="display: flex;">
                                    <!-- 搜索输入框 -->
                                    <el-input class="release-head-search" clearable placeholder="请输入" v-model="searchInput"></el-input>
                                    <!-- 搜索按钮 -->
                                    <el-button style="border-radius:2px;" icon="Search" type="primary" plain @click="getReleases()">搜索</el-button>
                                </div>
                            </el-col>
                            <!-- 1.3 刷新按钮 -->
                            <el-col :span="2" :offset="10">
                                <div>
                                    <el-button style="border-radius: 2px;" icon="Refresh" plain @click="getReleases()">刷新</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>

            <!-- 数据表格 -->
            <el-col :span="24">
                <div>
                    <el-card class="release-body-card" shadow="never" :body-style="{padding:'5px'}">
                        <!-- 数据表格 -->
                        <!-- v-loading用于加载时的loading动画 -->
                        <el-table style="width: 100%; font-size:12px; margin-bottom:10px" :data="releaseList" v-loading="appLoading">
                            <!-- 最左侧留出20px的宽度，更加美观 -->
                            <el-table-column width="20"></el-table-column>
                            <!-- release名字 -->
                            <el-table-column align=left label="Release名">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <!-- <a href="" class="release-body-releasename">{{scope.row.metadata.name}}</a> -->
                                    <a class="release-body-releasename">{{scope.row.name}}</a>
                                </template>
                            </el-table-column>
                            <!-- 状态 -->
                            <el-table-column align="center" label="状态">
                                <!-- <template v-slot="scope">
                                    <span> {{ scope.row.status }} </span>
                                </template> -->
                                <template v-slot="scope">
                                    <div :class="{
                                        'success-dot': scope.row.status == 'deployed', 
                                        'warning-dot': scope.row.status != 'deployed' && scope.row.status.phase != 'failed',
                                        'error-dot': scope.row.status == 'failed' 
                                    }"></div>
                                    <span :class="{
                                        'success-status': scope.row.status == 'deployed', 
                                        'warning-status': scope.row.status != 'deployed'  && scope.row.status.phase != 'failed', 
                                        'error-status': scope.row.status == 'failed'
                                    }">{{ scope.row.status }}
                                    </span>
                                </template>
                            </el-table-column>
                            
                           <!-- Chart -->
                           <el-table-column align="center" label="Chart">
                            <template v-slot="scope">
                                <a class="release-body-releasename">{{scope.row.chart}}</a>
                                <!-- <span> {{ scope.row.chart }} </span> -->
                            </template>
                            </el-table-column>
                            <!-- Chart版本 -->
                           <el-table-column align="center" label="Chart版本">
                            <template v-slot="scope">
                                <el-tag color="geekblue">{{ scope.row.chart_version }}</el-tag>
                            </template>
                            </el-table-column>
                            <!-- Revision -->
                           <el-table-column align="center" label="Revision">
                            <template v-slot="scope">
                                <!-- <el-tag color="gray">{{ scope.row.chart_version }}</el-tag> -->
                                <span> {{ scope.row.app_version }} </span>
                            </template>
                            </el-table-column>
                            <!-- 更新时间 -->
                            <el-table-column align=center min-width="100" label="更新时间">
                                <!-- timeTrans函数用于将格林威治时间转成北京时间 -->
                                <template v-slot="scope">
                                    <el-tag type="info">{{ timeTrans(scope.row.updated) }} </el-tag>
                                </template>
                            </el-table-column>
                           
                            <!-- 操作列，放按钮 -->
                            <el-table-column align=center label="操作" width="400">
                                <template v-slot="scope">
                                    <el-button size="small" style="border-radius:2px;" icon="Edit" type="primary" plain @click="getReleaseDetail(scope)">YAML</el-button>
                                    <el-button size="small" style="border-radius:2px;" icon="Delete" type="danger" @click="handleConfirm(scope, '卸载', unInstallRelease)">卸载</el-button>
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
                        class="release-body-pagination" 
                        background 
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="pagesizeList"
                        :page-size="pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="releaseTotal">
                        </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>


        <!-- =================================YAML============================= -->
        <!-- 展示YAML信息的弹框 -->
        <el-dialog
        title="YAML信息"
        v-model="yamlDialog"
        width="45%"
        top="2%">
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
                    <el-button type="primary" disabled @click="updateRelease()">更 新</el-button>
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
            createReleaseDrawer: false,
            direction: 'rtl',

            // 表格列表
            releaseList: [],
            releaseTotal: 0, // 用于分页
            appLoading: false, // loading效果
            getReleasesData: {
                url: common.helmReleaseList,
                params: {
                    filter_name: '',
                    namespace: '',
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
            releaseDetail: {},
            getReleaseDetailData: {
                url: common.helmReleaseDetail,
                params: {
                    release: '',
                    namespace: '',
                    cluster: ''
                }
            },
            // 卸载release
            unInstallReleaseData: {
                url: common.helmReleaseUninstall,
                params: {
                    namespace: '',
                    release: '',
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
            this.getReleases()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getReleases()
        }, 
        // 字符串截取、拼接并返回
        ellipsis(value){
            return value.length > 15 ? value.substring(0,15)+"...":value
        },
        
        //数据库查询时间转为北京时间
        timeTrans(date) {
            date = date.substring(0, 19).replace('T', ' ')
            date = date.substring(0, 19).replace('+08:00', '')
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

        // 创建Release，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.createReleaseFunc()
                } else {
                    false
                }
            })
        },
        // 创建release，加Func的原因是因为createRelease用于属性了
        createReleaseFunc(){
            // 正则匹配，验证label的合法性
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.createRelease.label_str)) {
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
            let a = (this.createRelease.label_str).split(',')
            a.forEach(item=>{
                let b = item.split('=')
                label[b[0]] = b[1]
            })
            //将release的规格转成cpu和memory
            let resourceList = this.createRelease.resource.split("/")
            cpu = resourceList[0]
            memory = resourceList[1] + "Gi"

            // 赋值
            this.createReleaseData.params = this.createRelease
            this.createReleaseData.params.container_port = parseInt(this.createRelease.container_port)
            this.createReleaseData.params.label = label
            this.createReleaseData.params.cpu = cpu
            this.createReleaseData.params.memory = memory
            this.createReleaseData.params.cluster = this.selectClusterValue

            // 发起请求
            httpClient.post(this.createReleaseData.url, this.createReleaseData.params).then(res=>{
                this.$message.success({
                    message: res.msg
                })
                // 创建后重新获取列表
                this.getReleases()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            
            // 重置表单
            this.resetForm('createRelease')
            // 关闭加载动画
            this.fullscreenLoading = false
            // 关闭抽屉
            this.createReleaseDrawer = false
        },
        // 获取Release列表
        getReleases() {
            // 表格加载动画开启
            this.appLoading = true
            //getReleasesData是用于发起release列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getReleasesData.params.filter_name = this.searchInput
            this.getReleasesData.params.namespace = this.namespaceValue
            this.getReleasesData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getReleasesData.url, {params: this.getReleasesData.params}).then(res => {
                this.releaseList = res.data.items
                this.releaseTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },
        // 获取Release详情，e参数标识传入的scope插槽，.row是该行的数据
        getReleaseDetail(e){
            //getReleasesData是用于发起release列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getReleaseDetailData.params.namespace = this.namespaceValue
            this.getReleaseDetailData.params.release = e.row.name
            this.getReleaseDetailData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getReleaseDetailData.url, {params: this.getReleaseDetailData.params}).then(res => {
                //响应成功，获得release详情
                this.releaseDetail = res.data
                //将对象转成yaml格式的字符串
                this.contentYaml = this.transYaml(this.releaseDetail)
                //打开弹出框
                this.yamlDialog = true
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },

        // 卸载release
        unInstallRelease(e){
            this.unInstallReleaseData.params.namespace = this.namespaceValue
            this.unInstallReleaseData.params.release = e.row.name 
            this.unInstallReleaseData.params.cluster = this.selectClusterValue
            httpClient.delete(this.unInstallReleaseData.url, {data: this.unInstallReleaseData.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后重新获取列表
                this.getReleases()
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
                //restartRelease(e)或者delRelease(e)
                fn(obj)
            }).catch(()=>{
                this.$message.info({
                    message: '已取消操作'
                })
            })
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
                //获取release列表
                this.getReleases()
            }
        },
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getNamespaceList()
                this.getReleases()
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
        this.getReleases()
    }
}
</script>


<style scoped>
/* 卡片属性 */
.release-head-card,
.release-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}
/* 搜索框 */
.release-head-search{
    margin-right: 10px;
}
/* 数据表格release名颜色 */
.release-body-releasename {
    color: #4795EE;
}
    /* release名鼠标悬停 */
.release-body-releasename:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
}

/*状态样式*/
.success-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: rgb(27, 202, 21);
    border-radius: 50%;
    border: 1px solid rgb(27, 202, 21);
    margin-right: 10px;
}

.warning-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: rgb(233, 200, 16);
    border-radius: 50%;
    border: 1px solid rgb(233, 200, 16);
    margin-right: 10px;
}

.error-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: rgb(226, 23, 23);
    border-radius: 50%;
    border: 1px solid rgb(226, 23, 23);
    margin-right: 10px;
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