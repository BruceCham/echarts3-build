define("crm-modules/common/echarts/component/dataZoom/SelectZoomModel", [ "./DataZoomModel" ], function(require, exports, module) {
    var DataZoomModel = require("./DataZoomModel");
    return DataZoomModel.extend({
        type: "dataZoom.select"
    });
});