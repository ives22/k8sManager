//导入router的路由模式
import { createRouter, createWebHistory, createWebHashHistory} from 'vue-router'
//导入进度条组件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
//导入Layout
import Layout from '@/layout/Layout'
// 引入jwt 用于解析token
import jwt from 'jsonwebtoken';


//定义路由规则
const routes = [
    {
        path: '/login',  // 视图
        meta: { titale: "登录", requireAuth: false },  // 记录meta元数据
        component: () => import('@/views/login/Login.vue')   // 视图组件
    },
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',  // 视图
        icon: 'odometer',  // 图标
        meta: { titale: "概要", requireAuth: false },  // 记录meta元数据
        component: Layout,   // 视图组件
        children: [
            {
                path: '/home',  // 视图
                name: '概要',
                icon: 'odometer',  // 图标
                meta: { titale: "概要", requireAuth: false },  // 记录meta元数据
                component: () => import('@/views/home/Home.vue')   // 视图组件
            },
        ]
    },
    {
        path: '/workflow',  // 视图
        icon: 'VideoPlay',  // 图标
        meta: { titale: "工作流", requireAuth: false },  // 记录meta元数据
        component: Layout,   // 视图组件
        children: [
            {
                path: '/workflow',  // 视图
                name: '工作流',
                icon: 'VideoPlay',  // 图标
                meta: { titale: "工作流", requireAuth: false },  // 记录meta元数据
                component: () => import('@/views/workflow/Workflow.vue')   // 视图组件
            },
        ]
    },
    {
        path: '/cluster',
        name: '集群',
        component: Layout,
        icon: 'OfficeBuilding',
        meta: { title: '集群', requireAuth: true },
        children: [
            {
                path: '/cluster/node',
                name: 'Node',
                icon: 'el-icon-s-data',
                meta: { title: 'Node', requireAuth: true },
                component: () => import('@/views/node/Node.vue')
            },
            {
                path: '/cluster/namespace',
                name: 'Namespace',
                icon: 'el-icon-s-data',
                meta: { title: 'Namespace', requireAuth: true },
                component: () => import('@/views/namespace/Namespace.vue')
            },
            {
                path: '/cluster/persistentvolume',
                name: 'PersistentVolume',
                icon: 'el-icon-s-data',
                meta: { title: 'PV', requireAuth: true },
                component: () => import('@/views/persistentvolume/PersistentVolume.vue')
            },
        ]
    },
    {
        path: '/workload',
        name: '工作负载',
        component: Layout,
        icon: 'connection',
        meta: { title: '工作负载', requireAuth: true },
        children: [
            {
                path: '/workload/deployment',
                name: 'Deployment',
                icon: 'el-icon-s-data',
                meta: { title: 'Deployment', requireAuth: true },
                component: () => import('@/views/deployment/Deployment.vue')
            },
            {
                path: '/workload/pod',
                name: 'Pod',
                icon: 'el-icon-document-add',
                meta: { title: 'Pod', requireAuth: true },
                component: () => import('@/views/pod/Pod.vue')
            },
            {
                path: '/workload/daemonset',
                name: 'DaemonSet',
                icon: 'el-icon-document-add',
                meta: { title: 'DaemonSet', requireAuth: true },
                component: () => import('@/views/daemonset/DaemonSet.vue')
            },
            {
                path: '/workload/statefulset',
                name: 'StatefulSet',
                icon: 'el-icon-document-add',
                meta: { title: 'StatefulSet', requireAuth: true },
                component: () => import('@/views/statefulset/StatefulSet.vue')
            }
        ]
    },
    {
        path: '/loadbalance',
        name: '负载均衡',
        component: Layout,
        icon: 'files',
        meta: { title: '负载均衡', requireAuth: true },
        children: [
            {
                path: '/loadbalance/service',
                name: 'Service',
                icon: 'el-icon-s-data',
                meta: { title: 'Service', requireAuth: true },
                component: () => import('@/views/service/Service.vue')
            },
            {
                path: '/loadbalance/ingress',
                name: 'Ingress',
                icon: 'el-icon-s-data',
                meta: { title: 'Ingress', requireAuth: true },
                component: () => import('@/views/ingress/Ingress.vue')
            },
        ]
    },
    {
        path: '/storage',
        name: '存储与配置',
        component: Layout,
        icon: 'tickets',
        meta: { title: '存储与配置', requireAuth: true },
        children: [
            {
                path: '/storage/configmap',
                name: 'ConfigMap',
                icon: 'el-icon-s-data',
                meta: { title: 'ConfigMap', requireAuth: true },
                component: () => import('@/views/configmap/ConfigMap.vue')
            },
            {
                path: '/storage/secret',
                name: 'Secret',
                icon: 'el-icon-s-data',
                meta: { title: 'Secret', requireAuth: true },
                component: () => import('@/views/secret/Secret.vue')
            },
            {
                path: '/storage/persistentvolumeclaim',
                name: 'PersistentVolumeClaim',
                icon: 'el-icon-s-data',
                meta: { title: 'PVC', requireAuth: true },
                component: () => import('@/views/persistentvolumeclaim/PersistentVolumeClaim.vue')
            },
        ]
    },
    {
        path: '/helmstore',
        name: 'Helm应用',
        component: Layout,
        icon: 'menu',
        meta: { title: '存储与配置', requireAuth: true },
        children: [
            {
                path: '/helmstore/release',
                name: 'Release',
                icon: 'el-icon-s-data',
                meta: { title: 'Release', requireAuth: true },
                component: () => import('@/views/helmstore/Release.vue')
            },
            {
                path: '/helmstore/chartrepo',
                name: 'ChartRepo',
                icon: 'el-icon-s-data',
                meta: { title: 'ChartRepo', requireAuth: true },
                component: () => import('@/views/helmstore/ChartRepo.vue')
            },
        ]
    },

    {
        path: '/404',
        meta: { titale: "404", requireAuth: false },
        component: () => import('@/views/common/404.vue')
    },
    {
        path: '/403',
        meta: { titale: "403", requireAuth: false },
        component: () => import('@/views/common/403.vue')
    },

    //其他路径跳转至404页面
    {
        path: '/:pathMatch(.*)',
        redirect: '/404'
    },
]

//创建路由实例
const router = createRouter({
    //hash模式：createWebHashHistory
    //history模式：createWebHistory
    history: createWebHistory(),
    routes
})

// ==================== 进度条配置=====================
// 进度条配置
NProgress.inc(0.2) // 递增进度条，这将获取当前状态值并添加0.2直到状态为0.994
//easing 动画字符串
//speed 动画速度
//showSpinner 进度环显示隐藏
NProgress.configure({ easing: 'ease', speed: 600, showSpinner: false })

// 路由守卫，路由拦截
//router.beforeEach（）一般用来做一些进入页面的限制。比如没有登录，就不能进入某些
//页面，只有登录了之后才有权限查看某些页面。。。说白了就是路由拦截。
//to 要去到某个页面的属性
//from 从哪个页面来的属性
//next 处理路由跳转及放行
router.beforeEach((to, from, next) => {
    // 启动进度条
    NProgress.start()
    // 设置头部
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = "Kubernetes"
    }
    // 放行
    next()
})

// 使用钩子函数对路由进行鉴权，添加token
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('token'); // 从 LocalStorage 获取 token
    if (to.path !== '/login' && !isAuthenticated) {
        // 如果访问的不是登录页面且没有认证信息（token）
        next('/login')    // 重定向到登录页面
    } else if (to.path !== '/login' && isAuthenticated) {
        // 如果访问的不是登录页面且有认证信息（token）
        const tokenExpiration = getExpirationFromToken(); // 从 Token 中获取过期时间
        const currentTime = Date.now() / 1000; // 当前时间（单位：秒）
        if (currentTime > tokenExpiration) {
            // Token 已过期
            localStorage.removeItem('token') // 移除过期的 Token
            next('/login')    // 重定向到登录页面
        } else {
            next(); // 继续导航
        }
    } else {
        next(); // 继续导航
    }
})



// 关闭进度条
router.afterEach((to, from, next) => {
    NProgress.done()
})

// 从 Token 中获取过期时间的函数，根据你的实际 Token 结构进行修改
function getExpirationFromToken() {
    const token = localStorage.getItem('token');
    // 解析 Token 获取过期时间
    const decodedToken = decodeToken(token); // 解码 Token
    if (decodedToken) {
        return decodedToken.exp; // 返回过期时间（单位：秒）
    }
    return 0; // 默认返回 0 表示无效过期时间
}

function decodeToken(token) {
    try {
        const decoded = jwt.decode(token); // 解码 Token
        return decoded;
    } catch (error) {
        console.error('Token 解码失败:', error);
        return null;
    }
}

//抛出路由实例，在main.js中引用
export default router