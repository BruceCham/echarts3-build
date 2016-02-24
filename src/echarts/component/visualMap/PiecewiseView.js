define("crm-modules/common/echarts/component/visualMap/PiecewiseView", [ "./VisualMapView", "crm-modules/common/echarts/zrender/core/util", "../../util/graphic", "../../util/symbol", "../../util/layout", "./helper" ], function(require, exports, module) {
    var VisualMapView = require("./VisualMapView");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var graphic = require("../../util/graphic");
    var symbolCreators = require("../../util/symbol");
    var layout = require("../../util/layout");
    var helper = require("./helper");
    var PiecewiseVisualMapView = VisualMapView.extend({
        type: "visualMap.piecewise",
        doRender: function() {
            var thisGroup = this.group;
            thisGroup.removeAll();
            var visualMapModel = this.visualMapModel;
            var textGap = visualMapModel.get("textGap");
            var textStyleModel = visualMapModel.textStyleModel;
            var textFont = textStyleModel.getFont();
            var textFill = textStyleModel.getTextColor();
            var itemAlign = this._getItemAlign();
            var itemSize = visualMapModel.itemSize;
            var viewData = this._getViewData();
            var showLabel = !viewData.endsText;
            var showEndsText = !showLabel;
            showEndsText && this._renderEndsText(thisGroup, viewData.endsText[0], itemSize);
            zrUtil.each(viewData.pieceList, renderItem, this);
            showEndsText && this._renderEndsText(thisGroup, viewData.endsText[1], itemSize);
            layout.box(visualMapModel.get("orient"), thisGroup, visualMapModel.get("itemGap"));
            this.renderBackground(thisGroup);
            this.positionGroup(thisGroup);
            function renderItem(item) {
                var itemGroup = new graphic.Group();
                itemGroup.onclick = zrUtil.bind(this._onItemClick, this, item.piece);
                this._createItemSymbol(itemGroup, item.piece, [ 0, 0, itemSize[0], itemSize[1] ]);
                if (showLabel) {
                    itemGroup.add(new graphic.Text({
                        style: {
                            x: itemAlign === "right" ? -textGap : itemSize[0] + textGap,
                            y: itemSize[1] / 2,
                            text: item.piece.text,
                            textBaseline: "middle",
                            textAlign: itemAlign,
                            textFont: textFont,
                            fill: textFill
                        }
                    }));
                }
                thisGroup.add(itemGroup);
            }
        },
        _getItemAlign: function() {
            var visualMapModel = this.visualMapModel;
            var modelOption = visualMapModel.option;
            if (modelOption.orient === "vertical") {
                return helper.getItemAlign(visualMapModel, this.api, visualMapModel.itemSize);
            } else {
                var align = modelOption.align;
                if (!align || align === "auto") {
                    align = "left";
                }
                return align;
            }
        },
        _renderEndsText: function(group, text, itemSize) {
            if (!text) {
                return;
            }
            var itemGroup = new graphic.Group();
            var textStyleModel = this.visualMapModel.textStyleModel;
            itemGroup.add(new graphic.Text({
                style: {
                    x: itemSize[0] / 2,
                    y: itemSize[1] / 2,
                    textBaseline: "middle",
                    textAlign: "center",
                    text: text,
                    textFont: textStyleModel.getFont(),
                    fill: textStyleModel.getTextColor()
                }
            }));
            group.add(itemGroup);
        },
        _getViewData: function() {
            var visualMapModel = this.visualMapModel;
            var pieceList = zrUtil.map(visualMapModel.getPieceList(), function(piece, index) {
                return {
                    piece: piece,
                    index: index
                };
            });
            var endsText = visualMapModel.get("text");
            var orient = visualMapModel.get("orient");
            var inverse = visualMapModel.get("inverse");
            if (orient === "horizontal" ? inverse : !inverse) {
                pieceList.reverse();
            } else if (endsText) {
                endsText = endsText.slice().reverse();
            }
            return {
                pieceList: pieceList,
                endsText: endsText
            };
        },
        _createItemSymbol: function(group, piece, shapeParam) {
            var representValue;
            if (this.visualMapModel.isCategory()) {
                representValue = piece.value;
            } else {
                if (piece.value != null) {
                    representValue = piece.value;
                } else {
                    var pieceInterval = piece.interval || [];
                    representValue = (pieceInterval[0] + pieceInterval[1]) / 2;
                }
            }
            var visualObj = this.getControllerVisual(representValue);
            group.add(symbolCreators.createSymbol(visualObj.symbol, shapeParam[0], shapeParam[1], shapeParam[2], shapeParam[3], visualObj.color));
        },
        _onItemClick: function(piece) {
            var visualMapModel = this.visualMapModel;
            var option = visualMapModel.option;
            var selected = zrUtil.clone(option.selected);
            var newKey = visualMapModel.getSelectedMapKey(piece);
            if (option.selectedMode === "single") {
                selected[newKey] = true;
                zrUtil.each(selected, function(o, key) {
                    selected[key] = key === newKey;
                });
            } else {
                selected[newKey] = !selected[newKey];
            }
            this.api.dispatchAction({
                type: "selectDataRange",
                from: this.uid,
                visualMapId: this.visualMapModel.id,
                selected: selected
            });
        }
    });
    return PiecewiseVisualMapView;
});