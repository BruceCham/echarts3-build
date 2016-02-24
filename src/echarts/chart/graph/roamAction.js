define("crm-modules/common/echarts/chart/graph/roamAction", [ "../../echarts", "../../action/roamHelper" ], function(require, exports, module) {
    var echarts = require("../../echarts");
    var roamHelper = require("../../action/roamHelper");
    var actionInfo = {
        type: "graphRoam",
        event: "graphRoam",
        update: "none"
    };
    echarts.registerAction(actionInfo, function(payload, ecModel) {
        ecModel.eachComponent({
            mainType: "series",
            query: payload
        }, function(seriesModel) {
            var coordSys = seriesModel.coordinateSystem;
            var roamDetailModel = seriesModel.getModel("roamDetail");
            var res = roamHelper.calcPanAndZoom(roamDetailModel, payload);
            seriesModel.setRoamPan && seriesModel.setRoamPan(res.x, res.y);
            seriesModel.setRoamZoom && seriesModel.setRoamZoom(res.zoom);
            coordSys && coordSys.setPan(res.x, res.y);
            coordSys && coordSys.setZoom(res.zoom);
        });
    });
});