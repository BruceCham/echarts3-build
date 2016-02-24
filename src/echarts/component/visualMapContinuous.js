define("crm-modules/common/echarts/component/visualMapContinuous", [ "../echarts", "./visualMap/preprocessor", "./visualMap/typeDefaulter", "./visualMap/visualCoding", "./visualMap/ContinuousModel", "./visualMap/ContinuousView", "./visualMap/visualMapAction" ], function(require, exports, module) {
    require("../echarts").registerPreprocessor(require("./visualMap/preprocessor"));
    require("./visualMap/typeDefaulter");
    require("./visualMap/visualCoding");
    require("./visualMap/ContinuousModel");
    require("./visualMap/ContinuousView");
    require("./visualMap/visualMapAction");
});