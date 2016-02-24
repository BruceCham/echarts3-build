define("crm-modules/common/echarts/zrender/graphic/Gradient", [], function(require, exports, module) {
    var Gradient = function(colorStops) {
        this.colorStops = colorStops || [];
    };
    Gradient.prototype = {
        constructor: Gradient,
        addColorStop: function(offset, color) {
            this.colorStops.push({
                offset: offset,
                color: color
            });
        }
    };
    return Gradient;
});