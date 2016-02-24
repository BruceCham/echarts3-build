define("crm-modules/common/echarts/chart/graph/categoryFilter", [], function(require, exports, module) {
    return function(ecModel) {
        var legendModels = ecModel.findComponents({
            mainType: "legend"
        });
        if (!legendModels || !legendModels.length) {
            return;
        }
        ecModel.eachSeriesByType("graph", function(graphSeries) {
            var categoriesData = graphSeries.getCategoriesData();
            var graph = graphSeries.getGraph();
            var data = graph.data;
            var categoryNames = categoriesData.mapArray(categoriesData.getName);
            data.filterSelf(function(idx) {
                var model = data.getItemModel(idx);
                var category = model.getShallow("category");
                if (category != null) {
                    if (typeof category === "number") {
                        category = categoryNames[category];
                    }
                    for (var i = 0; i < legendModels.length; i++) {
                        if (!legendModels[i].isSelected(category)) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }, this);
    };
});