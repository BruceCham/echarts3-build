define("crm-modules/common/echarts/chart/themeRiver/themeRiverVisual", [], function(require, exports, module) {
    return function(ecModel) {
        ecModel.eachSeriesByType("themeRiver", function(seriesModel) {
            var data = seriesModel.getData();
            var rawData = seriesModel.getRawData();
            var colorList = seriesModel.get("color");
            data.each(function(index) {
                var name = data.getName(index);
                var rawIndex = data.getRawIndex(index);
                rawData.setItemVisual(rawIndex, "color", colorList[(seriesModel.nameMap[name] - 1) % colorList.length]);
            });
        });
    };
});