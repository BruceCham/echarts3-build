define("crm-modules/common/echarts/coord/axisHelper", [ "../scale/Ordinal", "../scale/Interval", "../scale/Time", "../scale/Log", "../scale/Scale", "../util/number", "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/contain/text" ], function(require, exports, module) {
    var OrdinalScale = require("../scale/Ordinal");
    var IntervalScale = require("../scale/Interval");
    require("../scale/Time");
    require("../scale/Log");
    var Scale = require("../scale/Scale");
    var numberUtil = require("../util/number");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var textContain = require("crm-modules/common/echarts/zrender/contain/text");
    var axisHelper = {};
    axisHelper.niceScaleExtent = function(axis, model) {
        var scale = axis.scale;
        if (scale.type === "ordinal") {
            return;
        }
        var min = model.get("min");
        var max = model.get("max");
        var boundaryGap = model.get("boundaryGap");
        if (!zrUtil.isArray(boundaryGap)) {
            boundaryGap = [ boundaryGap || 0, boundaryGap || 0 ];
        }
        boundaryGap[0] = numberUtil.parsePercent(boundaryGap[0], 1);
        boundaryGap[1] = numberUtil.parsePercent(boundaryGap[1], 1);
        var originalExtent = scale.getExtent();
        var span = originalExtent[1] - originalExtent[0];
        var fixMin = true;
        var fixMax = true;
        if (min == null) {
            min = originalExtent[0] - boundaryGap[0] * span;
            fixMin = false;
        }
        if (max == null) {
            max = originalExtent[1] + boundaryGap[1] * span;
            fixMax = false;
        }
        if (min === "dataMin") {
            min = originalExtent[0];
        }
        if (max === "dataMax") {
            max = originalExtent[1];
        }
        scale.setExtent(min, max);
        scale.niceExtent(model.get("splitNumber"), fixMin, fixMax);
        var interval = model.get("interval");
        if (interval != null) {
            scale.setInterval && scale.setInterval(interval);
        }
    };
    axisHelper.createScaleByModel = function(model, axisType) {
        axisType = axisType || model.get("type");
        if (axisType) {
            switch (axisType) {
              case "category":
                return new OrdinalScale(model.getCategories(), [ Infinity, -Infinity ]);

              case "value":
                return new IntervalScale();

              default:
                return (Scale.getClass(axisType) || IntervalScale).create(model);
            }
        }
    };
    axisHelper.ifAxisCrossZero = function(axis) {
        var dataExtent = axis.scale.getExtent();
        var min = dataExtent[0];
        var max = dataExtent[1];
        var optMin = axis.model.get("min");
        var optMax = axis.model.get("max");
        if (!isNaN(optMin)) {
            min = Math.min(optMin, min);
        }
        if (!isNaN(optMax)) {
            max = Math.max(optMax, max);
        }
        return !(min > 0 && max > 0 || min < 0 && max < 0) || axisHelper.ifAxisNeedsCrossZero(axis);
    };
    axisHelper.ifAxisNeedsCrossZero = function(axis) {
        return !axis.model.get("scale");
    };
    axisHelper.getAxisLabelInterval = function(tickCoords, labels, font, isAxisHorizontal) {
        var textSpaceTakenRect;
        var autoLabelInterval = 0;
        var accumulatedLabelInterval = 0;
        for (var i = 0; i < tickCoords.length; i++) {
            var tickCoord = tickCoords[i];
            var rect = textContain.getBoundingRect(labels[i], font, "center", "top");
            rect[isAxisHorizontal ? "x" : "y"] += tickCoord;
            rect[isAxisHorizontal ? "width" : "height"] *= 1.5;
            if (!textSpaceTakenRect) {
                textSpaceTakenRect = rect.clone();
            } else if (textSpaceTakenRect.intersect(rect)) {
                accumulatedLabelInterval++;
                autoLabelInterval = Math.max(autoLabelInterval, accumulatedLabelInterval);
            } else {
                textSpaceTakenRect.union(rect);
                accumulatedLabelInterval = 0;
            }
        }
        return autoLabelInterval;
    };
    axisHelper.getFormattedLabels = function(axis, labelFormatter) {
        var scale = axis.scale;
        var labels = scale.getTicksLabels();
        var ticks = scale.getTicks();
        if (typeof labelFormatter === "string") {
            labelFormatter = function(tpl) {
                return function(val) {
                    return tpl.replace("{value}", val);
                };
            }(labelFormatter);
            return zrUtil.map(labels, labelFormatter);
        } else if (typeof labelFormatter === "function") {
            return zrUtil.map(ticks, function(tick, idx) {
                return labelFormatter(axis.type === "category" ? scale.getLabel(tick) : tick, idx);
            }, this);
        } else {
            return labels;
        }
    };
    return axisHelper;
});