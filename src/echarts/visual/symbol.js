define("crm-modules/common/echarts/visual/symbol", [], function(require, exports, module) {
    function isSymbolNone(symbolType) {
        return symbolType === "none";
    }
    return function(seriesType, defaultSymbolType, legendSymbol, ecModel, api) {
        ecModel.eachRawSeriesByType(seriesType, function(seriesModel) {
            var data = seriesModel.getData();
            var symbolType = seriesModel.get("symbol") || defaultSymbolType;
            var symbolSize = seriesModel.get("symbolSize");
            data.setVisual({
                legendSymbol: legendSymbol || symbolType,
                symbol: symbolType,
                symbolSize: symbolSize
            });
            if (!ecModel.isSeriesFiltered(seriesModel)) {
                if (typeof symbolSize === "function") {
                    data.each(function(idx) {
                        var rawValue = seriesModel.getRawValue(idx);
                        var params = seriesModel.getDataParams(idx);
                        data.setItemVisual(idx, "symbolSize", symbolSize(rawValue, params));
                    });
                }
                data.each(function(idx) {
                    var itemModel = data.getItemModel(idx);
                    var itemSymbolType = itemModel.get("symbol", true);
                    var itemSymbolSize = itemModel.get("symbolSize", true);
                    if (itemSymbolType != null) {
                        data.setItemVisual(idx, "symbol", itemSymbolType);
                    }
                    if (itemSymbolSize != null) {
                        data.setItemVisual(idx, "symbolSize", itemSymbolSize);
                    }
                });
            }
        });
    };
});