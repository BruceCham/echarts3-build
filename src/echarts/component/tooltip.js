define("crm-modules/common/echarts/component/tooltip", [ "./tooltip/TooltipModel", "./tooltip/TooltipView", "../echarts", "../echarts" ], function(require, exports, module) {
    require("./tooltip/TooltipModel");
    require("./tooltip/TooltipView");
    require("../echarts").registerAction({
        type: "showTip",
        event: "showTip",
        update: "none"
    }, function() {});
    require("../echarts").registerAction({
        type: "hideTip",
        event: "hideTip",
        update: "none"
    }, function() {});
});