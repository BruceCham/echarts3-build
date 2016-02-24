define("crm-modules/common/echarts/component/axis/parallelAxisAction", [ "../../echarts" ], function(require, exports, module) {
    var echarts = require("../../echarts");
    var actionInfo = {
        type: "axisAreaSelect",
        event: "axisAreaSelected",
        update: "updateVisual"
    };
    echarts.registerAction(actionInfo, function(payload, ecModel) {
        ecModel.eachComponent({
            mainType: "parallelAxis",
            query: payload
        }, function(parallelAxisModel) {
            parallelAxisModel.axis.model.setActiveIntervals(payload.intervals);
        });
    });
});