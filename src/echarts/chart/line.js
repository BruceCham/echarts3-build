define("crm-modules/common/echarts/chart/line", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./line/LineSeries", "./line/LineView", "../visual/symbol", "../layout/points" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./line/LineSeries");
    require("./line/LineView");
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/symbol"), "line", "circle", "line"));
    echarts.registerLayout(zrUtil.curry(require("../layout/points"), "line"));
});