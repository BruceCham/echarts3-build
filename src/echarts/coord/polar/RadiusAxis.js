define("crm-modules/common/echarts/coord/polar/RadiusAxis", [ "crm-modules/common/echarts/zrender/core/util", "../Axis" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Axis = require("../Axis");
    function RadiusAxis(scale, radiusExtent) {
        Axis.call(this, "radius", scale, radiusExtent);
        this.type = "category";
    }
    RadiusAxis.prototype = {
        constructor: RadiusAxis,
        dataToRadius: Axis.prototype.dataToCoord,
        radiusToData: Axis.prototype.coordToData
    };
    zrUtil.inherits(RadiusAxis, Axis);
    return RadiusAxis;
});