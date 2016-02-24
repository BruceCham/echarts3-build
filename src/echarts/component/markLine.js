define("crm-modules/common/echarts/component/markLine", [ "./marker/MarkLineModel", "./marker/MarkLineView", "../echarts" ], function(require, exports, module) {
    require("./marker/MarkLineModel");
    require("./marker/MarkLineView");
    require("../echarts").registerPreprocessor(function(opt) {
        opt.markLine = opt.markLine || {};
    });
});