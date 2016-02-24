define("crm-modules/common/echarts/chart/boxplot/boxplotVisual", [], function(require, exports, module) {
    var borderColorQuery = [ "itemStyle", "normal", "borderColor" ];
    return function(ecModel, api) {
        var globalColors = ecModel.get("color");
        ecModel.eachRawSeriesByType("boxplot", function(seriesModel) {
            var defaulColor = globalColors[seriesModel.seriesIndex % globalColors.length];
            var data = seriesModel.getData();
            data.setVisual({
                legendSymbol: "roundRect",
                color: seriesModel.get(borderColorQuery) || defaulColor
            });
            if (!ecModel.isSeriesFiltered(seriesModel)) {
                data.each(function(idx) {
                    var itemModel = data.getItemModel(idx);
                    data.setItemVisual(idx, {
                        color: itemModel.get(borderColorQuery, true)
                    });
                });
            }
        });
    };
});