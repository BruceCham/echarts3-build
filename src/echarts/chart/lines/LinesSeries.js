define("crm-modules/common/echarts/chart/lines/LinesSeries", [ "../../model/Series", "../../data/List", "crm-modules/common/echarts/zrender/core/util", "../../CoordinateSystem" ], function(require, exports, module) {
    "use strict";
    var SeriesModel = require("../../model/Series");
    var List = require("../../data/List");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var CoordinateSystem = require("../../CoordinateSystem");
    return SeriesModel.extend({
        type: "series.lines",
        dependencies: [ "grid", "polar" ],
        getInitialData: function(option, ecModel) {
            var fromDataArr = [];
            var toDataArr = [];
            var lineDataArr = [];
            zrUtil.each(option.data, function(opt) {
                fromDataArr.push(opt[0]);
                toDataArr.push(opt[1]);
                lineDataArr.push(zrUtil.extend(zrUtil.extend({}, zrUtil.isArray(opt[0]) ? null : opt[0]), zrUtil.isArray(opt[1]) ? null : opt[1]));
            });
            var coordSys = CoordinateSystem.get(option.coordinateSystem);
            if (!coordSys) {
                throw new Error("Invalid coordinate system");
            }
            var dimensions = coordSys.dimensions;
            var fromData = new List(dimensions, this);
            var toData = new List(dimensions, this);
            var lineData = new List([ "value" ], this);
            function geoCoordGetter(item, dim, dataIndex, dimIndex) {
                return item.coord && item.coord[dimIndex];
            }
            fromData.initData(fromDataArr, null, geoCoordGetter);
            toData.initData(toDataArr, null, geoCoordGetter);
            lineData.initData(lineDataArr);
            this.fromData = fromData;
            this.toData = toData;
            return lineData;
        },
        formatTooltip: function(dataIndex) {
            var fromName = this.fromData.getName(dataIndex);
            var toName = this.toData.getName(dataIndex);
            return fromName + " > " + toName;
        },
        defaultOption: {
            coordinateSystem: "geo",
            zlevel: 0,
            z: 2,
            legendHoverLink: true,
            hoverAnimation: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            geoIndex: 0,
            effect: {
                show: false,
                period: 4,
                symbol: "circle",
                symbolSize: 3,
                trailLength: .2
            },
            large: false,
            largeThreshold: 2e3,
            label: {
                normal: {
                    show: false,
                    position: "end"
                }
            },
            lineStyle: {
                normal: {
                    opacity: .5
                }
            }
        }
    });
});