define("crm-modules/common/echarts/chart/helper/Symbol", [ "crm-modules/common/echarts/zrender/core/util", "../../util/symbol", "../../util/graphic", "../../util/number" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var symbolUtil = require("../../util/symbol");
    var graphic = require("../../util/graphic");
    var numberUtil = require("../../util/number");
    function normalizeSymbolSize(symbolSize) {
        if (!zrUtil.isArray(symbolSize)) {
            symbolSize = [ +symbolSize, +symbolSize ];
        }
        return symbolSize;
    }
    function Symbol(data, idx) {
        graphic.Group.call(this);
        this.updateData(data, idx);
    }
    var symbolProto = Symbol.prototype;
    function driftSymbol(dx, dy) {
        this.parent.drift(dx, dy);
    }
    symbolProto._createSymbol = function(symbolType, data, idx) {
        this.removeAll();
        var seriesModel = data.hostModel;
        var color = data.getItemVisual(idx, "color");
        var symbolPath = symbolUtil.createSymbol(symbolType, -.5, -.5, 1, 1, color);
        symbolPath.attr({
            style: {
                strokeNoScale: true
            },
            z2: 100,
            culling: true,
            scale: [ 0, 0 ]
        });
        symbolPath.drift = driftSymbol;
        var size = normalizeSymbolSize(data.getItemVisual(idx, "symbolSize"));
        graphic.initProps(symbolPath, {
            scale: size
        }, seriesModel);
        this._symbolType = symbolType;
        this.add(symbolPath);
    };
    symbolProto.stopSymbolAnimation = function(toLastFrame) {
        this.childAt(0).stopAnimation(toLastFrame);
    };
    symbolProto.getScale = function() {
        return this.childAt(0).scale;
    };
    symbolProto.highlight = function() {
        this.childAt(0).trigger("emphasis");
    };
    symbolProto.downplay = function() {
        this.childAt(0).trigger("normal");
    };
    symbolProto.setZ = function(zlevel, z) {
        var symbolPath = this.childAt(0);
        symbolPath.zlevel = zlevel;
        symbolPath.z = z;
    };
    symbolProto.setDraggable = function(draggable) {
        var symbolPath = this.childAt(0);
        symbolPath.draggable = draggable;
        symbolPath.cursor = draggable ? "move" : "pointer";
    };
    symbolProto.updateData = function(data, idx) {
        var symbolType = data.getItemVisual(idx, "symbol") || "circle";
        var seriesModel = data.hostModel;
        var symbolSize = normalizeSymbolSize(data.getItemVisual(idx, "symbolSize"));
        if (symbolType !== this._symbolType) {
            this._createSymbol(symbolType, data, idx);
        } else {
            var symbolPath = this.childAt(0);
            graphic.updateProps(symbolPath, {
                scale: symbolSize
            }, seriesModel);
        }
        this._updateCommon(data, idx, symbolSize);
        this._seriesModel = seriesModel;
    };
    var normalStyleAccessPath = [ "itemStyle", "normal" ];
    var emphasisStyleAccessPath = [ "itemStyle", "emphasis" ];
    var normalLabelAccessPath = [ "label", "normal" ];
    var emphasisLabelAccessPath = [ "label", "emphasis" ];
    symbolProto._updateCommon = function(data, idx, symbolSize) {
        var symbolPath = this.childAt(0);
        var seriesModel = data.hostModel;
        var itemModel = data.getItemModel(idx);
        var normalItemStyleModel = itemModel.getModel(normalStyleAccessPath);
        var color = data.getItemVisual(idx, "color");
        var hoverStyle = itemModel.getModel(emphasisStyleAccessPath).getItemStyle();
        symbolPath.rotation = itemModel.getShallow("symbolRotate") * Math.PI / 180 || 0;
        var symbolOffset = itemModel.getShallow("symbolOffset");
        if (symbolOffset) {
            var pos = symbolPath.position;
            pos[0] = numberUtil.parsePercent(symbolOffset[0], symbolSize[0]);
            pos[1] = numberUtil.parsePercent(symbolOffset[1], symbolSize[1]);
        }
        symbolPath.setColor(color);
        zrUtil.extend(symbolPath.style, normalItemStyleModel.getItemStyle([ "color" ]));
        var labelModel = itemModel.getModel(normalLabelAccessPath);
        var hoverLabelModel = itemModel.getModel(emphasisLabelAccessPath);
        var lastDim = data.dimensions[data.dimensions.length - 1];
        var labelText = seriesModel.getFormattedLabel(idx, "normal") || data.get(lastDim, idx);
        var elStyle = symbolPath.style;
        if (labelModel.get("show")) {
            graphic.setText(elStyle, labelModel, color);
            elStyle.text = labelText;
        } else {
            elStyle.text = "";
        }
        if (hoverLabelModel.getShallow("show")) {
            graphic.setText(hoverStyle, hoverLabelModel, color);
            hoverStyle.text = labelText;
        } else {
            hoverStyle.text = "";
        }
        var size = normalizeSymbolSize(data.getItemVisual(idx, "symbolSize"));
        symbolPath.off("mouseover").off("mouseout").off("emphasis").off("normal");
        graphic.setHoverStyle(symbolPath, hoverStyle);
        if (itemModel.getShallow("hoverAnimation")) {
            var onEmphasis = function() {
                var ratio = size[1] / size[0];
                this.animateTo({
                    scale: [ Math.max(size[0] * 1.1, size[0] + 3), Math.max(size[1] * 1.1, size[1] + 3 * ratio) ]
                }, 400, "elasticOut");
            };
            var onNormal = function() {
                this.animateTo({
                    scale: size
                }, 400, "elasticOut");
            };
            symbolPath.on("mouseover", onEmphasis).on("mouseout", onNormal).on("emphasis", onEmphasis).on("normal", onNormal);
        }
    };
    symbolProto.fadeOut = function(cb) {
        var symbolPath = this.childAt(0);
        symbolPath.style.text = "";
        graphic.updateProps(symbolPath, {
            scale: [ 0, 0 ]
        }, this._seriesModel, cb);
    };
    zrUtil.inherits(Symbol, graphic.Group);
    return Symbol;
});