define("crm-modules/common/echarts/chart/heatmap/HeatmapLayer", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var GRADIENT_LEVELS = 256;
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    function Heatmap() {
        var canvas = zrUtil.createCanvas();
        this.canvas = canvas;
        this.blurSize = 30;
        this.pointSize = 20;
        this.opacity = 1;
        this._gradientPixels = {};
    }
    Heatmap.prototype = {
        update: function(data, width, height, normalize, colorFunc, isInRange) {
            var brush = this._getBrush();
            var gradientInRange = this._getGradient(data, colorFunc, "inRange");
            var gradientOutOfRange = this._getGradient(data, colorFunc, "outOfRange");
            var r = this.pointSize + this.blurSize;
            var canvas = this.canvas;
            var ctx = canvas.getContext("2d");
            var len = data.length;
            canvas.width = width;
            canvas.height = height;
            for (var i = 0; i < len; ++i) {
                var p = data[i];
                var x = p[0];
                var y = p[1];
                var value = p[2];
                var alpha = normalize(value);
                ctx.globalAlpha = alpha;
                ctx.drawImage(brush, x - r, y - r);
            }
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = imageData.data;
            var offset = 0;
            var pixelLen = pixels.length;
            while (offset < pixelLen) {
                var alpha = pixels[offset + 3] / 256;
                var gradientOffset = Math.floor(alpha * (GRADIENT_LEVELS - 1)) * 4;
                if (alpha > 0) {
                    var gradient = isInRange(alpha) ? gradientInRange : gradientOutOfRange;
                    pixels[offset++] = gradient[gradientOffset];
                    pixels[offset++] = gradient[gradientOffset + 1];
                    pixels[offset++] = gradient[gradientOffset + 2];
                    pixels[offset++] *= this.opacity * gradient[gradientOffset + 3];
                } else {
                    offset += 4;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        },
        _getBrush: function() {
            var brushCanvas = this._brushCanvas || (this._brushCanvas = zrUtil.createCanvas());
            var r = this.pointSize + this.blurSize;
            var d = r * 2;
            brushCanvas.width = d;
            brushCanvas.height = d;
            var ctx = brushCanvas.getContext("2d");
            ctx.clearRect(0, 0, d, d);
            ctx.shadowOffsetX = d;
            ctx.shadowBlur = this.blurSize;
            ctx.shadowColor = "#000";
            ctx.beginPath();
            ctx.arc(-r, r, this.pointSize, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            return brushCanvas;
        },
        _getGradient: function(data, colorFunc, state) {
            var gradientPixels = this._gradientPixels;
            var pixelsSingleState = gradientPixels[state] || (gradientPixels[state] = new Uint8ClampedArray(256 * 4));
            var color = [];
            var off = 0;
            for (var i = 0; i < 256; i++) {
                colorFunc[state](i / 255, true, color);
                pixelsSingleState[off++] = color[0];
                pixelsSingleState[off++] = color[1];
                pixelsSingleState[off++] = color[2];
                pixelsSingleState[off++] = color[3];
            }
            return pixelsSingleState;
        }
    };
    return Heatmap;
});