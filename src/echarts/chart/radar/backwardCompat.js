define("crm-modules/common/echarts/chart/radar/backwardCompat", [ "crm-modules/common/echarts/zrender/core/util", "../../scale/Interval" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var IntervalScale = require("../../scale/Interval");
    var isArray = zrUtil.isArray;
    var each = zrUtil.each;
    var filter = zrUtil.filter;
    return function(option) {
        var polarOptList = option.polar;
        var radiusAxisOptList = option.radiusAxis;
        var angleAxisOptList = option.angleAxis;
        var radarSeries = filter(option.series, function(seriesOpt) {
            return seriesOpt.type === "radar";
        }) || [];
        if (polarOptList && radarSeries.length) {
            if (!isArray(polarOptList)) {
                polarOptList = [ polarOptList ];
            }
            if (!radiusAxisOptList) {
                radiusAxisOptList = option.radiusAxis = [];
            } else if (!isArray(radiusAxisOptList)) {
                radiusAxisOptList = [ radiusAxisOptList ];
            }
            if (!angleAxisOptList) {
                angleAxisOptList = option.angleAxis = [];
            } else if (!isArray(angleAxisOptList)) {
                angleAxisOptList = [ angleAxisOptList ];
            }
            each(polarOptList, function(polarOpt, idx) {
                if (polarOpt.indicator) {
                    var indicators = zrUtil.map(polarOpt.indicator, function(indicator) {
                        var min = indicator.min;
                        var max = indicator.max;
                        if (max != null && max >= 0) {
                            min = 0;
                        }
                        return {
                            name: indicator.text,
                            min: min,
                            max: max
                        };
                    });
                    var radiusAxisOpt = zrUtil.find(radiusAxisOptList, function(radiusAxisOpt) {
                        return (radiusAxisOpt.polarIndex || 0) === idx;
                    });
                    var angleAxisOpt = zrUtil.find(angleAxisOptList, function(angleAxisOpt) {
                        return (angleAxisOpt.polarIndex || 0) === idx;
                    });
                    if (!radiusAxisOpt) {
                        radiusAxisOpt = {
                            type: "value",
                            polarIndex: idx
                        };
                        radiusAxisOptList.push(radiusAxisOpt);
                    }
                    if (!angleAxisOpt) {
                        angleAxisOpt = {
                            type: "category",
                            polarIndex: idx
                        };
                        angleAxisOptList.push(angleAxisOpt);
                    }
                    angleAxisOpt.data = zrUtil.map(polarOpt.indicator, function(indicator) {
                        var obj = {
                            value: indicator.text
                        };
                        var axisLabel = indicator.axisLabel;
                        if (axisLabel && axisLabel.textStyle) {
                            obj.textStyle = axisLabel.textStyle;
                        }
                        return obj;
                    });
                    angleAxisOpt.startAngle = polarOpt.startAngle || 90;
                    if (polarOpt.axisLine) {
                        angleAxisOpt.splitLine = polarOpt.axisLine;
                    }
                    if (polarOpt.axisLabel) {
                        angleAxisOpt.axisLabel = polarOpt.axisLabel;
                    }
                    if (polarOpt.splitLine) {
                        radiusAxisOpt.splitLine = polarOpt.splitLine;
                    }
                    if (polarOpt.splitArea) {
                        radiusAxisOpt.splitArea = polarOpt.splitArea;
                    }
                    radiusAxisOpt.splitLine = radiusAxisOpt.splitLine || {};
                    radiusAxisOpt.splitArea = radiusAxisOpt.splitArea || {};
                    if (radiusAxisOpt.splitLine.show == null) {
                        radiusAxisOpt.splitLine.show = true;
                    }
                    if (radiusAxisOpt.splitArea.show == null) {
                        radiusAxisOpt.splitArea.show = true;
                    }
                    angleAxisOpt.boundaryGap = false;
                    radiusAxisOpt.min = 0;
                    radiusAxisOpt.max = 1;
                    radiusAxisOpt.interval = 1 / (polarOpt.splitNumber || 5);
                    radiusAxisOpt.axisLine = {
                        show: false
                    };
                    radiusAxisOpt.axisLabel = {
                        show: false
                    };
                    radiusAxisOpt.axisTick = {
                        show: false
                    };
                    var radarSeriesOfSamePolar = filter(radarSeries, function(seriesOpt) {
                        return (seriesOpt.polarIndex || 0) === idx;
                    });
                    var dataGroupPyIndicator = zrUtil.map(indicators, function() {
                        return [];
                    });
                    each(radarSeriesOfSamePolar, function(seriesOpt) {
                        seriesOpt.indicator = indicators;
                        if (seriesOpt.data[0] && zrUtil.isArray(seriesOpt.data[0].value)) {
                            var dataList = seriesOpt.data;
                            var dataOpt = dataList[0];
                            seriesOpt.data = dataOpt.value;
                            seriesOpt.name = dataOpt.name;
                            for (var i = 1; i < dataList.length; i++) {
                                var dataOpt = dataList[i];
                                var newSeriesOpt = zrUtil.clone(seriesOpt);
                                option.series.push(zrUtil.extend(newSeriesOpt, {
                                    name: dataOpt.name,
                                    data: dataOpt.value,
                                    indicator: indicators
                                }));
                            }
                            for (var i = 0; i < dataOpt.value.length; i++) {
                                for (var j = 0; j < dataList.length; j++) {
                                    dataGroupPyIndicator[i].push(dataList[j].value[i]);
                                }
                            }
                        }
                    });
                    each(dataGroupPyIndicator, function(valuePerIndicator, idx) {
                        var intervalScale = new IntervalScale();
                        var min = Infinity;
                        var max = -Infinity;
                        var len = valuePerIndicator.length;
                        if (!len) {
                            return;
                        }
                        for (var i = 0; i < len; i++) {
                            min = Math.min(min, valuePerIndicator[i]);
                            max = Math.max(max, valuePerIndicator[i]);
                        }
                        intervalScale.setExtent(min, max);
                        intervalScale.niceExtent(polarOpt.splitNumber || 5);
                        var intervalExtent = intervalScale.getExtent();
                        if (indicators[idx].min == null) {
                            indicators[idx].min = intervalExtent[0];
                        }
                        if (indicators[idx].max == null) {
                            indicators[idx].max = intervalExtent[1];
                        }
                    });
                }
            });
        }
    };
});