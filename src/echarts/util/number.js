define("crm-modules/common/echarts/util/number", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var number = {};
    var RADIAN_EPSILON = 1e-4;
    function _trim(str) {
        return str.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    number.linearMap = function(val, domain, range, clamp) {
        if (zrUtil.isArray(val)) {
            return zrUtil.map(val, function(v) {
                return number.linearMap(v, domain, range, clamp);
            });
        }
        var sub = domain[1] - domain[0];
        if (sub === 0) {
            return (range[0] + range[1]) / 2;
        }
        var t = (val - domain[0]) / sub;
        if (clamp) {
            t = Math.min(Math.max(t, 0), 1);
        }
        return t * (range[1] - range[0]) + range[0];
    };
    number.parsePercent = function(percent, all) {
        switch (percent) {
          case "center":
          case "middle":
            percent = "50%";
            break;

          case "left":
          case "top":
            percent = "0%";
            break;

          case "right":
          case "bottom":
            percent = "100%";
            break;
        }
        if (typeof percent === "string") {
            if (_trim(percent).match(/%$/)) {
                return parseFloat(percent) / 100 * all;
            }
            return parseFloat(percent);
        }
        return percent == null ? NaN : +percent;
    };
    number.round = function(x) {
        return +(+x).toFixed(12);
    };
    number.asc = function(arr) {
        arr.sort(function(a, b) {
            return a - b;
        });
        return arr;
    };
    number.getPrecision = function(val) {
        var e = 1;
        var count = 0;
        while (Math.round(val * e) / e !== val) {
            e *= 10;
            count++;
        }
        return count;
    };
    number.getPixelPrecision = function(dataExtent, pixelExtent) {
        var log = Math.log;
        var LN10 = Math.LN10;
        var dataQuantity = Math.floor(log(dataExtent[1] - dataExtent[0]) / LN10);
        var sizeQuantity = Math.round(log(Math.abs(pixelExtent[1] - pixelExtent[0])) / LN10);
        return Math.max(-dataQuantity + sizeQuantity, 0);
    };
    number.MAX_SAFE_INTEGER = 9007199254740991;
    number.remRadian = function(radian) {
        var pi2 = Math.PI * 2;
        return (radian % pi2 + pi2) % pi2;
    };
    number.isRadianAroundZero = function(val) {
        return val > -RADIAN_EPSILON && val < RADIAN_EPSILON;
    };
    number.parseDate = function(value) {
        return value instanceof Date ? value : new Date(typeof value === "string" ? value.replace(/-/g, "/") : value);
    };
    return number;
});