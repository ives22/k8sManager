<template>
    <div class="common-layout">
        <!-- container整体布局 -->
        <el-container style="height: 100vh;">
            <!-- 侧边栏，定义默认宽度 -->
            <el-aside class="aside" :width="asideWidth">
                <!-- 固钉，将平台logo和名字固钉在侧边栏最上方 -->
                <!-- z-index是显示优先级 -->
                <el-affix class="aside-affix" :z-index="1200">
                    <div class="aside-logo">
                        <!-- logo图片 -->
                        <el-image class="logo-image" :src="logo" />
                        <!-- 平台名，折叠后不显示 -->
                        <span :class="[isCollapse ? 'is-collapse' : '']">
                            <span class="logo-name">K8S-MGR</span>
                        </span>
                      
                    </div>
                </el-affix>
                <!-- 菜单导航栏 -->
                <!-- router 使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
                <!-- default-active 当前激活菜单的index,将菜单栏与路径做了对应关系 -->
                <!-- collapse 是否折叠 -->
                <el-menu class="aside-menu"
                    router
                    :default-active="$route.path"
                    :collapse="isCollapse"
                    background-color="#131b27"
                    text-color="#bfcbd9"
                    active-text-color="#20a0ff">
                    <!-- for循环路由规则 -->
                    <div v-for="menu in routers" :key="menu">
                        <!-- 处理子路由只有1个的情况，如概要、工作流 -->
                        <el-menu-item class="aside-menu-item" v-if="menu.children && menu.children.length == 1" :index="menu.children[0].path">
                            <!-- 引入图标的方式 -->
                            <el-icon><component :is="menu.children[0].icon" /></el-icon>
                            <template #title>
                                {{menu.children[0].name}}
                            </template>
                        </el-menu-item>
                        <!-- 处理有多个子路由的情况，如集群、工作负载、负载均衡等 -->
                        <!-- 父菜单 -->
                        <!-- 注意el-menu-item在折叠后，title的部分会自动消失，但el-sub-menu不会，需要自己控制 -->
                        <el-sub-menu class="aside-submenu" v-else-if="menu.children && menu.children.length > 1" :index="menu.path">
                            <!-- 处理父菜单栏 -->
                            <template #title>
                                <el-icon><component :is="menu.icon" /></el-icon>
                                <span :class="[isCollapse ? 'is-collapse' : '']">{{menu.name}}</span>
                            </template>
                            <!-- 处理子菜单 -->
                            <el-menu-item class="aside-menu-childitem" v-for="child in menu.children" :key="child" :index="child.path">
                                <template #title>
                                    {{child.name}}
                                </template>
                            </el-menu-item>
                        </el-sub-menu>
                    </div>
                </el-menu>
            </el-aside>


            <!-- header、main、以及footer -->
            <el-container>
                <!-- header -->
                <el-header class="header">
                    <el-row :gutter="20">
                        <el-col :span="1">
                            <!-- 折叠按钮 -->
                            <div class="header-collapse" @click="onCollapse">
                                <!-- isCollapse为true的时候，显示关闭的图标，为false的时候，显示展开的图标 -->
                                <el-icon><component :is="isCollapse ? 'expand':'fold'" /></el-icon>
                            </div>
                        </el-col>
                        <!-- <el-col :span="10"> -->
                        <el-col :span="15">
                            <!-- 面包屑 -->
                            <div class="header-breadcrumb">
                                <!-- separator 分隔符 -->
                                <el-breadcrumb separator="/">
                                    <!-- :to="{ path: '/' }"表示跳转到/路径 -->
                                    <el-breadcrumb-item :to="{ path: '/' }">工作台</el-breadcrumb-item>
                                    <!-- this.$route.matched 可以拿到当前页面的路由信息 -->
                                    <template v-for="(matched,m) in this.$route.matched" :key="m">
                                        <el-breadcrumb-item v-if="matched.name != undefined">
                                        {{ matched.name }}
                                        </el-breadcrumb-item>
                                    </template>
                                </el-breadcrumb>
                            </div>
                        </el-col>

                        <!-- 集群切换 -->
                        <el-col class="header-menu" :span="5" >
                            <el-menu
                                :default-active="activeCluster"
                                class="el-menu-demo"
                                mode="horizontal"
                                @select="handleSelectCluster"
                            >
                            <!-- <el-menu-item v-for="(item, index) in menuItems" :key="index" :index="item.index">{{ item.text }}</el-menu-item> -->
                            <el-menu-item v-for="(item, index) in clusterList" :key="index" :index="item">{{ item }}</el-menu-item>
                            </el-menu>
                        </el-col>
                        <!-- 用户信息 -->
                        <!-- <el-col class="header-menu" :span="13"> -->
                        <el-col class="header-menu" :span="3">
                            <!-- 用户信息 -->
                            <el-dropdown>
                                <!-- 头像及用户名 -->
                                <div class="header-dropdown">
                                    <el-image class="avator-image" :src="avator" />
                                    <span>{{ username }}</span>
                                </div>
                                <!-- 下拉框内容 -->
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="logout()">退出</el-dropdown-item>
                                        <el-dropdown-item @click="updatePWD()">修改密码</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </el-col>
                    </el-row>
                </el-header>


                <!-- main -->
                <el-main class="main">
                    <!-- 路由占位符，展示匹配到的路由的视图组件 -->
                    <router-view></router-view>
                </el-main>


                <!-- footer -->
                <el-footer class="footer">
                    <el-icon style="width:2em;top:3px;font-size:18px"><place/></el-icon>
                    <a class="footer el-icon-place">2023 ives devops</a>
                </el-footer>
                <!-- 返回顶部，其实是返回el-main的顶部 -->
                <el-backtop target=".el-main"></el-backtop>
            </el-container>
        </el-container>

        <!-- =================================修改密码============================= -->
        <!-- 抽屉：创建Chart的表单 -->
        <!-- v-model 值是bool，用于显示与隐藏 -->
        <!-- direction 显示的位置 -->
        <!-- before-close 关闭时触发，点击关闭或者点击空白都会触发 -->
        <el-dialog v-model="updatePwdDialog"
        width="25%"
     
        :before-close="handleClose">
            <!-- 插槽，抽屉标题 -->
            <template #header>
                <h4>更改密码</h4>
            </template>
            <!-- 插槽，body, 填写表单属性 -->
            <template #default>
                <!-- flex布局,居中 -->
                <el-row type="flex" justify="center">
                    <el-col :span="20">
                        <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
                        <!-- rules 定义form表单校验规则 -->
                        <el-form ref="updatePasswordData" :rules="updatePwdRules" :model="updatePasswordData" label-width="100px">
                            <el-form-item  label="原密码" prop="oldPassword">
                                <el-input v-model="updatePasswordData.oldPassword"></el-input>
                            </el-form-item>
                            <el-form-item  label="新密码" prop="newPassword">
                                <el-input v-model="updatePasswordData.newPassword" show-password></el-input>
                            </el-form-item>
                            <el-form-item  label="确认新密码" prop="ackNewPassword">
                                <el-input v-model="updatePasswordData.ackNewPassword" show-password></el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </template> 
            <!-- footer，处理提交和取消 -->
            <template #footer>
                <el-button @click="updatePwdDialog = false">取消</el-button>
                <el-button type="primary" @click="submitForm('updatePasswordData')">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>

import {useRouter} from 'vue-router'
import common from "../views/common/Config"
import httpClient from "@/utils/request"
export default {
    data() {
        return {
            //导入头像图片
            avator: require('@/assets/img/avator.png'),
            //导入logo图片
            logo: require('@/assets/img/k8s-metrics.png'),
            //控制导航栏折叠
            isCollapse: false,
            //导航栏宽度
            asideWidth: '220px',
            //路由规则
            routers: [],
            // 导航栏，当前选中的集群
            activeCluster: '',
            // 集群列表
            clusterList: [],
            clusterListData: {
                url: common.k8sClusterList,
                params: {},
            },
            appLoading: false,

             // 修改密码相关
            updatePwdDialog: false, // 修改密码时候的Dialog窗口开关
            // 页面渲染相关数据
            updatePasswordData: {
                oldPassword: '',
                newPassword: '',
                ackNewPassword: '',
            },
            // 请求后端接口参数 url等。
            updatePwdData: {
                url: common.changePWD,
                params: {
                    username: "",
                    old_pwd: "",
                    new_pwd: ""
                },
            },
            // 修改密码相关校验规则
            updatePwdRules: {
                oldPassword: [
                    {required: true, message: '请填写原密码', trigger: 'change'}
                ],
                newPassword: [
                    {required: true, message: '请填写新密码', trigger: 'change'},
                    { min: 6, message: '新密码至少为6位', trigger: 'blur' }
                ],
                ackNewPassword: [
                    {required: true,message: '请确认新密码',trigger: 'change'},
                    { validator: this.validateConfirmPassword, trigger: 'blur' }
                ],
            }
        }
    },
    computed: {
        //获取用户名
        username() {
            let username = localStorage.getItem('username');
            //三元运算
            return username ? username : '未知';
        },
    },
    methods: {
        // 集群切换
        handleSelectCluster(item){
            // 将当前选中的集群更新到localstorage中
            localStorage.setItem('k8s_cluster', item)
        },
        //控制折叠
        onCollapse() {
            if (this.isCollapse) {
                this.asideWidth = '220px'
                this.isCollapse = false
            } else {
                this.isCollapse = true
                this.asideWidth = '64px'
            }
        },
        //登出
        logout() {
            //移除用户名
            localStorage.removeItem('username');
            //移除token
            localStorage.removeItem('token');
            //跳转至/login页面
            this.$router.push('/login');
        },
        // 获取集群列表
        getClusterList(){
            // 表格加载动画开启
            this.appLoading = true
            // 发起请求获取数据
            httpClient.get(this.clusterListData.url, {params: this.clusterListData.params}).then(res => {
                this.clusterList = Object.values(res.data)
                // 响应成功后，存入到localstorage中
                localStorage.setItem('cluster_num', this.clusterList.length)
                // 默认选中第一个
                localStorage.setItem('k8s_cluster', this.clusterList[0])
                // 默认设置第一个也为当前选中
                this.activeCluster = this.clusterList[0]
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
            this.appLoading = false
        },

        // 修改密码
        updatePWD(){
            // 当点击修改密码时候，设置dialog窗口为true，弹出修改框
            this.updatePwdDialog = true
        },
        // 修改密码，提交表单，校验参数合法性
        submitForm(formName){
            this.$refs[formName].validate((valid)=>{
                if (valid) {
                    this.updatePwdFunc()
                } else {
                    false
                }
            })
        },
        // 用于校验确认密码是否与新密码一致
        validateConfirmPassword(rule, value, callback) {
            if (value !== this.updatePasswordData.newPassword) {
                callback(new Error('确认新密码与新密码不一致'));
            } else {
                callback();
            }
        },
        // 处理抽屉的关闭，doble check，增加体验
        handleClose(done){
            this.$confirm('确认关闭？').then(()=>{
                done();
            }).catch(()=>{})
        },
        // 调用后端接口，修改密码
        updatePwdFunc(){
            console.log(this.updatePwdData)
            this.updatePwdData.params.username = localStorage.getItem('username');
            this.updatePwdData.params.old_pwd = this.updatePasswordData.oldPassword
            this.updatePwdData.params.new_pwd = this.updatePasswordData.newPassword
            httpClient.put(this.updatePwdData.url, this.updatePwdData.params).then(res => {
                this.$message.success({
                    message: res.msg
                })
                // 修改完成后，关闭弹窗，以及清空数据
                // 重置表单
                this.resetForm('updatePasswordData')
                // 关闭抽屉
                this.updatePwdDialog = false
            }).catch(res => {
                this.$message.error({
                    message: res.msg
                })
            })
        },
         // 重置表单方法 
         resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        
    },
    beforeMount() {
        //使用useRouter().options.routes方法获取路由规则
        this.routers = useRouter().options.routes
        this.getClusterList()
        // 获取集群
        //加载页面时先获取localStorage中的namespace值，若获取不到则默认default
        // if (localStorage.getItem('k8s_cluster') !== undefined && localStorage.getItem('k8s_cluster') != null) {
          
        // }else {
        //     this.getClusterList()
        // }

        // if (localStorage.getItem('k8s_cluster')) {
            
        // }
    }
}
</script>


<style scoped>
    /* 侧边栏折叠速度，背景色 */
    .aside{
        transition: all .5s;
        background-color: #131b27;
    }
    /* 固钉，以及logo图片和平台名的属性 */
    .aside-logo{
        background-color: #131b27;
        height: 60px;
        color: white;
    }
    .logo-image {
        width: 40px;
        height: 40px;
        top: 12px;
        padding-left: 12px;
    }
    .logo-name{
        font-size: 20px;
        font-weight: bold;
        padding: 10px;
    }
    /* 滚动条不展示 */
    .aside::-webkit-scrollbar {
        display: none;
    }
    /* 修整边框，让边框不要有溢出 */
    .aside-affix {
        border-bottom-width: 0;
    }
    .aside-menu {
        border-right-width: 0;
    }
    /* 菜单栏的位置以及颜色 */
    .aside-menu-item.is-active {
        background-color: #1f2a3a ;
    }
    .aside-menu-item {
        padding-left: 20px !important;
    }
    .aside-menu-item:hover {
        background-color: #142c4e ;
    }
    .aside-menu-childitem {
        padding-left: 40px !important;
    }
    .aside-menu-childitem.is-active {
        background-color: #1f2a3a ;
    }
    .aside-menu-childitem:hover {
        background-color: #142c4e ;
    }

    /* header的属性 */
    .header{
        z-index: 1200;
        line-height: 60px;
        font-size: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
    }
    /* 折叠按钮 */
    .header-collapse{
        cursor: pointer;
    }
    /* 面包靴 */
    .header-breadcrumb{
        padding-top: 0.9em;
    }
    /* 用户信息靠右 */
    .header-menu{
        text-align: right;
    }
    /* 折叠属性 */
    .is-collapse {
        display: none;
    }
    /* 用户信息下拉框 */
    .header-dropdown {
        line-height: 60px;
        cursor: pointer;
    }
    /* 头像 */
    .avator-image {
        top: 12px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 8px;
    }
    .main {
        padding: 10px;
    }
    .footer {
        z-index: 1200;
        color: rgb(187, 184, 184);
        font-size: 14px;
        text-align: center;
        line-height: 60px;
    }

</style>