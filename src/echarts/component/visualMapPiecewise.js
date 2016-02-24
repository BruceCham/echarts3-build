define("crm-modules/common/echarts/component/visualMapPiecewise", [ "../echarts", "./visualMap/preprocessor", "./visualMap/typeDefaulter", "./visualMap/visualCoding", "./visualMap/PiecewiseModel", "./visualMap/PiecewiseView", "./visualMap/visualMapAction" ], function(require, exports, module) {
    require("../echarts").registerPreprocessor(require("./visualMap/preprocessor"));
    require("./visualMap/typeDefaulter");
    require("./visualMap/visualCoding");
    require("./visualMap/PiecewiseModel");
    require("./visualMap/PiecewiseView");
    require("./visualMap/visualMapAction");
});