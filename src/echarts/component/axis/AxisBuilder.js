define("crm-modules/common/echarts/component/axis/AxisBuilder", [ "crm-modules/common/echarts/zrender/core/util", "../../util/graphic", "../../model/Model", "../../util/number" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var graphic = require("../../util/graphic");
    var Model = require("../../model/Model");
    var numberUtil = require("../../util/number");
    var remRadian = numberUtil.remRadian;
    var isRadianAroundZero = numberUtil.isRadianAroundZero;
    var PI = Math.PI;
    var AxisBuilder = function(axisModel, opt) {
        this.opt = opt;
        this.axisModel = axisModel;
        zrUtil.defaults(opt, {
            labelOffset: 0,
            nameDirection: 1,
            tickDirection: 1,
            labelDirection: 1,
            silent: true
        });
        this.group = new graphic.Group({
            position: opt.position.slice(),
            rotation: opt.rotation
        });
    };
    AxisBuilder.prototype = {
        constructor: AxisBuilder,
        hasBuilder: function(name) {
            return !!builders[name];
        },
        add: function(name) {
            builders[name].call(this);
        },
        getGroup: function() {
            return this.group;
        }
    };
    var builders = {
        axisLine: function() {
            var opt = this.opt;
            var axisModel = this.axisModel;
            if (!axisModel.get("axisLine.show")) {
                return;
            }
            var extent = this.axisModel.axis.getExtent();
            this.group.add(new graphic.Line({
                shape: {
                    x1: extent[0],
                    y1: 0,
                    x2: extent[1],
                    y2: 0
                },
                style: zrUtil.extend({
                    lineCap: "round"
                }, axisModel.getModel("axisLine.lineStyle").getLineStyle()),
                strokeContainThreshold: opt.strokeContainThreshold,
                silent: !!opt.silent,
                z2: 1
            }));
        },
        axisTick: function() {
            var axisModel = this.axisModel;
            if (!axisModel.get("axisTick.show")) {
                return;
            }
            var axis = axisModel.axis;
            var tickModel = axisModel.getModel("axisTick");
            var opt = this.opt;
            var lineStyleModel = tickModel.getModel("lineStyle");
            var tickLen = tickModel.get("length");
            var tickInterval = getInterval(tickModel, opt.labelInterval);
            var ticksCoords = axis.getTicksCoords();
            var tickLines = [];
            for (var i = 0; i < ticksCoords.length; i++) {
                if (ifIgnoreOnTick(axis, i, tickInterval)) {
                    continue;
                }
                var tickCoord = ticksCoords[i];
                tickLines.push(new graphic.Line(graphic.subPixelOptimizeLine({
                    shape: {
                        x1: tickCoord,
                        y1: 0,
                        x2: tickCoord,
                        y2: opt.tickDirection * tickLen
                    },
                    style: {
                        lineWidth: lineStyleModel.get("width")
                    },
                    silent: true
                })));
            }
            this.group.add(graphic.mergePath(tickLines, {
                style: lineStyleModel.getLineStyle(),
                silent: true
            }));
        },
        axisLabel: function() {
            var axisModel = this.axisModel;
            if (!axisModel.get("axisLabel.show")) {
                return;
            }
            var opt = this.opt;
            var axis = axisModel.axis;
            var labelModel = axisModel.getModel("axisLabel");
            var textStyleModel = labelModel.getModel("textStyle");
            var labelMargin = labelModel.get("margin");
            var ticks = axis.scale.getTicks();
            var labels = axisModel.getFormattedLabels();
            var labelRotation = opt.labelRotation;
            if (labelRotation == null) {
                labelRotation = labelModel.get("rotate") || 0;
            }
            labelRotation = labelRotation * PI / 180;
            var labelLayout = innerTextLayout(opt, labelRotation, opt.labelDirection);
            var categoryData = axisModel.get("data");
            var textEls = [];
            for (var i = 0; i < ticks.length; i++) {
                if (ifIgnoreOnTick(axis, i, opt.labelInterval)) {
                    continue;
                }
                var itemTextStyleModel = textStyleModel;
                if (categoryData && categoryData[i] && categoryData[i].textStyle) {
                    itemTextStyleModel = new Model(categoryData[i].textStyle, textStyleModel, axisModel.ecModel);
                }
                var tickCoord = axis.dataToCoord(ticks[i]);
                var pos = [ tickCoord, opt.labelOffset + opt.labelDirection * labelMargin ];
                var textEl = new graphic.Text({
                    style: {
                        text: labels[i],
                        textAlign: itemTextStyleModel.get("align", true) || labelLayout.textAlign,
                        textBaseline: itemTextStyleModel.get("baseline", true) || labelLayout.textBaseline,
                        textFont: itemTextStyleModel.getFont(),
                        fill: itemTextStyleModel.getTextColor()
                    },
                    position: pos,
                    rotation: labelLayout.rotation,
                    silent: true,
                    z2: 10
                });
                textEls.push(textEl);
                this.group.add(textEl);
            }
            function isTwoLabelOverlapped(current, next) {
                var firstRect = current && current.getBoundingRect().clone();
                var nextRect = next && next.getBoundingRect().clone();
                if (firstRect && nextRect) {
                    firstRect.applyTransform(current.getLocalTransform());
                    nextRect.applyTransform(next.getLocalTransform());
                    return firstRect.intersect(nextRect);
                }
            }
            if (axis.type !== "category") {
                if (axisModel.get("min")) {
                    var firstLabel = textEls[0];
                    var nextLabel = textEls[1];
                    if (isTwoLabelOverlapped(firstLabel, nextLabel)) {
                        firstLabel.ignore = true;
                    }
                }
                if (axisModel.get("max")) {
                    var lastLabel = textEls[textEls.length - 1];
                    var prevLabel = textEls[textEls.length - 2];
                    if (isTwoLabelOverlapped(prevLabel, lastLabel)) {
                        lastLabel.ignore = true;
                    }
                }
            }
        },
        axisName: function() {
            var opt = this.opt;
            var axisModel = this.axisModel;
            var name = this.opt.axisName;
            if (name == null) {
                name = axisModel.get("name");
            }
            if (!name) {
                return;
            }
            var nameLocation = axisModel.get("nameLocation");
            var nameDirection = opt.nameDirection;
            var textStyleModel = axisModel.getModel("nameTextStyle");
            var gap = axisModel.get("nameGap") || 0;
            var extent = this.axisModel.axis.getExtent();
            var gapSignal = extent[0] > extent[1] ? -1 : 1;
            var pos = [ nameLocation === "start" ? extent[0] - gapSignal * gap : nameLocation === "end" ? extent[1] + gapSignal * gap : (extent[0] + extent[1]) / 2, nameLocation === "middle" ? opt.labelOffset + nameDirection * gap : 0 ];
            var labelLayout;
            if (nameLocation === "middle") {
                labelLayout = innerTextLayout(opt, opt.rotation, nameDirection);
            } else {
                labelLayout = endTextLayout(opt, nameLocation, extent);
            }
            this.group.add(new graphic.Text({
                style: {
                    text: name,
                    textFont: textStyleModel.getFont(),
                    fill: textStyleModel.getTextColor() || axisModel.get("axisLine.lineStyle.color"),
                    textAlign: labelLayout.textAlign,
                    textBaseline: labelLayout.textBaseline
                },
                position: pos,
                rotation: labelLayout.rotation,
                silent: true,
                z2: 1
            }));
        }
    };
    function innerTextLayout(opt, textRotation, direction) {
        var rotationDiff = remRadian(textRotation - opt.rotation);
        var textAlign;
        var textBaseline;
        if (isRadianAroundZero(rotationDiff)) {
            textBaseline = direction > 0 ? "top" : "bottom";
            textAlign = "center";
        } else if (isRadianAroundZero(rotationDiff - PI)) {
            textBaseline = direction > 0 ? "bottom" : "top";
            textAlign = "center";
        } else {
            textBaseline = "middle";
            if (rotationDiff > 0 && rotationDiff < PI) {
                textAlign = direction > 0 ? "right" : "left";
            } else {
                textAlign = direction > 0 ? "left" : "right";
            }
        }
        return {
            rotation: rotationDiff,
            textAlign: textAlign,
            textBaseline: textBaseline
        };
    }
    function endTextLayout(opt, textPosition, extent) {
        var rotationDiff = remRadian(-opt.rotation);
        var textAlign;
        var textBaseline;
        var inverse = extent[0] > extent[1];
        var onLeft = textPosition === "start" && !inverse || textPosition !== "start" && inverse;
        if (isRadianAroundZero(rotationDiff - PI / 2)) {
            textBaseline = onLeft ? "bottom" : "top";
            textAlign = "center";
        } else if (isRadianAroundZero(rotationDiff - PI * 1.5)) {
            textBaseline = onLeft ? "top" : "bottom";
            textAlign = "center";
        } else {
            textBaseline = "middle";
            if (rotationDiff < PI * 1.5 && rotationDiff > PI / 2) {
                textAlign = onLeft ? "left" : "right";
            } else {
                textAlign = onLeft ? "right" : "left";
            }
        }
        return {
            rotation: rotationDiff,
            textAlign: textAlign,
            textBaseline: textBaseline
        };
    }
    var ifIgnoreOnTick = AxisBuilder.ifIgnoreOnTick = function(axis, i, interval) {
        var rawTick;
        var scale = axis.scale;
        return scale.type === "ordinal" && (typeof interval === "function" ? (rawTick = scale.getTicks()[i], 
        !interval(rawTick, scale.getLabel(rawTick))) : i % (interval + 1));
    };
    var getInterval = AxisBuilder.getInterval = function(model, labelInterval) {
        var interval = model.get("interval");
        if (interval == null || interval == "auto") {
            interval = labelInterval;
        }
        return interval;
    };
    return AxisBuilder;
});