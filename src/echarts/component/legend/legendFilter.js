define("crm-modules/common/echarts/component/legend/legendFilter", [], function(require, exports, module) {
    return function(ecModel) {
        var legendModels = ecModel.findComponents({
            mainType: "legend"
        });
        if (legendModels && legendModels.length) {
            ecModel.filterSeries(function(series) {
                for (var i = 0; i < legendModels.length; i++) {
                    if (!legendModels[i].isSelected(series.name)) {
                        return false;
                    }
                }
                return true;
            });
        }
    };
});