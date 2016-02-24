define("crm-modules/common/echarts/chart/pie", [ "crm-modules/common/echarts/zrender/core/util", "../echarts", "./pie/PieSeries", "./pie/PieView", "../action/createDataSelectAction", "../visual/dataColor", "./pie/pieLayout", "../processor/dataFilter" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    require("./pie/PieSeries");
    require("./pie/PieView");
    require("../action/createDataSelectAction")("pie", [ {
        type: "pieToggleSelect",
        event: "pieselectchanged",
        method: "toggleSelected"
    }, {
        type: "pieSelect",
        event: "pieselected",
        method: "select"
    }, {
        type: "pieUnSelect",
        event: "pieunselected",
        method: "unSelect"
    } ]);
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/dataColor"), "pie"));
    echarts.registerLayout(zrUtil.curry(require("./pie/pieLayout"), "pie"));
    echarts.registerProcessor("filter", zrUtil.curry(require("../processor/dataFilter"), "pie"));
});