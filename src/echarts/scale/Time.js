define("crm-modules/common/echarts/scale/Time", [ "crm-modules/common/echarts/zrender/core/util", "../util/number", "../util/format", "./Interval" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var numberUtil = require("../util/number");
    var formatUtil = require("../util/format");
    var IntervalScale = require("./Interval");
    var intervalScaleProto = IntervalScale.prototype;
    var mathCeil = Math.ceil;
    var mathFloor = Math.floor;
    var ONE_DAY = 36e5 * 24;
    var bisect = function(a, x, lo, hi) {
        while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (a[mid][2] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    };
    var TimeScale = IntervalScale.extend({
        type: "time",
        getLabel: function(val) {
            var stepLvl = this._stepLvl;
            var date = new Date(val);
            return formatUtil.formatTime(stepLvl[0], date);
        },
        niceExtent: function(approxTickNum, fixMin, fixMax) {
            var extent = this._extent;
            if (extent[0] === extent[1]) {
                extent[0] -= ONE_DAY;
                extent[1] += ONE_DAY;
            }
            if (extent[1] === -Infinity && extent[0] === Infinity) {
                var d = new Date();
                extent[1] = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                extent[0] = extent[1] - ONE_DAY;
            }
            this.niceTicks(approxTickNum, fixMin, fixMax);
            var interval = this._interval;
            if (!fixMin) {
                extent[0] = numberUtil.round(mathFloor(extent[0] / interval) * interval);
            }
            if (!fixMax) {
                extent[1] = numberUtil.round(mathCeil(extent[1] / interval) * interval);
            }
        },
        niceTicks: function(approxTickNum) {
            approxTickNum = approxTickNum || 10;
            var extent = this._extent;
            var span = extent[1] - extent[0];
            var approxInterval = span / approxTickNum;
            var scaleLevelsLen = scaleLevels.length;
            var idx = bisect(scaleLevels, approxInterval, 0, scaleLevelsLen);
            var level = scaleLevels[Math.min(idx, scaleLevelsLen - 1)];
            var interval = level[2];
            var niceExtent = [ mathCeil(extent[0] / interval) * interval, mathFloor(extent[1] / interval) * interval ];
            this._stepLvl = level;
            this._interval = interval;
            this._niceExtent = niceExtent;
        }
    });
    zrUtil.each([ "contain", "normalize" ], function(methodName) {
        TimeScale.prototype[methodName] = function(val) {
            val = +numberUtil.parseDate(val);
            return intervalScaleProto[methodName].call(this, val);
        };
    });
    var scaleLevels = [ [ "hh:mm:ss", 1, 1e3 ], [ "hh:mm:ss", 5, 1e3 * 5 ], [ "hh:mm:ss", 10, 1e3 * 10 ], [ "hh:mm:ss", 15, 1e3 * 15 ], [ "hh:mm:ss", 30, 1e3 * 30 ], [ "hh:mm\nMM-dd", 1, 6e4 ], [ "hh:mm\nMM-dd", 5, 6e4 * 5 ], [ "hh:mm\nMM-dd", 10, 6e4 * 10 ], [ "hh:mm\nMM-dd", 15, 6e4 * 15 ], [ "hh:mm\nMM-dd", 30, 6e4 * 30 ], [ "hh:mm\nMM-dd", 1, 36e5 ], [ "hh:mm\nMM-dd", 2, 36e5 * 2 ], [ "hh:mm\nMM-dd", 6, 36e5 * 6 ], [ "hh:mm\nMM-dd", 12, 36e5 * 12 ], [ "MM-dd\nyyyy", 1, ONE_DAY ], [ "week", 7, ONE_DAY * 7 ], [ "month", 1, ONE_DAY * 31 ], [ "quarter", 3, ONE_DAY * 380 / 4 ], [ "half-year", 6, ONE_DAY * 380 / 2 ], [ "year", 1, ONE_DAY * 380 ] ];
    TimeScale.create = function() {
        return new TimeScale();
    };
    return TimeScale;
});