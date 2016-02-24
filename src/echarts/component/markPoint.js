define("crm-modules/common/echarts/component/markPoint", [ "./marker/MarkPointModel", "./marker/MarkPointView", "../echarts" ], function(require, exports, module) {
    require("./marker/MarkPointModel");
    require("./marker/MarkPointView");
    require("../echarts").registerPreprocessor(function(opt) {
        opt.markPoint = opt.markPoint || {};
    });
});