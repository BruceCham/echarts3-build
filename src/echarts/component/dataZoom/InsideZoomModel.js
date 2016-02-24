define("crm-modules/common/echarts/component/dataZoom/InsideZoomModel", [ "./DataZoomModel" ], function(require, exports, module) {
    var DataZoomModel = require("./DataZoomModel");
    return DataZoomModel.extend({
        type: "dataZoom.inside",
        defaultOption: {
            zoomLock: false
        }
    });
});