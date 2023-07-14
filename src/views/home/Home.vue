<template>
    <div class="home">
        <!-- 折叠面板 -->
        <el-collapse v-model="activeNames">
            <!-- 面板1 集群资源卡片 -->
            <el-collapse-item title="概览" name="1">
                <el-row :gutter="10" style="margin-bottom: 10px;">
                    <!-- 命名空间数量 -->
                    <el-col :span="7">
                        <el-card class="home-node-card" :body-style="{padding:'10px'}">
                            <div>
                                <p class="home-node-card-title" style="font-size: 13px;">名称</p>
                                <p class="home-node-card-num" style="text-align: center;font-size:30px;font-weight:bold; margin:0">K8S-MGR</p>
                            </div>
                        </el-card>
                    </el-col>
                    <!-- 集群数 -->
                    <el-col :span="7">
                        <el-card class="home-node-card" :body-style="{padding:'10px'}">
                            <div>
                                <p class="home-node-card-title" style="font-size: 13px;">集群数</p>
                                <p class="home-node-card-num" style="text-align: center;font-size:30px;font-weight:bold; margin:0">{{ clusterNum }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <!-- 版本 -->
                    <el-col :span="7">
                        <!-- <el-card class="home-node-card" :body-style="{padding:'10px'}" style="background-color: rgb(33,46,64);"> -->
                        <el-card class="home-node-card" :body-style="{padding:'10px'}">
                            <div>
                                <p class="home-node-card-title" style="font-size: 13px;">版本</p>
                                <p class="home-node-card-num" style="text-align: center;font-size:30px;font-weight:bold; margin:0">v1.0.0</p>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <!-- 集群资源统计 -->
                <el-row :gutter="10" style="margin-bottom: 10px;">
                    <template v-for="val, key in clusterResources" :key="key">
                        <el-col :span="4" style="margin-bottom: 10px;">
                            <el-card :body-style="{padding:'10px' }" >
                                <div style="display: flex;align-items: center;justify-content: space-between;">
                                    <div style="display: flex; margin:15px 10px 0px; flex:1">
                                        <el-progress :stroke-width="15"  :show-text="true" type="circle" :percentage="100" status="success"></el-progress>
                                    </div>
                                    <div style="text-align: center; flex:3">
                                        <p style="font-size: 12px;">{{ key }}</p>
                                        <p style="font-size: 22px;font-weight:bold;">{{ clusterResources[key] }}</p>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </template>
                </el-row>
            </el-collapse-item>

             <!-- 面板3 资源统计画图 -->
             <el-collapse-item title="资源统计" name="3">
                <el-row :gutter="10">
                    <!-- 每个namspace中pod数量的作图统计 -->
                    <el-col :span="12" style="margin-bottom: 10px;">
                        <el-card class="home-dash-card" :body-style="{padding:'10px'}">
                            <!-- 这个div就是画图的内容，echarts初始化后会绑定到这个id上展示出来 -->
                            <div id="podNumDash" style="height: 300px;">
                            </div>
                        </el-card>
                    </el-col>
                    <!-- 每个namespace中deployment数量的作图统计 -->
                    <el-col :span="12">
                        <el-card class="home-dash-card" :body-style="{padding:'10px'}">
                            <div id="deployNumDash" style="height: 300px;">
                            </div>
                        </el-card>
                    </el-col>
                    <!-- 每个namespace中deployment数量的作图统计 -->
                    <el-col :span="12">
                        <el-card class="home-dash-card" :body-style="{padding:'10px'}">
                            <div id="daemonsetNumDash" style="height: 300px;">
                            </div>
                        </el-card>
                    </el-col>
                    <!-- 每个namespace中deployment数量的作图统计 -->
                    <el-col :span="12">
                        <el-card class="home-dash-card" :body-style="{padding:'10px'}">
                            <div id="statefulsetNumDash" style="height: 300px;">
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-collapse-item>

            <!-- 面板2 节点资源卡片 -->
            <el-collapse-item title="事件列表" name="2">
                <el-col :span="24">
                    <div style="padding-bottom: 5px;">
                        <el-row>
                            <!-- 搜索输入框和搜索按钮 -->
                            <el-col :span="4" :offset="20">
                                <div>
                                    <!-- 搜索输入框 -->
                                    <el-input class="event-head-search" 
                                    clearable placeholder="请输入事件名"
                                    v-model="searchInput">
                                    <template #append style="background-color: var(--el-fill-color-blank); ">
                                        <el-button  icon="Search" @click="getClusterEvents()"></el-button>
                                      </template>
                                    </el-input>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </el-col>
    
                <el-col :span="24">
                    <div>
                        <el-card class="event-body-card" shadow="never" :body-style="{padding:'5px'}">
                            <!-- 数据表格 -->
                            <!-- v-loading用于加载时的loading动画 -->
                            <el-table style="width: 100%; font-size:12px; margin-bottom:10px" :data="eventList">
                                <!-- 最左侧留出20px的宽度，更加美观 -->
                                <el-table-column width="20"></el-table-column>
                                <!-- 资源名 -->
                                <el-table-column align=left label="资源名">
                                    <!-- 插槽，scope.row获取当前行的数据 -->
                                    <template v-slot="scope">
                                        <a class="event-body-eventname">{{scope.row.name}}</a>
                                    </template>
                                </el-table-column>
                                <!-- 资源类型 -->
                                <el-table-column align=center label="资源类型">
                                    <!-- 插槽，scope.row获取当前行的数据 -->
                                    <template v-slot="scope">
                                        <span>{{scope.row.kind}}</span>
                                    </template>
                                </el-table-column>
                                <!-- 命名空间 -->
                                <el-table-column align=center label="名称空间" min-width='120'>
                                    <template v-slot="scope">
                                        <span>{{scope.row.namespace}}</span>
                                    </template>
                                </el-table-column>
                                <!-- 状态 -->
                                <el-table-column align=center label="状态">
                                    <template v-slot="scope">
                                        <!-- :class="[scope.row.rtype === 'Normal' ? 'success-status' : 'warning-status']" -->
                                        <span :class="[scope.row.rtype === 'Normal' ? 'success-status' : 'warning-status']">{{scope.row.rtype}}</span>
                                    </template>
                                </el-table-column>
                                <!-- 原因 -->
                                <el-table-column align=center label="原因">
                                    <template v-slot="scope">
                                        <span>{{ scope.row.reason }} </span>
                                    </template>
                                </el-table-column>
                                <!-- 描述 -->
                                <el-table-column align=center label="描述">
                                    <template v-slot="scope">
                                        <span>{{ scope.row.message }} </span>
                                    </template>
                                </el-table-column>
                                <!-- 事件时间 -->
                                <el-table-column align=center min-width="100" label="事件时间">
                                    <!-- timeTrans函数用于将格林威治时间转成北京时间 -->
                                    <template v-slot="scope">
                                        <el-tag type="info">{{ timeTrans(scope.row.event_time) }} </el-tag>
                                        <!-- <el-tag type="info">{{ scope.row.event_time }} </el-tag> -->
                                    </template>
                                </el-table-column>
                                <!-- 集群 -->
                                <el-table-column align=center label="集群">
                                    <template v-slot="scope">
                                        <span>{{ scope.row.cluster }} </span>
                                    </template>
                                </el-table-column>
                    
                            </el-table>
                            <el-pagination 
                            class="event-body-pagination" 
                            background 
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page="currentPage"
                            :page-sizes="pagesizeList"
                            :page-size="pagesize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="eventTotal">
                            </el-pagination>
                        </el-card>
                    </div>
                </el-col>
                
            </el-collapse-item>

           
        </el-collapse>
    </div>
</template>

<script>
//引入echarts
import * as echarts from 'echarts'
import common from "../common/Config"
import httpClient from "@/utils/request"

export default {
    data() {
        return {
            // 当前选中的cluster
            selectClusterValue: localStorage.getItem('k8s_cluster'),
            activeNames: ['1', '2', '3'],
            //获取namespace的属性
            namespaceActive: 0,
            namespaceValue: 'default',
            namespaceTotal: 0,
            //namespace active百分比
            namespacePercentage: 0,
            getNamespaceListData: {
                url: common.k8sNamespaceList,
                params: {}
            },
            

            //获取node的属性
            nodeTotal: 0,
            nodeReadyTotal: 0,
            nodeNumPercentage: 0,
            //cpu可分配
            nodeCpuAllocatable: 0,
            //cpu总量
            nodeCpuCapacity: 0,
            //cpu饼图使用率
            nodeCpuPercentage: 0,
            //内存可分配
            nodeMemAllocatable: 0,
            //内存总量
            nodeMemCapacity: 0,
            //Mem饼图使用率
            nodeMemPercentage: 0,
            //pod可分配
            nodePodAllocatable: 0,
            //pod总量
            nodePodCapacity: 0,
            //Pod饼图使用率
            nodePodPercentage: 0,
            
            // 集群数量：
            clusterNum: 0,
            // 集群所有资源
            clusterResources: {},
            // 获取集群所有资源
            getClusterResourceData: {
                url: common.k8sAllResource,
                params: {},
            },
            // 搜索
            searchInput: '',
            // 事件列表
            eventList: [],
            eventTotal: 0, // 分页
            appLoading: false, // loading效果
            getEventListData: {
                url: common.k8sEvent,
                params: {
                    name: '',
                    cluster: '',
                    page: 1,
                    limit: 10,
                }
            },
            // 分页
            currentPage: 1,
            pagesize: 10,
            pagesizeList: [10, 20, 30],
            timer: null,  // 计时器


            // 获取节点Pod信息增长率
            getAllPodInfos: {
                url: common.k8sPodInfoAll,
                params: {
                    cluster: ''
                }
            },

            // 获取节点资源
            getNodesData: {
                url: common.k8sNodeList,
                params: {}
            },
            //存放每个namespace中pod的数量[{namespace:"default",pod_num:5}]
            podNumNp: [],
            // 获取每个namespace中pod的数量
            getNumNpData: {
                url: common.k8sPodNumNp,
                params: {
                    cluster: ''
                }
            },
            //每个namespace中deployment的数量[{namespace:"default",deployment_num:5}]
            deploymentNumNp: [],
            getDeploymentNumNpData: {
                url: common.k8sDeploymentNumNp,
                params: {
                    cluster: ''
                }
            },
            //每个namespace中daemonset的数量
            daemonsetNumNp: [],
            getDaemonSetNumNpData: {
                url: common.k8sDaemonSetNumNp,
                params: {
                    cluster: ''
                }
            },
            //每个namespace中statefulset的数量
            statefulsetNumNp: [],
            getStatefulSetNumNpData: {
                url: common.k8sStatefulSetNumNp,
                params: {
                    cluster: ''
                }
            },
        }
    },
    methods: {
        //获取namespace的数量
        getNamespaces() {
            this.getNamespaceListData.params.cluster = this.selectClusterValue
            httpClient.get(this.getNamespaceListData.url, {params: this.getNamespaceListData.params}).then(res => {
                this.namespaceTotal = res.data.total
                let namespaceList = res.data.items
                //处理namespace active的数量
                let index
                for (index in namespaceList) {
                    if (namespaceList[index].status.phase === "Active" ) {
                        this.namespaceActive = this.namespaceActive + 1
                    }
                }
                this.namespacePercentage = this.namespaceActive / this.namespaceTotal * 100
            }).catch(res => {
                this.$message.error({
                message: res.msg
                })
            })
        },
        // 获取node资源信息
        getNodes() {
            httpClient.get(this.getNodesData.url, {params: this.getNodesData.params}).then(res => {
                this.nodeTotal = res.data.total
                let nodeList = res.data.items
                let index 
                for (index in nodeList){
                    let isnum = /^\d+$/.test(nodeList[index].status.allocatable.cpu)
                    if (!isnum) {
                        continue
                    }
                    let node = nodeList[index]
                    // 计算节点的总数量
                    for (let i in node.status.conditions) {
                        if (node.status.conditions[i].type === 'Ready' && node.status.conditions[i].status === 'True') {
                            this.nodeReadyTotal += 1
                        } 
                    }
                    //计算node的cpu mem和pod的可分配及总容量数据
                    this.nodeCpuAllocatable = parseInt(nodeList[index].status.allocatable.cpu) + this.nodeCpuAllocatable
                    this.nodeCpuCapacity = parseInt(nodeList[index].status.capacity.cpu) + this.nodeCpuCapacity
                    this.nodeMemAllocatable = parseInt(nodeList[index].status.allocatable.memory) + this.nodeMemAllocatable
                    this.nodeMemCapacity = parseInt(nodeList[index].status.capacity.memory) + this.nodeMemCapacity
                    this.nodePodAllocatable = parseInt(nodeList[index].status.allocatable.pods) + this.nodePodAllocatable
                    this.nodePodCapacity = parseInt(nodeList[index].status.capacity.pods) + this.nodePodCapacity
                }
                // 计算nodeNumPercentage饼图数值比例
                this.nodeNumPercentage = this.nodeReadyTotal / this.nodeTotal * 100
                // 计算cpu使用率的饼图
                this.nodeCpuPercentage = this.nodeCpuAllocatable / this.nodeCpuCapacity * 100
                // 计算mem使用率的饼图
                this.nodeMemPercentage = this.nodeMemAllocatable / this.nodeMemCapacity * 100
                // 计算Pod使用率的饼图
                this.nodePodPercentage = this.nodePodAllocatable / this.nodePodCapacity * 100
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        //用于内存数据的转换
        specTrans(num) {
            let a = num / 1024 / 1024
            //四舍五入保留小数点0位，也就是去除小数点
            return a.toFixed(0)
        },

        // 获取集群的Pod信息增长率
        getClusterAllPodInfos(){
            this.getAllPodInfos.params.cluster = this.selectClusterValue
            httpClient.get(this.getAllPodInfos.url, {params: this.getAllPodInfos.params}).then(res => {
                // this.podNumNp = res.data
                // //echarts作图
                // this.getPodNumDash()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            
        },

        //获取每个namespace中pod的数量
        getPodNumNp() {
            this.getNumNpData.params.cluster = this.selectClusterValue
            httpClient.get(this.getNumNpData.url, {params: this.getNumNpData.params}).then(res => {
                this.podNumNp = res.data
                //echarts作图
                this.getPodNumDash()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        //获取每个namespace中deployment的数量
        getDeploymentNumNp() {
            this.getDeploymentNumNpData.params.cluster = this.selectClusterValue
            httpClient.get(this.getDeploymentNumNpData.url, {params: this.getDeploymentNumNpData.params}).then(res => {
                this.deploymentNumNp = res.data
                //echarts作图
                this.getDeployNumDash()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 获取每个namespace中的daemonset的数量
        getDaemonSetNumNp(){
            this.getDaemonSetNumNpData.params.cluster = this.selectClusterValue
            httpClient.get(this.getDaemonSetNumNpData.url, {params: this.getDaemonSetNumNpData.params}).then(res => {
                this.daemonsetNumNp = res.data
                this.getDaemonSetDash()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 获取每个namespace中的statefulset的数量
        getStatefulSetNumNp(){
            this.getStatefulSetNumNpData.params.cluster = this.selectClusterValue
            httpClient.get(this.getStatefulSetNumNpData.url, {params: this.getStatefulSetNumNpData.params}).then(res => {
                this.statefulsetNumNp = res.data
                this.getStatefulSetDash()
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },

        // 分页, 页面大小发生变化时触发，赋值并重新获取列表
        handleSizeChange(size) {
            this.pagesize = size
            this.getClusterEvents()
        },
        // 页数发生变化时触发，复制并重新获取列表
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getClusterEvents()
        }, 
        //格林威治时间转为北京时间
        timeTrans(date) {
            date = date.substring(0, 19).replace('T', ' ')
            date = date.substring(0, 19).replace('+08:00', '')
            return date 
        },

        // 获取集群中所有资源信息
        getClusterResources(){
            this.getClusterResourceData.params.cluster = this.selectClusterValue
            httpClient.get(this.getClusterResourceData.url, {params: this.getClusterResourceData.params}).then(res => {
                this.clusterResources = res.data
            }).catch(res=>{
                this.$message.error({
                    message: res.msg
                })
            })
        },
        // 获取事件列表
        getClusterEvents(){
            // 赋值
            this.getEventListData.params.cluster = this.selectClusterValue
            this.getEventListData.params.name = this.searchInput
            this.getEventListData.params.page = this.currentPage
            this.getEventListData.params.limit = this.pagesize
            httpClient.get(this.getEventListData.url, {params: this.getEventListData.params}).then(res => {
                this.eventList = res.data.items
                this.eventTotal = res.data.total
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },

        // 绘制POD饼图
        getPodNumDash(){
            //若实例已经初始化了，则销毁实例
            if (this.podNumDash != null && this.podNumDash != "" && this.podNumDash != undefined) {
                this.podNumDash.dispose()
            }
            //初始化实例，绑定到dom上
            this.podNumDash = echarts.init(document.getElementById('podNumDash'));
            //echarts作图配置
            this.podNumDash.setOption({
                //标题及字体颜色
                title: { text: 'Pods per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                //图表颜色
                color: ['#67E0E3', '#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
                //提示框
                tooltip: { 
                    //触发类型坐标轴触发
                    trigger: "axis", 
                    //'cross' 十字准星指示器
                    axisPointer: { 
                        type: "cross", 
                        label: { 
                            backgroundColor: "#76baf1" 
                        } 
                    } 
                },
                //图表中的数据类型解释
                legend: {
                    data: ['Pods']
                },
                //图表数据集
                dataset: {
                    //维度定义，默认第一个元素表示x轴的数据，其他都是y轴数据
                    dimensions: ['namespace','pod_num'],
                    //源数据
                    source: this.podNumNp
                },
                //x轴属性
                xAxis: {
                    //category类目轴，value数值轴，time时间轴，log对数轴
                    type: 'category',
                    //轴标签
                    axisLabel:{
                        //坐标轴刻度标签的显示间隔，在类目轴中有效.0显示所有
                        interval: 0,
                        //格式化轴标签
                        formatter: function (value) {
                            return value.length>5?value.substring(0,5)+'...':value
                        }
                    },
                },
                //y轴属性
                yAxis: [
                    //数值轴
                    {type: 'value'}
                ],
                //定义系列，用于指定一组数值以及他们映射成的图
                series: [{
                    //name是legend对应的值
                    name: 'Pods',
                    //bar柱状图，line折线图，pie饼图等等
                    type: 'bar',
                    //每个类目的值标签，配置
                    label: {
                        //是否显示值
                        show: true,
                        //显示的位置
                        position: 'top'
                        }
                    }
                ]
            });
        },
        // 绘制Deployment饼图
        getDeployNumDash(){
            if (this.deployNumDash != null && this.deployNumDash != "" && this.deployNumDash != undefined) {
                this.deployNumDash.dispose()
            }
            this.deployNumDash = echarts.init(document.getElementById('deployNumDash'));
            this.deployNumDash.setOption({
                title: { text: 'Deployments per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                color: ['#ff9f7f','#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
                tooltip: { trigger: "axis", axisPointer: { type: "cross", label: { backgroundColor: "#76baf1" } } },
                legend: {
                    data: ['Deployments']
                },
                dataset: {
                    // 提供一份数据。
                    dimensions: ['namespace','deployment_num'],
                    source: this.deploymentNumNp
                },
                xAxis: {
                    type: 'category',
                    axisLabel:{
                        interval: 0,
                        formatter: function (value) {
                            return value.length>5?value.substring(0,5)+'...':value
                        }
                    },
                },
                yAxis: [
                    {type: 'value'}
                ],
                // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列。
                series: [{
                    name: 'Deployments',
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top'
                        }
                    }
                ]
            });
        },
        // 绘制DaemonSet饼图
        getDaemonSetDash(){
            if (this.daemonsetNumDash != null && this.daemonsetNumDash != "" && this.daemonsetNumDash != undefined) {
                this.daemonsetNumDash.dispose()
            }
            this.daemonsetNumDash = echarts.init(document.getElementById('daemonsetNumDash'));
            this.daemonsetNumDash.setOption({
                title: { text: 'DaemonSets per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                color: ['#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
                tooltip: { trigger: "axis", axisPointer: { type: "cross", label: { backgroundColor: "#76baf1" } } },
                legend: {
                    data: ['DaemonSets']
                },
                dataset: {
                    // 提供一份数据。
                    dimensions: ['namespace','daemonSet_num'],
                    source: this.daemonsetNumNp
                },
                xAxis: {
                    type: 'category',
                    axisLabel:{
                        interval: 0,
                        formatter: function (value) {
                            return value.length>5?value.substring(0,5)+'...':value
                        }
                    },
                },
                yAxis: [
                    {type: 'value'}
                ],
                // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列。
                series: [{
                    name: 'DaemonSets',
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top'
                        }
                    }
                ]
            });
        },
        // 绘制 Statefulset饼图
        getStatefulSetDash(){
            if (this.statefulsetNumDash != null && this.statefulsetNumDash != "" && this.statefulsetNumDash != undefined) {
                this.statefulsetNumDash.dispose()
            }
            this.statefulsetNumDash = echarts.init(document.getElementById('statefulsetNumDash'));
            this.statefulsetNumDash.setOption({
                title: { text: 'StatefulSets per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                color: ['#e7bcf3', '#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#9d96f5', '#8378EA', '#96BFFF'],
                tooltip: { trigger: "axis", axisPointer: { type: "cross", label: { backgroundColor: "#76baf1" } } },
                legend: {
                    data: ['StatefulSets']
                },
                dataset: {
                    // 提供一份数据。
                    dimensions: ['namespace','statefulset_num'],
                    source: this.statefulsetNumNp
                },
                xAxis: {
                    type: 'category',
                    axisLabel:{
                        interval: 0,
                        formatter: function (value) {
                            return value.length>5?value.substring(0,5)+'...':value
                        }
                    },
                },
                yAxis: [
                    {type: 'value'}
                ],
                // 声明多个 bar 系列，默认情况下，每个系列会自动对应到 dataset 的每一列。
                series: [{
                    name: 'StatefulSets',
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top'
                        }
                    }
                ]
            });
        },
    },
    watch: {
        // 监听clustervalue的值，这里表示如果localstorage中的值发生了改变，则重新获取掉接口刷新当前页面
        selectClusterValue: {
            handler(){
                this.getPodNumNp()
                this.getDeploymentNumNp()
                this.getDaemonSetNumNp()
                this.getStatefulSetNumNp()
                this.getClusterResources()
                // this.getClusterAllPodInfos()
                //当集群发生改变时，首先关闭之前的定时器
                clearInterval(this.timer)
                // 重新获取对应集群的事件信息，并开启定时任务
                this.getClusterEvents()
                this.timer = setInterval(() => {
                    if (localStorage.getItem('cluster_num') && this.selectClusterValue) {
                        this.getClusterEvents()
                    }
                }, 3000);
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
    beforeMount(){
        this.clusterNum = localStorage.getItem('cluster_num')
        this.getClusterEvents()
        this.timer = setInterval(() => {
            if (localStorage.getItem('cluster_num') && localStorage.getItem('k8s_cluster')) {
                this.getClusterEvents()
            }
        }, 3000);
        this.getClusterResources()
        // this.getNamespaces()
        // this.getNodes()
        this.getPodNumNp()
        this.getDeploymentNumNp()
        this.getDaemonSetNumNp()
        this.getStatefulSetNumNp()
        // this.getClusterAllPodInfos()
    },
    beforeUnmount(){
        // 离开当前页面时候，销毁定时器
        clearInterval(this.timer)
    }
}
</script>

<style scoped>
/deep/ .el-collapse-item_header {
    font-size: 16px;
}
.home-node-card {
    border-radius:1px;
    text-align: center;
    background-color: rgb(250, 253, 255);
}
.home-dash-card {
    border-radius:1px;
}
/* 卡片属性 */
.event-head-card,
.event-body-card {
    border-radius: 1px;
    margin-bottom: 5px;
}
.event-body-eventname {
    color: #4795EE;
}
.home-node-card-title {
    font-size: 12px;
}

.home-node-card-num {
    font-size: 22px;
    font-weight: bold;
    color: rgb(63, 92, 135);
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

/deep/ .el-progress-circle {
    height: 50px !important;
    width: 50px !important;
}
</style>