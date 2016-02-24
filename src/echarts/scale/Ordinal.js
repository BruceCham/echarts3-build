define("crm-modules/common/echarts/scale/Ordinal", [ "crm-modules/common/echarts/zrender/core/util", "./Scale" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Scale = require("./Scale");
    var scaleProto = Scale.prototype;
    var OrdinalScale = Scale.extend({
        type: "ordinal",
        init: function(data, extent) {
            this._data = data;
            this._extent = extent || [ 0, data.length - 1 ];
        },
        contain: function(rank) {
            return scaleProto.contain.call(this, rank) && this._data[rank] != null;
        },
        normalize: function(val) {
            if (typeof val === "string") {
                val = zrUtil.indexOf(this._data, val);
            }
            return scaleProto.normalize.call(this, val);
        },
        scale: function(val) {
            return Math.round(scaleProto.scale.call(this, val));
        },
        getTicks: function() {
            var ticks = [];
            var extent = this._extent;
            var rank = extent[0];
            while (rank <= extent[1]) {
                ticks.push(rank);
                rank++;
            }
            return ticks;
        },
        getLabel: function(n) {
            return this._data[n];
        },
        count: function() {
            return this._extent[1] - this._extent[0] + 1;
        },
        niceTicks: zrUtil.noop,
        niceExtent: zrUtil.noop
    });
    OrdinalScale.create = function() {
        return new OrdinalScale();
    };
    return OrdinalScale;
});