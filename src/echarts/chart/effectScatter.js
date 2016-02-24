define("crm-modules/common/echarts/chart/effectScatter", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./effectScatter/EffectScatterSeries", "./effectScatter/EffectScatterView", "../visual/symbol", "../layout/points" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./effectScatter/EffectScatterSeries");
    require("./effectScatter/EffectScatterView");
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/symbol"), "effectScatter", "circle", null));
    echarts.registerLayout(zrUtil.curry(require("../layout/points"), "effectScatter"));
});