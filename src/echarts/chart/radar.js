define("crm-modules/common/echarts/chart/radar", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./radar/RadarSeries", "./radar/RadarView", "../visual/symbol", "../layout/points", "./radar/backwardCompat" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./radar/RadarSeries");
    require("./radar/RadarView");
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/symbol"), "radar", "circle", null));
    echarts.registerLayout(zrUtil.curry(require("../layout/points"), "radar"));
    echarts.registerPreprocessor(require("./radar/backwardCompat"));
});