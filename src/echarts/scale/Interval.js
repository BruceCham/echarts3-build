define("crm-modules/common/echarts/scale/Interval", [ "../util/number", "../util/format", "./Scale" ], function(require, exports, module) {
    var numberUtil = require("../util/number");
    var formatUtil = require("../util/format");
    var Scale = require("./Scale");
    var mathFloor = Math.floor;
    var mathCeil = Math.ceil;
    var IntervalScale = Scale.extend({
        type: "interval",
        _interval: 0,
        setExtent: function(start, end) {
            var thisExtent = this._extent;
            if (!isNaN(start)) {
                thisExtent[0] = parseFloat(start);
            }
            if (!isNaN(end)) {
                thisExtent[1] = parseFloat(end);
            }
        },
        unionExtent: function(other) {
            var extent = this._extent;
            other[0] < extent[0] && (extent[0] = other[0]);
            other[1] > extent[1] && (extent[1] = other[1]);
            IntervalScale.prototype.setExtent.call(this, extent[0], extent[1]);
        },
        getInterval: function() {
            if (!this._interval) {
                this.niceTicks();
            }
            return this._interval;
        },
        setInterval: function(interval) {
            this._interval = interval;
            this._niceExtent = this._extent.slice();
        },
        getTicks: function() {
            if (!this._interval) {
                this.niceTicks();
            }
            var interval = this._interval;
            var extent = this._extent;
            var ticks = [];
            var safeLimit = 1e4;
            if (interval) {
                var niceExtent = this._niceExtent;
                if (extent[0] < niceExtent[0]) {
                    ticks.push(extent[0]);
                }
                var tick = niceExtent[0];
                while (tick <= niceExtent[1]) {
                    ticks.push(tick);
                    tick = numberUtil.round(tick + interval);
                    if (ticks.length > safeLimit) {
                        return [];
                    }
                }
                if (extent[1] > niceExtent[1]) {
                    ticks.push(extent[1]);
                }
            }
            return ticks;
        },
        getTicksLabels: function() {
            var labels = [];
            var ticks = this.getTicks();
            for (var i = 0; i < ticks.length; i++) {
                labels.push(this.getLabel(ticks[i]));
            }
            return labels;
        },
        getLabel: function(data) {
            return formatUtil.addCommas(data);
        },
        niceTicks: function(approxTickNum) {
            approxTickNum = approxTickNum || 10;
            var extent = this._extent;
            var span = extent[1] - extent[0];
            if (span === Infinity || span <= 0) {
                return;
            }
            var interval = Math.pow(10, Math.floor(Math.log(span / approxTickNum) / Math.LN10));
            var err = approxTickNum / span * interval;
            if (err <= .15) {
                interval *= 10;
            } else if (err <= .3) {
                interval *= 5;
            } else if (err <= .45) {
                interval *= 3;
            } else if (err <= .75) {
                interval *= 2;
            }
            var niceExtent = [ numberUtil.round(mathCeil(extent[0] / interval) * interval), numberUtil.round(mathFloor(extent[1] / interval) * interval) ];
            this._interval = interval;
            this._niceExtent = niceExtent;
        },
        niceExtent: function(approxTickNum, fixMin, fixMax) {
            var extent = this._extent;
            if (extent[0] === extent[1]) {
                if (extent[0] !== 0) {
                    var expandSize = extent[0] / 2;
                    extent[0] -= expandSize;
                    extent[1] += expandSize;
                } else {
                    extent[1] = 1;
                }
            }
            if (extent[1] === -Infinity && extent[0] === Infinity) {
                extent[0] = 0;
                extent[1] = 1;
            }
            this.niceTicks(approxTickNum, fixMin, fixMax);
            var interval = this._interval;
            if (!fixMin) {
                extent[0] = numberUtil.round(mathFloor(extent[0] / interval) * interval);
            }
            if (!fixMax) {
                extent[1] = numberUtil.round(mathCeil(extent[1] / interval) * interval);
            }
        }
    });
    IntervalScale.create = function() {
        return new IntervalScale();
    };
    return IntervalScale;
});