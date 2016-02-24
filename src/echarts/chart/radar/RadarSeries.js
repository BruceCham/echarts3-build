define("crm-modules/common/echarts/chart/radar/RadarSeries", [ "../helper/createListFromArray", "../../model/Series", "crm-modules/common/echarts/zrender/core/util", "../../util/number", "../../component/polar" ], function(require, exports, module) {
    "use strict";
    var createListFromArray = require("../helper/createListFromArray");
    var SeriesModel = require("../../model/Series");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var numberUtil = require("../../util/number");
    var linearMap = numberUtil.linearMap;
    require("../../component/polar");
    return SeriesModel.extend({
        type: "series.radar",
        dependencies: [ "polar" ],
        getInitialData: function(option, ecModel) {
            var indicators = option.indicator;
            var data = createListFromArray(option.data, this, ecModel);
            if (indicators) {
                var indicatorMap = zrUtil.reduce(indicators, function(map, value, idx) {
                    map[value.name] = value;
                    return map;
                }, {});
                data = data.map([ "radius" ], function(radius, idx) {
                    var indicator = indicatorMap[data.getName(idx)];
                    if (indicator && indicator.max) {
                        return linearMap(radius, [ indicator.min || 0, indicator.max ], [ 0, 1 ]);
                    }
                });
                var oldGetRawValue = this.getRawValue;
                this.getRawValue = function(idx) {
                    var val = oldGetRawValue.call(this, idx);
                    var indicator = indicatorMap[data.getName(idx)];
                    if (indicator && indicator.max != null) {
                        return linearMap(val, [ 0, 1 ], [ indicator.min || 0, indicator.max ]);
                    }
                };
            }
            return data;
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "polar",
            legendHoverLink: true,
            polarIndex: 0,
            lineStyle: {
                normal: {
                    width: 2,
                    type: "solid"
                }
            },
            symbol: "emptyCircle",
            symbolSize: 4,
            showAllSymbol: false
        }
    });
});