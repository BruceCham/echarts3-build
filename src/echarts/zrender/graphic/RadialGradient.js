define("crm-modules/common/echarts/zrender/graphic/RadialGradient", [ "../core/util", "./Gradient" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("../core/util");
    var Gradient = require("./Gradient");
    var RadialGradient = function(x, y, r, colorStops) {
        this.x = x == null ? .5 : x;
        this.y = y == null ? .5 : y;
        this.r = r == null ? .5 : r;
        Gradient.call(this, colorStops);
    };
    RadialGradient.prototype = {
        constructor: RadialGradient,
        type: "radial",
        updateCanvasGradient: function(shape, ctx) {
            var rect = shape.getBoundingRect();
            var width = rect.width;
            var height = rect.height;
            var min = Math.min(width, height);
            var x = this.x * width + rect.x;
            var y = this.y * height + rect.y;
            var r = this.r * min;
            var canvasGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            var colorStops = this.colorStops;
            for (var i = 0; i < colorStops.length; i++) {
                canvasGradient.addColorStop(colorStops[i].offset, colorStops[i].color);
            }
            this.canvasGradient = canvasGradient;
        }
    };
    zrUtil.inherits(RadialGradient, Gradient);
    return RadialGradient;
});