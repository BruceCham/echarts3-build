define("crm-modules/common/echarts/zrender/graphic/LinearGradient", [ "../core/util", "./Gradient" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("../core/util");
    var Gradient = require("./Gradient");
    var LinearGradient = function(x, y, x2, y2, colorStops) {
        this.x = x == null ? 0 : x;
        this.y = y == null ? 0 : y;
        this.x2 = x2 == null ? 1 : x2;
        this.y2 = y2 == null ? 0 : y2;
        Gradient.call(this, colorStops);
    };
    LinearGradient.prototype = {
        constructor: LinearGradient,
        type: "linear",
        updateCanvasGradient: function(shape, ctx) {
            var rect = shape.getBoundingRect();
            var x = this.x * rect.width + rect.x;
            var x2 = this.x2 * rect.width + rect.x;
            var y = this.y * rect.height + rect.y;
            var y2 = this.y2 * rect.height + rect.y;
            var canvasGradient = ctx.createLinearGradient(x, y, x2, y2);
            var colorStops = this.colorStops;
            for (var i = 0; i < colorStops.length; i++) {
                canvasGradient.addColorStop(colorStops[i].offset, colorStops[i].color);
            }
            this.canvasGradient = canvasGradient;
        }
    };
    zrUtil.inherits(LinearGradient, Gradient);
    return LinearGradient;
});