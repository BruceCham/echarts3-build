define("crm-modules/common/echarts/component/dataZoom/SelectZoomView", [ "./DataZoomView" ], function(require, exports, module) {
    return require("./DataZoomView").extend({
        type: "dataZoom.select"
    });
});