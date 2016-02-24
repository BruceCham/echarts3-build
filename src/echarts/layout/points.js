define("crm-modules/common/echarts/layout/points", [], function(require, exports, module) {
    return function(seriesType, ecModel, api) {
        ecModel.eachSeriesByType(seriesType, function(seriesModel) {
            var data = seriesModel.getData();
            var coordSys = seriesModel.coordinateSystem;
            var dims = coordSys.dimensions;
            data.each(dims, function(x, y, idx) {
                var point;
                if (!isNaN(x) && !isNaN(y)) {
                    point = coordSys.dataToPoint([ x, y ]);
                } else {
                    point = [ NaN, NaN ];
                }
                data.setItemLayout(idx, point);
            }, true);
        });
    };
});