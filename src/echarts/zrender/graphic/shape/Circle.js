define("crm-modules/common/echarts/zrender/graphic/shape/Circle", [ "../Path" ], function(require, exports, module) {
    "use strict";
    return require("../Path").extend({
        type: "circle",
        shape: {
            cx: 0,
            cy: 0,
            r: 0
        },
        buildPath: function(ctx, shape) {
            ctx.moveTo(shape.cx + shape.r, shape.cy);
            ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2, true);
            return;
        }
    });
});