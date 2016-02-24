define("crm-modules/common/echarts/chart/chord", [ "./chord/ChordSeries", "./chord/ChordView", "../echarts", "crm-modules/common/echarts/zrender/core/util", "./chord/chordCircularLayout", "../visual/dataColor", "../processor/dataFilter" ], function(require, exports, module) {
    require("./chord/ChordSeries");
    require("./chord/ChordView");
    var echarts = require("../echarts");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    echarts.registerLayout(require("./chord/chordCircularLayout"));
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/dataColor"), "chord"));
    echarts.registerProcessor("filter", zrUtil.curry(require("../processor/dataFilter"), "pie"));
});