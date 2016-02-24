define("crm-modules/common/echarts/zrender/vml/vml", [ "./graphic", "../zrender", "./Painter" ], function(require, exports, module) {
    require("./graphic");
    require("../zrender").registerPainter("vml", require("./Painter"));
});