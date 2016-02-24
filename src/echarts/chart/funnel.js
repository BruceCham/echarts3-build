define("crm-modules/common/echarts/chart/funnel", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./funnel/FunnelSeries", "./funnel/FunnelView", "../visual/dataColor", "./funnel/funnelLayout", "../processor/dataFilter" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./funnel/FunnelSeries");
    require("./funnel/FunnelView");
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/dataColor"), "funnel"));
    echarts.registerLayout(require("./funnel/funnelLayout"));
    echarts.registerProcessor("filter", zrUtil.curry(require("../processor/dataFilter"), "funnel"));
});