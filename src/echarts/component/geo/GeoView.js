define("crm-modules/common/echarts/component/geo/GeoView", [ "../helper/MapDraw", "../../echarts" ], function(require, exports, module) {
    "use strict";
    var MapDraw = require("../helper/MapDraw");
    return require("../../echarts").extendComponentView({
        type: "geo",
        init: function(ecModel, api) {
            var mapDraw = new MapDraw(api, true);
            this._mapDraw = mapDraw;
            this.group.add(mapDraw.group);
        },
        render: function(geoModel, ecModel, api) {
            geoModel.get("show") && this._mapDraw.draw(geoModel, ecModel, api);
        }
    });
});