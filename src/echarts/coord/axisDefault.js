define("crm-modules/common/echarts/coord/axisDefault", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var defaultOption = {
        show: true,
        zlevel: 0,
        z: 0,
        inverse: false,
        name: "",
        nameLocation: "end",
        nameTextStyle: {},
        nameGap: 15,
        axisLine: {
            show: true,
            onZero: true,
            lineStyle: {
                color: "#333",
                width: 1,
                type: "solid"
            }
        },
        axisTick: {
            show: true,
            inside: false,
            length: 5,
            lineStyle: {
                color: "#333",
                width: 1
            }
        },
        axisLabel: {
            show: true,
            inside: false,
            rotate: 0,
            margin: 8,
            textStyle: {
                color: "#333",
                fontSize: 12
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: [ "#ccc" ],
                width: 1,
                type: "solid"
            }
        },
        splitArea: {
            show: false,
            areaStyle: {
                color: [ "rgba(250,250,250,0.3)", "rgba(200,200,200,0.3)" ]
            }
        }
    };
    var categoryAxis = zrUtil.merge({
        boundaryGap: true,
        axisTick: {
            interval: "auto"
        },
        axisLabel: {
            interval: "auto"
        }
    }, defaultOption);
    var valueAxis = zrUtil.defaults({
        boundaryGap: [ 0, 0 ],
        splitNumber: 5
    }, defaultOption);
    var timeAxis = zrUtil.defaults({
        scale: true,
        min: "dataMin",
        max: "dataMax"
    }, valueAxis);
    var logAxis = zrUtil.defaults({}, valueAxis);
    logAxis.scale = true;
    return {
        categoryAxis: categoryAxis,
        valueAxis: valueAxis,
        timeAxis: timeAxis,
        logAxis: logAxis
    };
});