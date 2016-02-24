define("crm-modules/common/echarts/action/geoRoam", [ "crm-modules/common/echarts/zrender/core/util", "./roamHelper", "../echarts" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var roamHelper = require("./roamHelper");
    var echarts = require("../echarts");
    var actionInfo = {
        type: "geoRoam",
        event: "geoRoam",
        update: "updateLayout"
    };
    echarts.registerAction(actionInfo, function(payload, ecModel) {
        var componentType = payload.component || "series";
        ecModel.eachComponent(componentType, function(componentModel) {
            if (componentModel.name === payload.name) {
                var geo = componentModel.coordinateSystem;
                if (geo.type !== "geo") {
                    return;
                }
                var roamDetailModel = componentModel.getModel("roamDetail");
                var res = roamHelper.calcPanAndZoom(roamDetailModel, payload);
                componentModel.setRoamPan && componentModel.setRoamPan(res.x, res.y);
                componentModel.setRoamZoom && componentModel.setRoamZoom(res.zoom);
                geo && geo.setPan(res.x, res.y);
                geo && geo.setZoom(res.zoom);
                if (componentType === "series") {
                    zrUtil.each(componentModel.seriesGroup, function(seriesModel) {
                        seriesModel.setRoamPan(res.x, res.y);
                        seriesModel.setRoamZoom(res.zoom);
                    });
                }
            }
        });
    });
});