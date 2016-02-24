define("crm-modules/common/echarts/coord/polar/AngleAxis", [ "crm-modules/common/echarts/zrender/core/util", "../Axis" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Axis = require("../Axis");
    function AngleAxis(scale, angleExtent) {
        angleExtent = angleExtent || [ 0, 360 ];
        Axis.call(this, "angle", scale, angleExtent);
        this.type = "category";
    }
    AngleAxis.prototype = {
        constructor: AngleAxis,
        dataToAngle: Axis.prototype.dataToCoord,
        angleToData: Axis.prototype.coordToData
    };
    zrUtil.inherits(AngleAxis, Axis);
    return AngleAxis;
});