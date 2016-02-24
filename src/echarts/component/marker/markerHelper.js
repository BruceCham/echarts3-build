define("crm-modules/common/echarts/component/marker/markerHelper", [ "crm-modules/common/echarts/zrender/core/util", "../../util/number" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var numberUtil = require("../../util/number");
    function getPrecision(data, valueAxisDim, dataIndex) {
        var precision = -1;
        do {
            precision = Math.max(numberUtil.getPrecision(data.get(valueAxisDim, dataIndex)), precision);
            data = data.stackedOn;
        } while (data);
        return precision;
    }
    function markerTypeCalculatorWithExtent(mlType, data, baseAxisDim, valueAxisDim, valueIndex) {
        var coordArr = [];
        var value = mlType === "average" ? data.getSum(valueAxisDim, true) / data.count() : data.getDataExtent(valueAxisDim)[mlType === "max" ? 1 : 0];
        var dataIndex = data.indexOfNearest(valueAxisDim, value);
        coordArr[1 - valueIndex] = data.get(baseAxisDim, dataIndex);
        coordArr[valueIndex] = data.get(valueAxisDim, dataIndex, true);
        var precision = getPrecision(data, valueAxisDim, dataIndex);
        if (precision >= 0) {
            coordArr[valueIndex] = +coordArr[valueIndex].toFixed(precision);
        }
        return coordArr;
    }
    var curry = zrUtil.curry;
    var markerTypeCalculator = {
        min: curry(markerTypeCalculatorWithExtent, "min"),
        max: curry(markerTypeCalculatorWithExtent, "max"),
        average: curry(markerTypeCalculatorWithExtent, "average")
    };
    var dataTransform = function(data, coordSys, item) {
        if ((isNaN(item.x) || isNaN(item.y)) && !zrUtil.isArray(item.coord) && coordSys) {
            var valueAxisDim;
            var baseAxisDim;
            var valueAxis;
            var baseAxis;
            if (item.valueIndex != null) {
                valueAxisDim = coordSys.dimensions[item.valueIndex];
                baseAxisDim = coordSys.dimensions[1 - item.valueIndex];
                valueAxis = coordSys.getAxis(valueAxisDim);
                baseAxis = coordSys.getAxis(baseAxisDim);
            } else {
                baseAxis = coordSys.getBaseAxis();
                valueAxis = coordSys.getOtherAxis(baseAxis);
                baseAxisDim = baseAxis.dim;
                valueAxisDim = valueAxis.dim;
            }
            var valueIndex = item.valueIndex != null ? item.valueIndex : valueAxisDim === "angle" || valueAxisDim === "x" ? 0 : 1;
            item = zrUtil.extend({}, item);
            if (item.type && markerTypeCalculator[item.type] && baseAxis && valueAxis) {
                item.coord = markerTypeCalculator[item.type](data, baseAxis.dim, valueAxisDim, valueIndex);
                item.value = item.coord[valueIndex];
            } else {
                item.coord = [ item.xAxis != null ? item.xAxis : item.radiusAxis, item.yAxis != null ? item.yAxis : item.angleAxis ];
            }
        }
        return item;
    };
    var dataFilter = function(coordSys, item) {
        return coordSys && item.coord && (item.x == null || item.y == null) ? coordSys.containData(item.coord) : true;
    };
    var dimValueGetter = function(item, dimName, dataIndex, dimIndex) {
        if (dimIndex < 2) {
            return item.coord && item.coord[dimIndex];
        } else {
            item.value;
        }
    };
    return {
        dataTransform: dataTransform,
        dataFilter: dataFilter,
        dimValueGetter: dimValueGetter
    };
});