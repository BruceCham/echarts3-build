define("crm-modules/common/echarts/zrender/graphic/Style", [], function(require, exports, module) {
    var STYLE_LIST_COMMON = [ "lineCap", "lineJoin", "miterLimit", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "shadowColor" ];
    var Style = function(opts) {
        this.extendFrom(opts);
    };
    Style.prototype = {
        constructor: Style,
        fill: "#000000",
        stroke: null,
        opacity: 1,
        lineDash: null,
        lineDashOffset: 0,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        lineWidth: 1,
        strokeNoScale: false,
        text: null,
        textFill: "#000",
        textStroke: null,
        textPosition: "inside",
        textBaseline: null,
        textAlign: null,
        textDistance: 5,
        textShadowBlur: 0,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
        bind: function(ctx, el) {
            var fill = this.fill;
            var stroke = this.stroke;
            for (var i = 0; i < STYLE_LIST_COMMON.length; i++) {
                var styleName = STYLE_LIST_COMMON[i];
                if (this[styleName] != null) {
                    ctx[styleName] = this[styleName];
                }
            }
            if (stroke != null) {
                var lineWidth = this.lineWidth;
                ctx.lineWidth = lineWidth / (this.strokeNoScale && el && el.getLineScale ? el.getLineScale() : 1);
            }
            if (fill != null) {
                ctx.fillStyle = fill.canvasGradient ? fill.canvasGradient : fill;
            }
            if (stroke != null) {
                ctx.strokeStyle = stroke.canvasGradient ? stroke.canvasGradient : stroke;
            }
            this.opacity != null && (ctx.globalAlpha = this.opacity);
        },
        extendFrom: function(otherStyle, overwrite) {
            if (otherStyle) {
                var target = this;
                for (var name in otherStyle) {
                    if (otherStyle.hasOwnProperty(name) && (overwrite || !target.hasOwnProperty(name))) {
                        target[name] = otherStyle[name];
                    }
                }
            }
        },
        set: function(obj, value) {
            if (typeof obj === "string") {
                this[obj] = value;
            } else {
                this.extendFrom(obj, true);
            }
        },
        clone: function() {
            var newStyle = new this.constructor();
            newStyle.extendFrom(this, true);
            return newStyle;
        }
    };
    var styleProto = Style.prototype;
    var name;
    var i;
    for (i = 0; i < STYLE_LIST_COMMON.length; i++) {
        name = STYLE_LIST_COMMON[i];
        if (!(name in styleProto)) {
            styleProto[name] = null;
        }
    }
    return Style;
});