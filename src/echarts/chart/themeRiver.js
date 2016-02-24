define("crm-modules/common/echarts/chart/themeRiver", [ "../echarts", "crm-modules/common/echarts/zrender/core/util", "./themeRiver/ThemeRiverSeries", "./themeRiver/ThemeRiverView", "./themeRiver/themeRiverLayout", "./themeRiver/themeRiverVisual", "../processor/dataFilter" ], function(require, exports, module) {
    var echarts = require("../echarts");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    require("./themeRiver/ThemeRiverSeries");
    require("./themeRiver/ThemeRiverView");
    echarts.registerLayout(require("./themeRiver/themeRiverLayout"));
    echarts.registerVisualCoding("chart", require("./themeRiver/themeRiverVisual"));
    echarts.registerProcessor("filter", zrUtil.curry(require("../processor/dataFilter"), "themeRiver"));
});