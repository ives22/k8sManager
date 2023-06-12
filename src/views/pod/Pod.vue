<template>
    <div class="pod">
        <el-row>
            <!-- 1 头部1 -->
            <el-col :span="24">
                <div>
                    <el-card class="pod-head-card" shadow="never" :body-style="{ padding: '10px' }">
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
                                    <el-button style="border-radius: 2px;" icon="Refresh" plain
                                        @click="getPods()">刷新</el-button>
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
                    <el-card class="pod-head-card" shadow="never" :body-style="{ padding: '10px' }">
                        <el-row>
                            <!-- 创建按钮 -->
                            <el-col :span="2">
                                <div>
                                    <!-- 点击后打开抽屉，填入创建pod需要的数据 -->
                                    <el-button disabled style="border-radius:2px;" icon="Edit" type="primary"
                                        v-loading.fullscreen.lock="fullscreenLoading"
                                        @click="createPodDrawer = true">创建</el-button>
                                </div>
                            </el-col>
                            <!-- 搜索输入框和搜索按钮 -->
                            <el-col :span="6">
                                <div>
                                    <!-- 搜索输入框 -->
                                    <el-input class="pod-head-search" clearable placeholder="请输入"
                                        v-model="searchInput"></el-input>
                                    <!-- 搜索按钮 -->
                                    <el-button style="border-radius:2px;" icon="Search" type="primary" plain
                                        @click="getPods()">搜索</el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-col>


            <!-- 数据表格 -->
            <el-col :span="24">
                <div>
                    <el-card class="pod-body-card" shadow="never" :body-style="{ padding: '5px' }">
                        <!-- 数据表格 -->
                        <!-- row-key 用来定义行数据的key，结合expand-row-keys使用，往expandKeys中增加key来展开行 -->
                        <!-- expand-row-keys 展开的行的key数组 -->
                        <!-- expand-change 展开触发时，调用这个方法 -->
                        <!-- v-loading用于加载时的loading动画 -->
                        <el-table style="width: 100%; font-size:12px; margin-bottom:10px" 
                        :data="podList"
                        v-loading="appLoading"
                        :row-key="getRowKeys"
                        :expand-row-keys="expandKeys"
                        @expand-change="expandChange">
                            <!-- 最左侧留出10px的宽度，更加美观 -->
                            <el-table-column width="10"></el-table-column>
                            <!-- 展开 -->
                            <el-table-column type="expand">
                                <!-- 插槽，里面是展开的内容,props标识展开的行的数据 -->
                                <template #default="props">
                                    <el-tabs v-model="activeName" type="card">
                                        <!-- tab容器标签页 -->
                                        <el-tab-pane label="容器" name="container">
                                            <el-card shadow="never" style="border-radius:1px;" :body-style="{padding:'5px'}">
                                                <!-- 嵌套数据表格 -->
                                                <el-table
                                                style="width:100%;font-size:12px;"
                                                :data="props.row.spec.containers">
            
                                                    <el-table-column align=left prop="name" label="容器名"></el-table-column>
                                                    <el-table-column align=left prop="image" label="镜像"></el-table-column>
                                                    <el-table-column align=center label="Pod IP">
                                                        <span>{{ props.row.status.podIP }}</span>
                                                    </el-table-column>
                                                    <el-table-column align=center prop="args" label="启动命令"></el-table-column>
                                                    <el-table-column align=center label="环境变量">
                                                        <template v-slot="scope"> 
                                                            <!-- 气泡弹出框，内容是所有的环境变量 -->
                                                           <el-popover :width="500" placement="left" trigger="hover">
                                                                <el-table style="width:100%;font-size:12px;" size="small" :show-header="false" :data="scope.row.env">
                                                                    <el-table-column property="name" label="名称"></el-table-column>
                                                                    <el-table-column property="value" label="值"></el-table-column>
                                                                </el-table>
                                                                <template #reference>
                                                                <el-button size="small">此处查看</el-button>
                                                                </template>
                                                            </el-popover>
                                                        </template>
                                                    </el-table-column> 
                                                </el-table>
                                            </el-card>
                                        </el-tab-pane>
                                        
                                        <!-- tab日志标签页 -->
                                        <el-tab-pane label="日志" name="log">
                                            <el-card shadow="never" style="border-radius:1px;" :body-style="{padding:'5px'}">
                                                <el-row :gutter="11">
                                                    <el-col :span="3">
                                                        <!-- 容器选择框 -->
                                                        <el-select size="small" v-model="containerValue" placeholder="请选择">
                                                            <el-option v-for="item in containerList" :key="item" :value="item">
                                                            </el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <!-- 查看日志按钮 -->
                                                        <el-button style="border-radius:2px;" size="small" type="primary" @click="getPodLog(props.row.metadata.name)">查看</el-button>
                                                    </el-col>
                                                    <el-col :span="3">
                                                        <!-- 是否自动刷新日志 -->
                                                        <span style="vertical-align: middle; font-size:12px">自动刷新：</span>
                                                        <el-switch
                                                            v-model="activeLog"
                                                            class="ml-2"
                                                            size="default"
                                                            inline-prompt
                                                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; height: 23px; vertical-align: middle;"
                                                            active-text="Y"
                                                            inactive-text="N"
                                                        />
                                                    </el-col>
                                                    <el-col :span="1">
                                                        <!-- 自动刷新间隔框 -->
                                                        <el-select size="small" v-model="activeLogInterval" placeholder="请选择">
                                                            <el-option v-for="item in activeLogItems" :key="item" :value="item">
                                                            </el-option>
                                                        </el-select>
                                                    </el-col>

                                                    <el-col :span="24" style="margin-top: 5px">
                                                        <!-- 显示日志内容 -->
                                                        <el-card shadow="never" class="pod-body-log-card" :body-style="{padding:'5px'}">
                                                            <span class="pod-body-log-span">{{ logContent }}</span>
                                                        </el-card>
                                                    </el-col>
                                                 </el-row>
                                            </el-card>
                                        </el-tab-pane>
                                        <!-- tab终端标签页 -->
                                        <el-tab-pane label="终端" name="shell">
                                            <el-card shadow="never" style="border-radius:1px;" :body-style="{padding:'5px'}">
                                                <el-row :gutter="10">
                                                    <el-col :span="3">
                                                        <!-- 容器选择框 -->
                                                        <el-select size="small" v-model="containerValue" placeholder="请选择">
                                                            <el-option v-for="item in containerList" :key="item" :value="item">
                                                            </el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="1">
                                                        <!-- 连接按钮 -->
                                                        <el-button style="border-radius:2px;" size="small" type="primary" @click="initSocket(props.row)">连接</el-button>
                                                    </el-col>
                                                    <el-col :span="1">
                                                        <!-- 关闭连接按钮 -->
                                                        <el-button style="border-radius:2px;" size="small" type="danger" @click="closeSocket()">关闭</el-button>
                                                    </el-col>
                                                    <el-col :span="24" style="margin-top: 5px">
                                                        <el-card shadow="never" class="pod-body-shell-card" :body-style="{padding:'5px'}">
                                                            <!-- xterm虚拟终端 -->
                                                            <div id="xterm"></div>
                                                        </el-card>
                                                    </el-col>
                                                 </el-row>
                                            </el-card>
                                        </el-tab-pane>
                                    </el-tabs>
                                </template>
                            </el-table-column>

                            <!-- pod名字 -->
                            <el-table-column align=left label="Pod名">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                   <!-- 三元运算：expandMap[scope.row.metadata.name]为1则触发关闭（expandedRows为空数组），为0则触发展开expandedRows有值 -->
                                   <a class="pod-body-podname" @click="expandMap[scope.row.metadata.name] ? expandChange(scope.row, []) : expandChange(scope.row, [scope.row])">
                                        {{scope.row.metadata.name }}
                                    </a>
                                    <!-- <a class="pod-body-podname">{{ scope.row.metadata.name }}</a> -->
                                </template>
                            </el-table-column>

                            <!-- 节点名字 -->
                            <el-table-column align=center min-width="150" label="节点">
                                <!-- 插槽，scope.row获取当前行的数据 -->
                                <template v-slot="scope">
                                    <!-- <a href="" class="pod-body-podname">{{scope.row.metadata.name}}</a> -->
                                    <el-tag v-if="scope.row.spec.nodeName !== undefined"
                                        type="warning">{{ scope.row.spec.nodeName }}</el-tag>
                                </template>
                            </el-table-column>
                            
                            <!-- 状态 -->
                            <el-table-column align=center label="状态">
                                <template v-slot="scope">
                                    <div :class="{
                                        'success-dot': scope.row.status.phase == 'Running', 
                                        'warning-dot': scope.row.status.phase == 'Pending', 
                                        'error-dot': scope.row.status.phase != 'Running' && scope.row.status.phase != 'Pending'
                                    }"></div>
                                    <span :class="{
                                        'success-status': scope.row.status.phase == 'Running', 
                                        'warning-status': scope.row.status.phase == 'Pending', 
                                        'error-status': scope.row.status.phase != 'Running' && scope.row.status.phase != 'Pending'
                                    }">{{ scope.row.status.phase }}
                                    </span>
                                </template>
                            </el-table-column>
                           
                            <!-- 重启数 -->
                            <el-table-column align=center label="重启数">
                                <template v-slot="scope">
                                    <span>{{ restartTotal(scope) }}</span>
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
                                    <el-button size="small" style="border-radius:2px;" icon="Edit" type="primary" plain
                                        @click="getPodDetail(scope)">YAML</el-button>
                                    <el-button size="small" style="border-radius:2px;" icon="Delete" type="danger"
                                        @click="handleConfirm(scope, '删除', delPod)">删除</el-button>
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
                        <el-pagination class="pod-body-pagination" background @size-change="handleSizeChange"
                            @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pagesizeList"
                            :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="podTotal">
                        </el-pagination>
                    </el-card>
                </div>
            </el-col>
        </el-row>



        <!-- =================================新建============================= -->
        <!-- 抽屉：创建Pod的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-Drawer v-model="createPodDrawer" :direction="direction" :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>创建Pod</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="createPod" :rules="createPodRules" :model="createPod" label-width="80px">
                            <!-- prop用于rules中的校验规则的key -->
                            <el-form-item class="pod-create-form" label="名称" prop="name">
                                <el-input v-model="createPod.name"></el-input>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="命名空间" prop="namespace">
                                <el-select v-model="createPod.namespace" filterable placeholder="请选择">
                                    <el-option v-for="(item, index) in namespaceList" :key="index"
                                        :label="item.metadata.name" :value="item.metadata.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="副本数" prop="replicas">
                                <el-input-number v-model="createPod.replicas" :min="1" :max="10"></el-input-number>
                                <el-popover placement="top" :width="100" trigger="hover" content="副本数上限为10个">
                                    <template #reference>
                                        <el-icon style="width:2em;fontsize:18px;color:#4795EE">
                                            <WarningFilled />
                                        </el-icon>
                                    </template>
                                </el-popover>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="镜像" prop="image">
                                <el-input v-model="createPod.image"></el-input>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="标签" prop="label_str">
                                <el-input v-model="createPod.label_str" placeholder="示例: project=ms,app=gateway"></el-input>
                            </el-form-item>
                            <!-- 下拉框，用于规格的选择，之后用/分割，得到cpu和内存 -->
                            <el-form-item class="pod-create-form" label="资源配额" prop="resource">
                                <el-select v-model="createPod.resource" placeholder="请选择">
                                    <el-option value="0.5/1" label="0.5C1G"></el-option>
                                    <el-option value="1/2" label="1C2G"></el-option>
                                    <el-option value="2/4" label="2C4G"></el-option>
                                    <el-option value="4/8" label="4C8G"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="容器端口" prop="container_port">
                                <el-input v-model="createPod.container_port" placeholder="示例: 80"></el-input>
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="健康检查" prop="health">
                                <el-switch v-model="createPod.health_check" />
                            </el-form-item>
                            <el-form-item class="pod-create-form" label="检查路径" prop="healthPath">
                                <el-input v-model="createPod.health_path" placeholder="示例: /health"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template>

            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="createPodDrawer = false">取消</el-button>
                <el-button type="primary" @click="submitForm('createPod')">立即创建</el-button>
            </template>
        </el-Drawer>


        <!-- =================================YAML============================= -->
        <!-- 展示YAML信息的弹框 -->
        <el-dialog title="YAML信息" v-model="yamlDialog" width="45%" top="2%">
            <!-- codemirror编辑器 -->
            <!-- border 带边框 -->
            <!-- options 编辑器配置 -->
            <!-- change 编辑器中的内容变化时触发 -->
            <codemirror :value="contentYaml" border :options="cmOptions" height="500" style="font-size:14px;"
                @change="onChange"></codemirror>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="yamlDialog = false">取 消</el-button>
                    <el-button type="primary" @click="updatePod()">更 新</el-button>
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
// 引入终端依赖
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import 'xterm/lib/xterm.js';

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
            createPodDrawer: false,
            direction: 'rtl',

            // 表格列表
            podList: [],
            podTotal: 0, // 用于分页
            appLoading: false, // loading效果
            getPodsData: {
                url: common.k8sPodList,
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
            podDetail: {},
            getPodDetailData: {
                url: common.k8sPodDetail,
                params: {
                    pod_name: '',
                    namespace: '',
                    cluster: ''
                }
            },
            // 更新
            updatePodData: {
                url: common.k8sPodUpdate,
                params: {
                    namespace: '',
                    content: '',
                    cluster: ''
                }
            },
            
            // 删除pod
            deletePodData: {
                url: common.k8sPodDel,
                params: {
                    namespace: '',
                    pod_name: '',
                    cluster: ''
                }
            },
            // expand扩展
            activeName: 'container',
            expandKeys: [],
            expandMap: {},
            //日志
            containerList: {},
            containerValue: '',
            getPodContainerData: {
                url: common.k8sPodContainer,
                params: {
                    pod_name: '',
                    namespace: '',
                    cluster: ''

                }
            },
            logContent: '',
            getPodLogData: {
                url: common.k8sPodLog,
                params: {
                    container_name: '',
                    pod_name: '',
                    namespace: '',
                    cluster: ''
                }
            },
            // 日志是否自动刷新
            activeLog: true,
            timer: null,  // 计时器
            activeLogItems: ['1s', '2s', '3s', '4s', '5s'],  // 选择刷新日志间隔
            activeLogInterval: '1s',  // 默认刷新间隔

            //terminal
            term: null,
            socket: null,

        }
    },
    methods: {
        // json转yaml
        transYaml(content) {
            return json2yaml.stringify(content)
        },
        // yaml转对象
        transObj(content) {
            return yaml2obj.load(content)
        },
        // 编辑器内容发生变换时触发的方法，用于将更新的内容复制到变量中
        onChange(val) {
            this.contentYaml = val
        },
        // 分页, 页面大小发生变化时触发，赋值并重新获取列表
        handleSizeChange(size) {
            this.pagesize = size
            this.getPods()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage) {
            this.currentPage = currentPage
            this.getPods()
        },
        // 字符串截取、拼接并返回
        ellipsis(value) {
            return value.length > 15 ? value.substring(0, 15) + "..." : value
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
        handleClose(done) {
            this.$confirm('确认关闭？').then(() => {
                done();
            }).catch(() => { })
        },

        // 重置表单方法 
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },

        // 创建Pod，提交表单，校验参数合法性
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.createPodFunc()
                } else {
                    false
                }
            })
        },
        // 创建pod，加Func的原因是因为createPod用于属性了
        createPodFunc() {
            // 正则匹配，验证label的合法性
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.createPod.label_str)) {
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
            let a = (this.createPod.label_str).split(',')
            a.forEach(item => {
                let b = item.split('=')
                label[b[0]] = b[1]
            })
            //将pod的规格转成cpu和memory
            let resourceList = this.createPod.resource.split("/")
            cpu = resourceList[0]
            memory = resourceList[1] + "Gi"

            // 赋值
            this.createPodData.params = this.createPod
            this.createPodData.params.container_port = parseInt(this.createPod.container_port)
            this.createPodData.params.label = label
            this.createPodData.params.cpu = cpu
            this.createPodData.params.memory = memory

            // 发起请求
            httpClient.post(this.createPodData.url, this.createPodData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 创建后重新获取列表
                this.getPods()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })

            // 重置表单
            this.resetForm('createPod')
            // 关闭加载动画
            this.fullscreenLoading = false
            // 关闭抽屉
            this.createPodDrawer = false
        },
        // 获取Pod列表
        getPods() {
            // 表格加载动画开启
            this.appLoading = true
            //getPodsData是用于发起pod列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getPodsData.params.filter_name = this.searchInput
            this.getPodsData.params.namespace = this.namespaceValue
            this.getPodsData.params.page = this.currentPage
            this.getPodsData.params.limit = this.pagesize
            this.getPodsData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getPodsData.url, { params: this.getPodsData.params }).then(res => {
                this.podList = res.data.items
                this.podTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },
        // 获取Pod详情，e参数标识传入的scope插槽，.row是该行的数据
        getPodDetail(e) {
            //getPodsData是用于发起pod列表请求的专用的对象，里面有url和params参数,以下是赋值
            this.getPodDetailData.params.namespace = this.namespaceValue
            this.getPodDetailData.params.pod_name = e.row.metadata.name
            this.getPodDetailData.params.cluster = this.selectClusterValue
            // 发起请求获取数据
            httpClient.get(this.getPodDetailData.url, { params: this.getPodDetailData.params }).then(res => {
                //响应成功，获得pod详情
                this.podDetail = res.data
                //将对象转成yaml格式的字符串
                this.contentYaml = this.transYaml(this.podDetail)
                //打开弹出框
                this.yamlDialog = true
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 更新Pod
        updatePod() {
            //将yaml格式的pod对象转为json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.updatePodData.params.content = content
            this.updatePodData.params.namespace = this.namespaceValue
            this.updatePodData.params.cluster = this.selectClusterValue
            httpClient.put(this.updatePodData.url, this.updatePodData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                //更新后重新获取列表
                this.getPods()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            //关闭弹出框
            this.yamlDialog = false
        },

        // 获取Pod重启次数
        restartTotal(e){
            let index, sum = 0
            let containerStatuses = e.row.status.containerStatuses
            for (index in containerStatuses){
                sum = sum + containerStatuses[index].restartCount
            }
            return sum
        },

        // 删除pod
        delPod(e) {
            this.deletePodData.params.namespace = this.namespaceValue
            this.deletePodData.params.pod_name = e.row.metadata.name
            this.deletePodData.params.cluster = this.selectClusterValue
            httpClient.delete(this.deletePodData.url, { data: this.deletePodData.params }).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 删除后重新获取列表
                this.getPods()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },

        // 弹出确认框，用于危险操作的double check
        // obj 是行数据，opeateName是操作名，fn是操作的方法
        handleConfirm(obj, operateName, fn) {
            this.confirmContent = '确认继续' + operateName + '操作吗？'
            // $confirm用于弹出确认框
            this.$confirm(this.confirmContent, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(() => {
                //restartPod(e)或者delPod(e)
                fn(obj)
            }).catch(() => {
                this.$message.info({
                    message: '已取消操作'
                })
            })
        },

        // 展开相关函数
        getRowKeys(row) {
            return row.metadata.name
        },
        //row，展开的当前行的数据
        //expandedRows，展开的所有行的数据组成的数组，但是这里用法是只会有一行，也就是数组长度永远为1
        expandChange(row, expandedRows) {
            // 初始化变量
            // 清空expandedRows，代表关闭所有展开的行
            this.expandKeys = []
            // 清空日志内容
            this.logContent = ''
            //清空containervalue，展开时不显示上次的值
            this.containerValue = ''
            //将tab标签页顶部页面调成容器
            this.activeName = 'container'
            //expandedRows.length == 1表示展开，expandedRows.length == 0 表示关闭
            if (expandedRows.length > 0) {
                // expandMap key表示展开过的行的key，值为1表示展开标记，值为0表示关闭标记
                // expandMap用于数据表格点击name的展开，用于判断这一行是展开还是关闭的行为
                this.expandMap[row.metadata.name] = 1
                // 将expandMap除了row.metadata.name，其他key的值都置为0
                this.setExpandMap(row.metadata.name)
                // 这里才是真正的展开，将row.metadata.name添加到expandKeys数组中展开，然后执行方法获取container
                row ? (this.expandKeys.push(row.metadata.name), this.getPodContainer(row)) : ''
            } else {
                // 关闭标记
                this.expandMap[row.metadata.name] = 0
            }
        },
        // 匹配expandMap中podName，不相等的全都置为0，意为除了podName这行，其他全都标记关闭
        setExpandMap(podName) {
            let key
            for ( key in this.expandMap ) {
                key !== podName ? this.expandMap[key] = 0 : ''
            }
        },
        // 获取Pod中的容器
        getPodContainer(row) {
            this.getPodContainerData.params.pod_name = row.metadata.name
            this.getPodContainerData.params.namespace = this.namespaceValue
            this.getPodContainerData.params.cluster = this.selectClusterValue
            httpClient.get(this.getPodContainerData.url, {params: this.getPodContainerData.params}).then(res => {
                this.containerList = res.data
                this.containerValue = this.containerList[0]
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 获取Pod 日志
        getPodLog(podName) {
            this.getPodLogData.params.pod_name = podName
            this.getPodLogData.params.container_name = this.containerValue
            this.getPodLogData.params.namespace = this.namespaceValue
            this.getPodLogData.params.cluster = this.selectClusterValue
            httpClient.get(this.getPodLogData.url, {params: this.getPodLogData.params}).then(res => {
                this.logContent = res.data
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },

        // 初始化终端
        initTerm() {
            //初始化xterm实例
            this.term = new Terminal({
                rendererType: 'canvas', //渲染类型
                rows: 30, //行数
                cols: 110,
                convertEol: false, //启用时，光标将设置为下一行的开头
                scrollback: 10, //终端中的回滚量
                disableStdin: false, //是否应禁用输入
                cursorStyle: 'underline', //光标样式
                cursorBlink: true, //光标闪烁
                theme: {
                foreground: 'white', //字体
                background: '#060101', //背景色
                cursor: 'help' //设置光标
                }
            });
            //绑定dom
            this.term.open(document.getElementById('xterm'))
            //终端适应父元素大小
            const fitAddon = new FitAddon()
            // this.term.loadAddon(fitAddon)
            // this.term.loadAddon(fitAddon)
            fitAddon.activate(this.term)
            fitAddon.fit();
            //获取终端的焦点
            this.term.focus();
            let _this = this; //一定要重新定义一个this，不然this指向会出问题
            //onData方法用于定义输入的动作
            this.term.onData(function (key) {
                // 这里key值是输入的值，数据格式就是后端定义的 {"operation":"stdin","data":"ls"}
                let msgOrder = {
                operation: 'stdin',
                data: key,
                };
                //发送数据
                _this.socket.send(JSON.stringify(msgOrder));
            });
            //发送resize请求
            let msgOrder2 = {
                operation: 'resize',
                cols: this.term.cols,
                rows: this.term.rows,
            };
            this.socket.send(JSON.stringify(msgOrder2))
        },
        //初始化websocket
        initSocket(row) {
            //定义websocket连接地址
            let terminalWsUrl = common.k8sTerminalWs + "?pod_name=" + row.metadata.name + "&container_name=" + this.containerValue + "&namespace=" + this.namespaceValue + "&cluster=" + this.selectClusterValue
            //实例化
            this.socket = new WebSocket(terminalWsUrl);
            //关闭连接时的方法
            this.socketOnClose();
            //建立连接时的方法
            this.socketOnOpen();
            //接收消息的方法
            this.socketOnMessage();
            //报错时的方法
            this.socketOnError();
        },
        socketOnOpen() {
            this.socket.onopen = () => {
                //简历连接成功后，初始化虚拟终端
                this.initTerm()
            }
        },
        socketOnMessage() {
            this.socket.onmessage = (msg) => {
                //接收到消息后将字符串转为对象，输出data内容
                let content = JSON.parse(msg.data)
                this.term.write(content.data)
            }
        },
        socketOnClose() {
            this.socket.onclose = () => {
                //关闭连接后打印在终端里
                this.term.write("链接已关闭")
            }
        },
        socketOnError() {
            this.socket.onerror = () => {
                console.log('socket 链接失败')
            }
        },
        //关闭连接
        closeSocket() {
            //若没有实例化，则不需要关闭
            if (this.socket === null) {
                    return 
                }
            this.term.write("链接关闭中。。。")
            this.socket.close()
            // 关闭终端
            this.term.dispose(document.getElementById("xterm"))
        }
    },

    watch: {
        //监听namespace的值,若发生变化，则执行handler方法中的内容
        namespaceValue: {
            handler() {
                //将namespace的值存入本地，用于path切换时依旧能获取得到
                localStorage.setItem('namespace', this.namespaceValue)
                //重置当前页为1
                this.currentPage = 1
                //获取pod列表
                this.getPods()
            }
        },
        // 若tab标签页切换到日志，则自动加载日志，并将是否自动刷新日志功能关闭
        activeName: {
            handler() {
                if (this.activeName == 'log') {
                    this.expandKeys.length == 1 ? this.getPodLog(this.expandKeys[0]) : ''
                    this.activeLog = false
                }
            }
        },
        // 监听日志开开关是否打开
        activeLog: {
            handler() {
                if (this.activeLog) {
                    // 获取刷新间隔，根据间隔去动态刷新
                    let intervalSecond = parseInt(this.activeLogInterval.split('s')[0]) * 1000
                    this.timer = setInterval(() => {
                        this.getPodLog(this.expandKeys[0])
                    }, intervalSecond);
                }else {
                    // 当关闭的时候，关闭计划任务
                    clearInterval(this.timer)
                    this.activeLog = false
                }
            }
        },
        // 监听日志刷新秒数，根据描述进行刷新日志
        activeLogInterval: {
            handler() {
                // 首先关闭原来的计时器
                clearInterval(this.timer)
                // 获取选择的间隔描述
                let intervalSecond = parseInt(this.activeLogInterval.split('s')[0]) * 1000
                // 重新启动一个定时器
                if (this.activeLog) {
                    this.timer = setInterval(() => {
                        this.getPodLog(this.expandKeys[0])
                    }, intervalSecond);
                }
            }
        },
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getNamespaceList()
                this.getPods()
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
        this.getPods()
    },
    beforeUnmount() {
        //若websocket连接没有关闭，则在改生命周期关闭
        if ( this.socket !== null ) {
            this.socket.close()
        }
    },
}
</script>


<style scoped>
/* 卡片属性 */
.pod-head-card,
.pod-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}

/* 搜索框 */
.pod-head-search {
    width: 160px;
    margin-right: 10px;
}

/* 数据表格pod名颜色 */
.pod-body-podname {
    color: #4795EE;
}

/* pod名鼠标悬停 */
.pod-body-podname:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
}


/* pod状态栏圆点的css实现 */
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

/* 展开相关样式 */
    .pod-body-log-card, .pod-body-shell-card {
        border-radius:1px;
        height:600px;
        overflow:auto;
        background-color: #060101;
    }
    .pod-body-log-card {
        color: aliceblue;
    }
    .pod-body-log-span {
        white-space:pre;
    }

</style>