define("crm-modules/common/echarts/zrender/config", [], function(require, exports, module) {
    var dpr = 1;
    if (typeof window !== "undefined") {
        dpr = Math.max(window.devicePixelRatio || 1, 1);
    }
    var config = {
        debugMode: 0,
        devicePixelRatio: dpr
    };
    return config;
});