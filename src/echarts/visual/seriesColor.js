define("crm-modules/common/echarts/visual/seriesColor", [ "crm-modules/common/echarts/zrender/graphic/Gradient" ], function(require, exports, module) {
    var Gradient = require("crm-modules/common/echarts/zrender/graphic/Gradient");
    return function(seriesType, styleType, ecModel) {
        function encodeColor(seriesModel) {
            var colorAccessPath = [ styleType, "normal", "color" ];
            var colorList = ecModel.get("color");
            var data = seriesModel.getData();
            var color = seriesModel.get(colorAccessPath) || colorList[seriesModel.seriesIndex % colorList.length];
            data.setVisual("color", color);
            if (!ecModel.isSeriesFiltered(seriesModel)) {
                if (typeof color === "function" && !(color instanceof Gradient)) {
                    data.each(function(idx) {
                        data.setItemVisual(idx, "color", color(seriesModel.getDataParams(idx)));
                    });
                }
                data.each(function(idx) {
                    var itemModel = data.getItemModel(idx);
                    var color = itemModel.get(colorAccessPath, true);
                    if (color != null) {
                        data.setItemVisual(idx, "color", color);
                    }
                });
            }
        }
        seriesType ? ecModel.eachSeriesByType(seriesType, encodeColor) : ecModel.eachSeries(encodeColor);
    };
});