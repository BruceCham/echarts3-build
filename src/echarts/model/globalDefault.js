define("crm-modules/common/echarts/model/globalDefault", [], function(require, exports, module) {
    var platform = "";
    if (typeof navigator !== "undefined") {
        platform = navigator.platform || "";
    }
    return {
        color: [ "#c23531", "#314656", "#61a0a8", "#dd8668", "#91c7ae", "#6e7074", "#61a0a8", "#bda29a", "#44525d", "#c4ccd3" ],
        grid: {},
        textStyle: {
            fontFamily: platform.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
            fontSize: 12,
            fontStyle: "normal",
            fontWeight: "normal"
        },
        animation: true,
        animationThreshold: 2e3,
        animationDuration: 1e3,
        animationDurationUpdate: 300,
        animationEasing: "exponentialOut",
        animationEasingUpdate: "cubicOut"
    };
});