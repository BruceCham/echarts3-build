define("crm-modules/common/echarts/zrender/graphic/shape/Rect", [ "../helper/roundRect", "../Path" ], function(require, exports, module) {
    var roundRectHelper = require("../helper/roundRect");
    return require("../Path").extend({
        type: "rect",
        shape: {
            r: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        buildPath: function(ctx, shape) {
            var x = shape.x;
            var y = shape.y;
            var width = shape.width;
            var height = shape.height;
            if (!shape.r) {
                ctx.rect(x, y, width, height);
            } else {
                roundRectHelper.buildPath(ctx, shape);
            }
            ctx.closePath();
            return;
        }
    });
});