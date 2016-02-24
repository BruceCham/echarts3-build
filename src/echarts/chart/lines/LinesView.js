define("crm-modules/common/echarts/chart/lines/LinesView", [ "../helper/LineDraw", "../helper/EffectLine", "../helper/Line", "../../echarts" ], function(require, exports, module) {
    var LineDraw = require("../helper/LineDraw");
    var EffectLine = require("../helper/EffectLine");
    var Line = require("../helper/Line");
    require("../../echarts").extendChartView({
        type: "lines",
        init: function() {},
        render: function(seriesModel, ecModel, api) {
            var data = seriesModel.getData();
            var lineDraw = this._lineDraw;
            var hasEffect = seriesModel.get("effect.show");
            if (hasEffect !== this._hasEffet) {
                if (lineDraw) {
                    lineDraw.remove();
                }
                lineDraw = this._lineDraw = new LineDraw(hasEffect ? EffectLine : Line);
                this._hasEffet = hasEffect;
            }
            var zlevel = seriesModel.get("zlevel");
            var trailLength = seriesModel.get("effect.trailLength");
            var zr = api.getZr();
            zr.painter.getLayer(zlevel).clear(true);
            if (this._lastZlevel != null) {
                zr.configLayer(this._lastZlevel, {
                    motionBlur: false
                });
            }
            if (hasEffect && trailLength) {
                zr.configLayer(zlevel, {
                    motionBlur: true,
                    lastFrameAlpha: Math.max(Math.min(trailLength / 10 + .9, 1), 0)
                });
            }
            this.group.add(lineDraw.group);
            lineDraw.updateData(data);
            this._lastZlevel = zlevel;
        },
        updateLayout: function(seriesModel, ecModel, api) {
            this._lineDraw.updateLayout();
            var zr = api.getZr();
            zr.painter.getLayer(this._lastZlevel).clear(true);
        },
        remove: function(ecModel, api) {
            this._lineDraw && this._lineDraw.remove(api, true);
        }
    });
});