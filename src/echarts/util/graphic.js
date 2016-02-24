define("crm-modules/common/echarts/util/graphic", [ "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/tool/path", "crm-modules/common/echarts/zrender/graphic/Path", "crm-modules/common/echarts/zrender/tool/color", "crm-modules/common/echarts/zrender/core/matrix", "crm-modules/common/echarts/zrender/core/vector", "crm-modules/common/echarts/zrender/graphic/Gradient", "crm-modules/common/echarts/zrender/container/Group", "crm-modules/common/echarts/zrender/graphic/Image", "crm-modules/common/echarts/zrender/graphic/Text", "crm-modules/common/echarts/zrender/graphic/shape/Circle", "crm-modules/common/echarts/zrender/graphic/shape/Sector", "crm-modules/common/echarts/zrender/graphic/shape/Polygon", "crm-modules/common/echarts/zrender/graphic/shape/Polyline", "crm-modules/common/echarts/zrender/graphic/shape/Rect", "crm-modules/common/echarts/zrender/graphic/shape/Line", "crm-modules/common/echarts/zrender/graphic/shape/BezierCurve", "crm-modules/common/echarts/zrender/graphic/shape/Arc", "crm-modules/common/echarts/zrender/graphic/LinearGradient", "crm-modules/common/echarts/zrender/graphic/RadialGradient", "crm-modules/common/echarts/zrender/core/BoundingRect" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var pathTool = require("crm-modules/common/echarts/zrender/tool/path");
    var round = Math.round;
    var Path = require("crm-modules/common/echarts/zrender/graphic/Path");
    var colorTool = require("crm-modules/common/echarts/zrender/tool/color");
    var matrix = require("crm-modules/common/echarts/zrender/core/matrix");
    var vector = require("crm-modules/common/echarts/zrender/core/vector");
    var Gradient = require("crm-modules/common/echarts/zrender/graphic/Gradient");
    var graphic = {};
    graphic.Group = require("crm-modules/common/echarts/zrender/container/Group");
    graphic.Image = require("crm-modules/common/echarts/zrender/graphic/Image");
    graphic.Text = require("crm-modules/common/echarts/zrender/graphic/Text");
    graphic.Circle = require("crm-modules/common/echarts/zrender/graphic/shape/Circle");
    graphic.Sector = require("crm-modules/common/echarts/zrender/graphic/shape/Sector");
    graphic.Polygon = require("crm-modules/common/echarts/zrender/graphic/shape/Polygon");
    graphic.Polyline = require("crm-modules/common/echarts/zrender/graphic/shape/Polyline");
    graphic.Rect = require("crm-modules/common/echarts/zrender/graphic/shape/Rect");
    graphic.Line = require("crm-modules/common/echarts/zrender/graphic/shape/Line");
    graphic.BezierCurve = require("crm-modules/common/echarts/zrender/graphic/shape/BezierCurve");
    graphic.Arc = require("crm-modules/common/echarts/zrender/graphic/shape/Arc");
    graphic.LinearGradient = require("crm-modules/common/echarts/zrender/graphic/LinearGradient");
    graphic.RadialGradient = require("crm-modules/common/echarts/zrender/graphic/RadialGradient");
    graphic.BoundingRect = require("crm-modules/common/echarts/zrender/core/BoundingRect");
    graphic.extendShape = function(opts) {
        return Path.extend(opts);
    };
    graphic.extendPath = function(pathData, opts) {
        return pathTool.extendFromString(pathData, opts);
    };
    graphic.makePath = function(pathData, opts, rect, layout) {
        var path = pathTool.createFromString(pathData, opts);
        var boundingRect = path.getBoundingRect();
        if (rect) {
            var aspect = boundingRect.width / boundingRect.height;
            if (layout === "center") {
                var width = rect.height * aspect;
                var height;
                if (width <= rect.width) {
                    height = rect.height;
                } else {
                    width = rect.width;
                    height = width / aspect;
                }
                var cx = rect.x + rect.width / 2;
                var cy = rect.y + rect.height / 2;
                rect.x = cx - width / 2;
                rect.y = cy - height / 2;
                rect.width = width;
                rect.height = height;
            }
            this.resizePath(path, rect);
        }
        return path;
    };
    graphic.mergePath = pathTool.mergePath, graphic.resizePath = function(path, rect) {
        if (!path.applyTransform) {
            return;
        }
        var pathRect = path.getBoundingRect();
        var m = pathRect.calculateTransform(rect);
        path.applyTransform(m);
    };
    graphic.subPixelOptimizeLine = function(param) {
        var subPixelOptimize = graphic.subPixelOptimize;
        var shape = param.shape;
        var lineWidth = param.style.lineWidth;
        if (round(shape.x1 * 2) === round(shape.x2 * 2)) {
            shape.x1 = shape.x2 = subPixelOptimize(shape.x1, lineWidth, true);
        }
        if (round(shape.y1 * 2) === round(shape.y2 * 2)) {
            shape.y1 = shape.y2 = subPixelOptimize(shape.y1, lineWidth, true);
        }
        return param;
    };
    graphic.subPixelOptimizeRect = function(param) {
        var subPixelOptimize = graphic.subPixelOptimize;
        var shape = param.shape;
        var lineWidth = param.style.lineWidth;
        var originX = shape.x;
        var originY = shape.y;
        var originWidth = shape.width;
        var originHeight = shape.height;
        shape.x = subPixelOptimize(shape.x, lineWidth, true);
        shape.y = subPixelOptimize(shape.y, lineWidth, true);
        shape.width = Math.max(subPixelOptimize(originX + originWidth, lineWidth, false) - shape.x, originWidth === 0 ? 0 : 1);
        shape.height = Math.max(subPixelOptimize(originY + originHeight, lineWidth, false) - shape.y, originHeight === 0 ? 0 : 1);
        return param;
    };
    graphic.subPixelOptimize = function(position, lineWidth, positiveOrNegative) {
        var doubledPosition = round(position * 2);
        return (doubledPosition + round(lineWidth)) % 2 === 0 ? doubledPosition / 2 : (doubledPosition + (positiveOrNegative ? 1 : -1)) / 2;
    };
    function doSingleEnterHover(el) {
        if (el.__isHover) {
            return;
        }
        if (el.__hoverStlDirty) {
            var stroke = el.style.stroke;
            var fill = el.style.fill;
            var hoverStyle = el.__hoverStl;
            hoverStyle.fill = hoverStyle.fill || (fill instanceof Gradient ? fill : colorTool.lift(fill, -.1));
            hoverStyle.stroke = hoverStyle.stroke || (stroke instanceof Gradient ? stroke : colorTool.lift(stroke, -.1));
            var normalStyle = {};
            for (var name in hoverStyle) {
                if (hoverStyle.hasOwnProperty(name)) {
                    normalStyle[name] = el.style[name];
                }
            }
            el.__normalStl = normalStyle;
            el.__hoverStlDirty = false;
        }
        el.setStyle(el.__hoverStl);
        el.z2 += 1;
        el.__isHover = true;
    }
    function doSingleLeaveHover(el) {
        if (!el.__isHover) {
            return;
        }
        var normalStl = el.__normalStl;
        normalStl && el.setStyle(normalStl);
        el.z2 -= 1;
        el.__isHover = false;
    }
    function doEnterHover(el) {
        el.type === "group" ? el.traverse(function(child) {
            if (child.type !== "group") {
                doSingleEnterHover(child);
            }
        }) : doSingleEnterHover(el);
    }
    function doLeaveHover(el) {
        el.type === "group" ? el.traverse(function(child) {
            if (child.type !== "group") {
                doSingleLeaveHover(child);
            }
        }) : doSingleLeaveHover(el);
    }
    function setElementHoverStl(el, hoverStl) {
        el.__hoverStl = el.hoverStyle || hoverStl;
        el.__hoverStlDirty = true;
    }
    function onElementMouseOver() {
        !this.__isEmphasis && doEnterHover(this);
    }
    function onElementMouseOut() {
        !this.__isEmphasis && doLeaveHover(this);
    }
    function enterEmphasis() {
        this.__isEmphasis = true;
        doEnterHover(this);
    }
    function leaveEmphasis() {
        this.__isEmphasis = false;
        doLeaveHover(this);
    }
    graphic.setHoverStyle = function(el, hoverStyle) {
        hoverStyle = hoverStyle || {};
        el.type === "group" ? el.traverse(function(child) {
            if (child.type !== "group") {
                setElementHoverStl(child, hoverStyle);
            }
        }) : setElementHoverStl(el, hoverStyle);
        el.on("mouseover", onElementMouseOver).on("mouseout", onElementMouseOut);
        el.on("emphasis", enterEmphasis).on("normal", leaveEmphasis);
    };
    graphic.setText = function(textStyle, labelModel, color) {
        var labelPosition = labelModel.getShallow("position") || "inside";
        var labelColor = labelPosition.indexOf("inside") >= 0 ? "white" : color;
        var textStyleModel = labelModel.getModel("textStyle");
        zrUtil.extend(textStyle, {
            textDistance: labelModel.getShallow("distance") || 5,
            textFont: textStyleModel.getFont(),
            textPosition: labelPosition,
            textFill: textStyleModel.getTextColor() || labelColor
        });
    };
    function animateOrSetProps(isUpdate, el, props, animatableModel, cb) {
        var postfix = isUpdate ? "Update" : "";
        var duration = animatableModel && animatableModel.getShallow("animationDuration" + postfix);
        var animationEasing = animatableModel && animatableModel.getShallow("animationEasing" + postfix);
        animatableModel && animatableModel.getShallow("animation") ? el.animateTo(props, duration, animationEasing, cb) : (el.attr(props), 
        cb && cb());
    }
    graphic.updateProps = zrUtil.curry(animateOrSetProps, true);
    graphic.initProps = zrUtil.curry(animateOrSetProps, false);
    graphic.getTransform = function(target, ancestor) {
        var mat = matrix.identity([]);
        while (target && target !== ancestor) {
            matrix.mul(mat, target.getLocalTransform(), mat);
            target = target.parent;
        }
        return mat;
    };
    graphic.applyTransform = function(vertex, transform, invert) {
        if (invert) {
            transform = matrix.invert([], transform);
        }
        return vector.applyTransform([], vertex, transform);
    };
    graphic.transformDirection = function(direction, transform, invert) {
        var hBase = transform[4] === 0 || transform[5] === 0 || transform[0] === 0 ? 1 : Math.abs(2 * transform[4] / transform[0]);
        var vBase = transform[4] === 0 || transform[5] === 0 || transform[2] === 0 ? 1 : Math.abs(2 * transform[4] / transform[2]);
        var vertex = [ direction === "left" ? -hBase : direction === "right" ? hBase : 0, direction === "top" ? -vBase : direction === "bottom" ? vBase : 0 ];
        vertex = graphic.applyTransform(vertex, transform, invert);
        return Math.abs(vertex[0]) > Math.abs(vertex[1]) ? vertex[0] > 0 ? "right" : "left" : vertex[1] > 0 ? "bottom" : "top";
    };
    return graphic;
});