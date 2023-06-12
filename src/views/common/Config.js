const BASE_API_HOST = 'http://127.0.0.1:9091';
// const BASE_API_HOST = 'http://192.168.102.101:9091';
export default {
    //后端接口路径
    loginAuth: BASE_API_HOST + '/api/login' ,
    // 集群列表
    k8sClusterList: BASE_API_HOST + '/api/k8s/clusters' ,
    // 集群事件
    k8sEvent: BASE_API_HOST + '/api/k8s/events' ,
    // 集群资源
    k8sAllResource: BASE_API_HOST + '/api/k8s/allres' ,

    k8sWorkflowCreate: BASE_API_HOST + '/api/k8s/workflow/create' ,
    k8sWorkflowDetail: BASE_API_HOST + '/api/k8s/workflow/detail' ,
    k8sWorkflowList: BASE_API_HOST + '/api/k8s/workflows' ,
    k8sWorkflowDel: BASE_API_HOST + '/api/k8s/workflow/del' ,

    k8sDeploymentList: BASE_API_HOST + '/api/k8s/deployments' ,
    k8sDeploymentDetail: BASE_API_HOST + '/api/k8s/deployment/detail' ,
    k8sDeploymentUpdate: BASE_API_HOST + '/api/k8s/deployment/update' ,
    k8sDeploymentScale: BASE_API_HOST + '/api/k8s/deployment/scale' ,
    k8sDeploymentRestart: BASE_API_HOST + '/api/k8s/deployment/restart' ,
    k8sDeploymentDel: BASE_API_HOST + '/api/k8s/deployment/del' ,
    k8sDeploymentCreate: BASE_API_HOST + '/api/k8s/deployment/create' ,
    k8sDeploymentNumNp: BASE_API_HOST + '/api/k8s/deployment/numnp' ,

    k8sPodList: BASE_API_HOST + '/api/k8s/pods' ,
    k8sPodDetail: BASE_API_HOST + '/api/k8s/pod/detail' ,
    k8sPodUpdate: BASE_API_HOST + '/api/k8s/pod/update' ,
    k8sPodDel: BASE_API_HOST + '/api/k8s/pod/del' ,
    k8sPodContainer: BASE_API_HOST + '/api/k8s/pod/container' ,
    k8sPodLog: BASE_API_HOST + '/api/k8s/pod/log' ,
    k8sPodNumNp: BASE_API_HOST + '/api/k8s/pod/numnp' ,

    k8sDaemonSetList: BASE_API_HOST + '/api/k8s/daemonSets' ,
    k8sDaemonSetDetail: BASE_API_HOST + '/api/k8s/daemonSet/detail' ,
    k8sDaemonSetUpdate: BASE_API_HOST + '/api/k8s/daemonSet/update' ,
    k8sDaemonSetDel: BASE_API_HOST + '/api/k8s/daemonSet/del' ,
    k8sDaemonSetCreate: BASE_API_HOST + '/api/k8s/daemonSet/create' ,
    k8sDaemonSetNumNp: BASE_API_HOST + '/api/k8s/daemonSet/numnp' ,

    k8sStatefulSetList: BASE_API_HOST + '/api/k8s/statefulSets' ,
    k8sStatefulSetDetail: BASE_API_HOST + '/api/k8s/statefulSet/detail' ,
    k8sStatefulSetUpdate: BASE_API_HOST + '/api/k8s/statefulSet/update' ,
    k8sStatefulSetDel: BASE_API_HOST + '/api/k8s/statefulSet/del' ,
    k8sStatefulSetNumNp: BASE_API_HOST + '/api/k8s/statefulSet/numnp' ,

    k8sServiceList: BASE_API_HOST + '/api/k8s/services' ,
    k8sServiceDetail: BASE_API_HOST + '/api/k8s/service/detail' ,
    k8sServiceUpdate: BASE_API_HOST + '/api/k8s/service/update' ,
    k8sServiceDel: BASE_API_HOST + '/api/k8s/service/del' ,
    k8sServiceCreate: BASE_API_HOST + '/api/k8s/service/create' ,

    k8sIngressList: BASE_API_HOST + '/api/k8s/ingresses' ,
    k8sIngressDetail: BASE_API_HOST + '/api/k8s/ingress/detail' ,
    k8sIngressUpdate: BASE_API_HOST + '/api/k8s/ingress/update' ,
    k8sIngressDel: BASE_API_HOST + '/api/k8s/ingress/del' ,
    k8sIngressCreate: BASE_API_HOST + '/api/k8s/ingress/create' ,
    
    k8sConfigMapList: BASE_API_HOST + '/api/k8s/configmaps' ,
    k8sConfigMapDetail: BASE_API_HOST + '/api/k8s/configmap/detail' ,
    k8sConfigMapUpdate: BASE_API_HOST + '/api/k8s/configmap/update' ,
    k8sConfigMapDel: BASE_API_HOST + '/api/k8s/configmap/del' ,

    k8sSecretList: BASE_API_HOST + '/api/k8s/secrets' ,
    k8sSecretDetail: BASE_API_HOST + '/api/k8s/secret/detail' ,
    k8sSecretUpdate: BASE_API_HOST + '/api/k8s/secret/update' ,
    k8sSecretDel: BASE_API_HOST + '/api/k8s/secret/del' ,
    k8sPvcList: BASE_API_HOST + '/api/k8s/pvcs' ,
    k8sPvcDetail: BASE_API_HOST + '/api/k8s/pvc/detail' ,
    k8sPvcUpdate: BASE_API_HOST + '/api/k8s/pvc/update' ,
    k8sPvcDel: BASE_API_HOST + '/api/k8s/pvc/del' ,
    k8sNodeList: BASE_API_HOST + '/api/k8s/nodes' ,
    k8sNodeDetail: BASE_API_HOST + '/api/k8s/node/detail' ,

    k8sNamespaceList: BASE_API_HOST + '/api/k8s/namespaces' ,
    k8sNamespaceDetail: BASE_API_HOST + '/api/k8s/namespace/detail' ,
    k8sNamespaceDel: BASE_API_HOST + '/api/k8s/namespace/del' ,
    k8sNamespaceCreate: BASE_API_HOST + '/api/k8s/namespace/create' ,
    
    k8sPvList: BASE_API_HOST + '/api/k8s/pvs' ,
    k8sPvDetail: BASE_API_HOST + '/api/k8s/pv/detail' ,
    k8sPvDel: BASE_API_HOST + '/api/k8s/pv/del' ,

    // helm应用相关接口
    // release
    helmReleaseList: BASE_API_HOST + '/api/helmstore/releases',
    helmReleaseDetail: BASE_API_HOST + '/api/helmstore/release/detail',
    helmReleaseInstall: BASE_API_HOST + '/api/helmstore/release/install',
    helmReleaseUninstall: BASE_API_HOST + '/api/helmstore/release/uninstall',
    //chart
    helmChartList: BASE_API_HOST + '/api/helmstore/charts',
    helmChartAdd: BASE_API_HOST + '/api/helmstore/chart/add',
    helmChartUpdate: BASE_API_HOST + '/api/helmstore/chart/update',
    helmChartDel: BASE_API_HOST + '/api/helmstore/chart/del',
    helmChartFileUpload: BASE_API_HOST + '/api/helmstore/chartfile/upload',
    helmChartFileDel: BASE_API_HOST + '/api/helmstore/chartfile/del',

    // k8sTerminalWs: ' ws://192.168.102.101:9092/ws' ,
    k8sTerminalWs: ' ws://127.0.0.1:9092/ws' ,
    //编辑器配置
    cmOptions: {
        // 语言及语法模式
        mode: 'text/yaml',
        // 主题
        theme: 'idea',
        // 显示行数
        lineNumbers: true,
        smartIndent: true, //智能缩进
        indentUnit: 4, // 智能缩进单元长度为 4 个空格
        styleActiveLine: true, // 显示选中行的样式
        matchBrackets: true, //每当光标位于匹配的方括号旁边时，都会使其高亮显示
        readOnly: false,
        lineWrapping: true //自动换行
    }
}