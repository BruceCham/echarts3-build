define("crm-modules/common/echarts/component/dataZoom", [ "./dataZoom/typeDefaulter", "./dataZoom/DataZoomModel", "./dataZoom/DataZoomView", "./dataZoom/SliderZoomModel", "./dataZoom/SliderZoomView", "./dataZoom/InsideZoomModel", "./dataZoom/InsideZoomView", "./dataZoom/dataZoomProcessor", "./dataZoom/dataZoomAction" ], function(require, exports, module) {
    require("./dataZoom/typeDefaulter");
    require("./dataZoom/DataZoomModel");
    require("./dataZoom/DataZoomView");
    require("./dataZoom/SliderZoomModel");
    require("./dataZoom/SliderZoomView");
    require("./dataZoom/InsideZoomModel");
    require("./dataZoom/InsideZoomView");
    require("./dataZoom/dataZoomProcessor");
    require("./dataZoom/dataZoomAction");
});