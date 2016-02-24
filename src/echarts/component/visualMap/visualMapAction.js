define("crm-modules/common/echarts/component/visualMap/visualMapAction", [ "../../echarts" ], function(require, exports, module) {
    var echarts = require("../../echarts");
    var actionInfo = {
        type: "selectDataRange",
        event: "dataRangeSelected",
        update: "update"
    };
    echarts.registerAction(actionInfo, function(payload, ecModel) {
        ecModel.eachComponent({
            mainType: "visualMap",
            query: payload
        }, function(model) {
            model.setSelected(payload.selected);
        });
    });
});