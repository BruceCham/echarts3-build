define("crm-modules/common/echarts/scale/Log", [ "crm-modules/common/echarts/zrender/core/util", "./Scale", "../util/number", "./Interval" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Scale = require("./Scale");
    var numberUtil = require("../util/number");
    var IntervalScale = require("./Interval");
    var scaleProto = Scale.prototype;
    var intervalScaleProto = IntervalScale.prototype;
    var mathFloor = Math.floor;
    var mathCeil = Math.ceil;
    var mathPow = Math.pow;
    var LOG_BASE = 10;
    var mathLog = Math.log;
    var LogScale = Scale.extend({
        type: "log",
        getTicks: function() {
            return zrUtil.map(intervalScaleProto.getTicks.call(this), function(val) {
                return numberUtil.round(mathPow(LOG_BASE, val));
            });
        },
        getLabel: intervalScaleProto.getLabel,
        scale: function(val) {
            val = scaleProto.scale.call(this, val);
            return mathPow(LOG_BASE, val);
        },
        setExtent: function(start, end) {
            start = mathLog(start) / mathLog(LOG_BASE);
            end = mathLog(end) / mathLog(LOG_BASE);
            intervalScaleProto.setExtent.call(this, start, end);
        },
        getExtent: function() {
            var extent = scaleProto.getExtent.call(this);
            extent[0] = mathPow(LOG_BASE, extent[0]);
            extent[1] = mathPow(LOG_BASE, extent[1]);
            return extent;
        },
        unionExtent: function(extent) {
            extent[0] = mathLog(extent[0]) / mathLog(LOG_BASE);
            extent[1] = mathLog(extent[1]) / mathLog(LOG_BASE);
            scaleProto.unionExtent.call(this, extent);
        },
        niceTicks: function(approxTickNum) {
            approxTickNum = approxTickNum || 10;
            var extent = this._extent;
            var span = extent[1] - extent[0];
            if (span === Infinity || span <= 0) {
                return;
            }
            var interval = mathPow(10, mathFloor(mathLog(span / approxTickNum) / Math.LN10));
            var err = approxTickNum / span * interval;
            if (err <= .5) {
                interval *= 10;
            }
            var niceExtent = [ numberUtil.round(mathCeil(extent[0] / interval) * interval), numberUtil.round(mathFloor(extent[1] / interval) * interval) ];
            this._interval = interval;
            this._niceExtent = niceExtent;
        },
        niceExtent: intervalScaleProto.niceExtent
    });
    zrUtil.each([ "contain", "normalize" ], function(methodName) {
        LogScale.prototype[methodName] = function(val) {
            val = mathLog(val) / mathLog(LOG_BASE);
            return scaleProto[methodName].call(this, val);
        };
    });
    LogScale.create = function() {
        return new LogScale();
    };
    return LogScale;
});