define("crm-modules/common/echarts/zrender/graphic/shape/Polygon", [ "../helper/poly", "../Path" ], function(require, exports, module) {
    var polyHelper = require("../helper/poly");
    return require("../Path").extend({
        type: "polygon",
        shape: {
            points: null,
            smooth: false,
            smoothConstraint: null
        },
        buildPath: function(ctx, shape) {
            polyHelper.buildPath(ctx, shape, true);
        }
    });
});