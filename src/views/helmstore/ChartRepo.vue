<template>
    <div class="chartRepo">
        <el-row>
            <!-- 头部1 -->
            <el-col :span="24">
                <div>
                    <el-card class="release-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <!-- 1.1 搜索输入框、新增、刷新-->
                        <el-row justify="end" style="margin-bottom: 20px;">
                            <el-col :span="6" style="display: flex;">
                                <div style="display: flex; margin-right:10px;">
                                        <!-- 搜索输入框 -->
                                        <el-input class="event-head-search" 
                                        clearable placeholder="请输入资源名"
                                        v-model="searchValue">
                                        <template #append style="background-color: var(--el-fill-color-blank); ">
                                            <el-button  icon="Search" @click="getChartList()"></el-button>
                                          </template>
                                        </el-input>
                         
                                </div>
                                <div style="margin-right: 10px;">
                                    <el-button style="border-radius: 2px;" icon="Plus" type="primary" plain @click="handleAdd()">新增</el-button>
                                </div>
                                <div>
                                    <el-button style="border-radius: 2px;" icon="Refresh" type="primary" plain @click="getChartList()">刷新</el-button>
                                </div>
                                
                            </el-col>
                        </el-row>
                        
                        <!-- Chart列表 -->
                        <el-row :gutter="10" style="margin-bottom: 10px;">
                            <template v-for="item, index in chartList" :key="index" v-loading="appLoading">
                                <el-col :span="6" style="margin-bottom: 10px;">
                                    <el-card :body-style="{padding:'10px' }" >
                                        <!-- 图标 -->
                                        <div style="float:left;margin-right:20px;padding:20px">
                                            <img style="width: 60px;" :src="item.icon_url" alt="">
                                        </div>
                                        <!-- 名字和描述 -->
                                        <div>
                                            <a style="font-size: 16px; font-weight:bold;">{{ item.name }}</a><br>
                                            <template v-if="item.describe.length >=20" >
                                                <el-popover
                                                    placement="top-start"
                                                    :width="200"
                                                    trigger="hover"
                                                    :content="item.describe">
                                                    <template #reference>
                                                        <p class="chart-describe" style="font-size:12px;">简介: {{ item.describe }}</p>
                                                    </template>
                                                </el-popover>
                                            </template>
                                            <p v-else style="font-size:12px;">简介: {{ item.describe }}</p>
                                        </div>
                                        <!-- 版本和操作 -->
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="font-size: 12px;">版本: {{ item.version }}</span>
                                            <el-dropdown trigger="click" size="small">
                                                <span class="el-dropdown-link" style="font-size: 12px;">
                                                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                                </span>
                                                <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="handleInstall(item)">安装</el-dropdown-item>
                                                    <el-dropdown-item @click="handleUpdate(item)">编辑</el-dropdown-item>
                                                    <el-dropdown-item @click="showConfirm(item, '删除',  delChartFunc)">删除</el-dropdown-item>
                                                </el-dropdown-menu>
                                                </template>
                                            </el-dropdown>
                                        </div>
                                    </el-card>
                                </el-col>
                            </template>
                        </el-row>
                        <el-pagination 
                            style="float:right; margin: 20px 0 10px 0;"
                            background 
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page="currentPage"
                            :page-sizes="pagesizeList"
                            :page-size="pagesize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="pageTotal">
                            </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>

        <!-- =================================新建============================= -->
        <!-- 抽屉：创建Chart的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-dialog v-model="addChartDialog"
        width="40%"
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>新增Chart</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="addChart" :rules="addChartRules" :model="addChart" label-width="80px">
                            <el-form-item  label="Chart名" prop="name">
                                <el-input v-model="addChart.name"></el-input>
                            </el-form-item>
                            <el-form-item  label="版本" prop="version">
                                <el-input v-model="addChart.version"></el-input>
                            </el-form-item>
                            <el-form-item  label="Icon图标" prop="icon">
                                <el-input v-model="addChart.icon_url">
                                    <template #prepend>https://</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item  label="描述" prop="describe">
                                <el-input v-model="addChart.describe" type="textarea"></el-input>
                            </el-form-item>
                            <el-form-item label="上传Chart" name="chartFile">
                                <el-upload
                                v-model:file-list="fileList"
                                :limit="3"
                                name="chart"
                                action=""
                                :http-request="uploadFile"
                                :on-remove="handleRemove"
                                >
                                <el-button type="primary">Click to upload</el-button>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template> 
            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="addChartDialog = false">取消</el-button>
                <el-button type="primary" @click="submitForm('addChart')">立即创建</el-button>
            </template>
        </el-dialog>

        <!-- =================================编辑============================= -->
        <el-dialog v-model="updateModal"
        width="40%"
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>编辑Chart</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="updatChart" :rules="updateChartRules" :model="updatChart" label-width="80px">
                            <el-form-item  label="Chart名" prop="name">
                                <el-input disabled v-model="updatChart.name"></el-input>
                            </el-form-item>
                            <el-form-item  label="版本" prop="version">
                                <el-input v-model="updatChart.version"></el-input>
                            </el-form-item>
                            <el-form-item  label="Icon图标" prop="icon">
                                <el-input v-model="updatChart.icon_url">
                                    <template #prepend>https://</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item  label="描述" prop="describe">
                                <el-input v-model="updatChart.describe" type="textarea"></el-input>
                            </el-form-item>
                            <el-form-item label="上传Chart" name="chartFile">
                                <el-upload
                                v-model:file-list="fileList"
                                :limit="3"
                                name="chart"
                                action=""
                                :http-request="uploadFile"
                                :on-remove="handleRemove"
                                >
                                <el-button type="primary">Click to upload</el-button>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template> 
            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="updateModal = false">取消</el-button>
                <el-button type="primary" @click="submitFormToUpdate('updatChart')">更新</el-button>
            </template>
        </el-dialog>

        <!-- =================================安装============================ -->
        <el-dialog v-model="installModal"
        width="40%"
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>安装</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="installRelease" :rules="installReleaseRules" :model="installRelease" label-width="130px">
                            <el-form-item  label="Release名" prop="release">
                                <el-input v-model="installRelease.release"></el-input>
                            </el-form-item>
                            <el-form-item class="deploy-create-form" label="请选择命名空间" prop="namespace">
                                <el-select v-model="installRelease.namespace" filterable placeholder="请选择">
                                    <el-option v-for="(item, index) in namespaceList" :key="index"
                                        :label="item.metadata.name" :value="item.metadata.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item  label="Chart" prop="chartName">
                                <el-input disabled v-model="installRelease.chartName"></el-input>
                            </el-form-item>
                            <el-form-item  label="Chart文件" prop="chartFile">
                                <el-input disabled v-model="installRelease.chartFile"></el-input>
                            </el-form-item>
                            <el-form-item  label="集群" prop="cluster">
                                <el-input disabled v-model="installRelease.cluster"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template> 
            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="installModal = false">取消</el-button>
                <el-button type="primary" @click="submitFormToInstall('installRelease')">安装</el-button>
            </template>
        </el-dialog>



    </div>
</template>

<script>
import common from "../common/Config"
import httpClient from "@/utils/request"

export default {
    data() {
        return {
            // 当前选中的cluster
            selectClusterValue: localStorage.getItem('k8s_cluster'),
            // 命名空间
            namespaceValue: 'default',
            namespaceList: [],
            namespaceListUrl: common.k8sNamespaceList,
            // 搜索
            searchValue: "",
            // 所有的chart列表
            appLoading: false,
            chartList: [],
            chartListData: {
                url: common.helmChartList,
                params: {
                    name: '',
                    page: 1,
                    limit: 9,
                },
            },
            // 分页  
            currentPage: 1,
            pagesize: 10,
            pageTotal: 0,
            pagesizeList: [10, 20, 30],

            // 新增Chart的Dialog窗口开关
            addChartDialog: false,
            // 新增Chart的属性
            addChart: {
                name: '',
                icon_url: '',
                version: '',
                describe: '',
                file_name: ''
            },
            addChartData: {
                url: common.helmChartAdd,
                params: {
                    name: '',
                    icon_url: '',
                    version: '',
                    describe: '',
                    file_name: ''
                }
            },
            // 新增Chart的校验规则
            addChartRules: {
                name: [{required: true, message: '请输入Chart名', trigger: 'change'}],
                version: [{required: true, message: '请输入版本', trigger: 'change'}],
                icon_url: [{required: true, message: '请输入图标地址', trigger: 'change'}],
                describe: [{required: true, message: '请填写Chart描述', trigger: 'change'}],
            },
            // 编辑Chart的Dialog窗口开关
            // 编辑Chart的属性
            updatChart: {
                id: 0,
                name: '',
                icon_url: '',
                version: '',
                describe: '',
                file_name: ''
            },
            updateChartData: {
                url: common.helmChartUpdate,
                params: {
                    id: 0,
                    name: '',
                    icon_url: '',
                    version: '',
                    describe: '',
                    file_name: ''
                }
            },
            updateChartRules: {
                name: [{required: true, message: '请输入Chart名', trigger: 'change'}],
                version: [{required: true, message: '请输入版本', trigger: 'change'}],
                icon_url: [{required: true, message: '请输入图标地址', trigger: 'change'}],
                describe: [{required: true, message: '请填写Chart描述', trigger: 'change'}],
            },
            updateModal: false,

            // 安装
            installModal: false,
            installRelease: {
                release: '',
                namespace: '',
                cluster: '',
                chartName: '',
                chartFile: ''
            },
            installReleaseData: {
                url: common.helmReleaseInstall,
                params: {
                    release: '',
                    namespace: '',
                    cluster: '',
                    chart: ''
                }
            },
            installReleaseRules: {
                release: [{required: true, message: '请输入Release名', trigger: 'change'}],
                namespace: [{required: true, message: '请选择命名空间', trigger: 'change'}],
                chartName: [{required: true, message: '请输入Chart名', trigger: 'change'}],
                chartFile: [{required: true, message: '请输入Chart文件名', trigger: 'change'}],
                cluster: [{required: true, message: '请输入集群名', trigger: 'change'}],

            },

            // 删除Chart
            deleteChart: {
                url: common.helmChartDel,
                params: {
                    id: '',
                    file_name: '',
                }
            },

            // 上传文件
            fileList: [],
            fileUploadUrl: common.helmChartFileUpload,

            // 删除文件
            fileDeleteData: {
                url: common.helmChartFileDel,
                params: {
                    chart: ''
                }
            },

        }
    },

    methods: {
        // 新增Chart
        handleAdd(){
            // 当点击新增时候，设置dialog窗口为true
            this.addChartDialog = true
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
        // 获取ChartList
        getChartList(){
            this.appLoading = true
            if (this.searchValue) {
                this.currentPage = 1
            }
            this.chartListData.params.name = this.searchValue
            this.chartListData.params.page = this.currentPage
            this.chartListData.params.limit = this.pagesize
            httpClient.get(this.chartListData.url, {params: this.chartListData.params}).then(res=>{
                // 响应成功，获取chart列表和total
                this.chartList = res.data.items
                this.pageTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 分页, 页面大小发生变化时触发，赋值并重新获取列表
        handleSizeChange(size) {
            this.pagesize = size
            this.getChartList()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getChartList()
        }, 
        // 安装
        handleInstall(item){
            this.installRelease.cluster = this.selectClusterValue
            this.installRelease.chartName = item.name
            this.installRelease.chartFile = item.file_name
            this.installModal = true
        },
        handleUpdate(item){
            this.updatChart.id = item.id
            this.updatChart.name = item.name
            this.updatChart.icon_url = (item.icon_url).split('https://')[1]
            this.updatChart.version = item.version
            this.updatChart.describe = item.describe
            this.updatChart.file_name = item.file_name
            this.updateModal = true
        },
        // 删除弹出提示框，用于警示作用
        showConfirm(obj, operateName, fn){
            this.confirmContent = '确认继续' + operateName + '操作吗？'
            // $confirm用于弹出确认框
            this.$confirm(this.confirmContent, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(()=>{
                //restartDeployment(e)或者delDeployment(e)
                fn(obj)
            }).catch(()=>{
                this.$message.info({
                    message: '已取消操作'
                })
            })
        },
        // 删除chart
        delChartFunc(e){
            // 赋值
            this.deleteChart.params.id = e.id
            this.deleteChart.params.file_name = e.file_name
            // 调用后端接口进行删除操作
            httpClient.delete(this.deleteChart.url, {data: this.deleteChart.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后刷新列表
                this.getChartList()
            }).catch(res => {
                this.$message.success({
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

        // 创建Chart，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.handleAddChartFunc()
                } else {
                    false
                }
            })
        },
        // 新增Chart，这里真正进行上传
        handleAddChartFunc(){
            // 首先校验文件是否上传，如果没有上传，不允许新增
            if (!this.fileList.length){
                this.$message.warning({
                    message: "未上传Chart文件,请上传"
                })
            }
            // 赋值
            this.addChartData.params = this.addChart
            this.addChartData.params.icon_url = 'https://' + this.addChart.icon_url
            // 调用后端接口，进行新增
            httpClient.post(this.addChartData.url, this.addChartData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 新增成功后，重新获取列表
                this.getChartList()
            }).catch(res => {
                this.$message.success({
                    message: res.msg
                })
            })
            // 重置表单
            this.resetForm('addChart')
            // 关闭抽屉
            this.addChartDialog = false
        },

        // 更新Chart，提交表单，校验参数合法性
        submitFormToUpdate(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.handleUpdateChartFunc()
                } else {
                    false
                }
            })
        },
        // 更新Chart，这里实现真正掉后端接口进行更新
        handleUpdateChartFunc(){
            this.updateChartData.params = this.updatChart
            this.updateChartData.params.icon_url = 'https://' + this.updatChart.icon_url
            // 调用后端接口，进行新增
            httpClient.put(this.updateChartData.url, this.updateChartData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
            }).catch(res => {
                this.$message.success({
                    message: res.msg
                })
            }).finally(() =>{
                // 重新获取列表
                this.getChartList()
                // 重置表单
                this.resetForm('updatChart')
                // 关闭抽屉
                this.updateModal = false
                this.fileList.pop() 
            })
        },
        
        // 安装Release 提交表单，校验参数是否合法
        submitFormToInstall(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.installReleaseFunc()
                } else {
                    false
                }
            })
        },
        // 安装Release 调用后端接口，安装
        installReleaseFunc(){
            // 赋值
            this.installReleaseData.params.release = this.installRelease.release
            this.installReleaseData.params.namespace = this.installRelease.namespace
            this.installReleaseData.params.cluster = this.installRelease.cluster
            this.installReleaseData.params.chart = this.installRelease.chartFile
            // 调用后端接口进行安装
            httpClient.post(this.installReleaseData.url, this.installReleaseData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
            }).catch(res => {
                this.$message.success({
                    message: res.msg
                })
            }).finally(() =>{
                // // 重新获取列表
                // this.getChartList()
                // 重置表单
                this.resetForm('installRelease')
                // 关闭抽屉
                this.installModal = false
            })
        },

        // 上传文件
        uploadFile(data){
            if (this.fileList.length > 1){
                this.fileList.pop()
                this.$message.warning({
                    message: "最大上传文件数为1, 请删除后重新上传"
                })
                return
            }
            let formData = new FormData()
            formData.append('chart', data.file)
            httpClient.post(this.fileUploadUrl, formData).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 上传成功了，给新增chart的参数的name赋值, 首先判断是新增时上次文件还是更新上传的文件
                if (this.addChartDialog){
                    this.addChart.file_name = data.file.name
                }
                if (this.updateModal){
                    this.updatChart.file_name = data.file.name
                }
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
                 // 用于重复上传文件的清空前端展示
                 this.fileList.pop()
            })
        },

        // 重置表单方法 
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },

        // 用于前端删除按钮的文件删除——文件上传时的remove
        handleRemove(file){
            this.deleteFile(file.name)
        },

        // 删除文件
        deleteFile(fileName){
            this.fileDeleteData.params.chart = fileName
            httpClient.delete(this.fileDeleteData.url, {data: this.fileDeleteData.params}).then(res => {
                this.$message.success({
                    message: res.msg
                })
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
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
                // 这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
                _this.getNamespaceList()
            }
        })
    },

    beforeMount(){
        if (localStorage.getItem('namespace') !== undefined && localStorage.getItem('namespace') !== null) {
            this.namespaceValue = localStorage.getItem('namespace')
        }
        this.getNamespaceList()
        this.getChartList()
    }
}

</script>

<style scoped>
.chart-describe{
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>