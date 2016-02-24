define("crm-modules/common/echarts/zrender/contain/util", [], function(require, exports, module) {
    var PI2 = Math.PI * 2;
    return {
        normalizeRadian: function(angle) {
            angle %= PI2;
            if (angle < 0) {
                angle += PI2;
            }
            return angle;
        }
    };
});