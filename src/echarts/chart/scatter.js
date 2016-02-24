define("crm-modules/common/echarts/chart/scatter", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./scatter/ScatterSeries", "./scatter/ScatterView", "../visual/symbol", "../layout/points" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./scatter/ScatterSeries");
    require("./scatter/ScatterView");
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/symbol"), "scatter", "circle", null));
    echarts.registerLayout(zrUtil.curry(require("../layout/points"), "scatter"));
});