define("crm-modules/common/echarts/chart/candlestick/candlestickVisual", [], function(require, exports, module) {
    var positiveBorderColorQuery = [ "itemStyle", "normal", "borderColor" ];
    var negativeBorderColorQuery = [ "itemStyle", "normal", "borderColor0" ];
    var positiveColorQuery = [ "itemStyle", "normal", "color" ];
    var negativeColorQuery = [ "itemStyle", "normal", "color0" ];
    return function(ecModel, api) {
        ecModel.eachRawSeriesByType("candlestick", function(seriesModel) {
            var data = seriesModel.getData();
            data.setVisual({
                legendSymbol: "roundRect"
            });
            if (!ecModel.isSeriesFiltered(seriesModel)) {
                data.each(function(idx) {
                    var itemModel = data.getItemModel(idx);
                    var sign = data.getItemLayout(idx).sign;
                    data.setItemVisual(idx, {
                        color: itemModel.get(sign > 0 ? positiveColorQuery : negativeColorQuery),
                        borderColor: itemModel.get(sign > 0 ? positiveBorderColorQuery : negativeBorderColorQuery)
                    });
                });
            }
        });
    };
});