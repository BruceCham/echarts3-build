define("crm-modules/common/echarts/chart/map", [ "../echarts", "./map/MapSeries", "./map/MapView", "../action/geoRoam", "../coord/geo/geoCreator", "./map/mapSymbolLayout", "./map/mapVisual", "./map/mapDataStatistic", "./map/backwardCompat", "../action/createDataSelectAction" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("./map/MapSeries");
    require("./map/MapView");
    require("../action/geoRoam");
    require("../coord/geo/geoCreator");
    echarts.registerLayout(require("./map/mapSymbolLayout"));
    echarts.registerVisualCoding("chart", require("./map/mapVisual"));
    echarts.registerProcessor("statistic", require("./map/mapDataStatistic"));
    echarts.registerPreprocessor(require("./map/backwardCompat"));
    require("../action/createDataSelectAction")("map", [ {
        type: "mapToggleSelect",
        event: "mapselectchanged",
        method: "toggleSelected"
    }, {
        type: "mapSelect",
        event: "mapselected",
        method: "select"
    }, {
        type: "mapUnSelect",
        event: "mapunselected",
        method: "unSelect"
    } ]);
});