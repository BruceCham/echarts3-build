define("crm-modules/common/echarts/component/visualMap/PiecewiseModel", [ "./VisualMapModel", "crm-modules/common/echarts/zrender/core/util", "../../visual/VisualMapping" ], function(require, exports, module) {
    var VisualMapModel = require("./VisualMapModel");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var VisualMapping = require("../../visual/VisualMapping");
    var PiecewiseModel = VisualMapModel.extend({
        type: "visualMap.piecewise",
        defaultOption: {
            selected: null,
            align: "auto",
            itemWidth: 20,
            itemHeight: 14,
            itemSymbol: "roundRect",
            pieceList: null,
            categories: null,
            splitNumber: 5,
            selectedMode: "multiple",
            itemGap: 10
        },
        doMergeOption: function(newOption, isInit) {
            this.$superApply("doMergeOption", arguments);
            this._pieceList = [];
            this.resetTargetSeries(newOption, isInit);
            this.resetExtent();
            var mode = this._mode = this._decideMode();
            resetMethods[this._mode].call(this);
            this._resetSelected(newOption, isInit);
            var categories = this.option.categories;
            this.resetVisual(function(mappingOption, state) {
                if (mode === "categories") {
                    mappingOption.mappingMethod = "category";
                    mappingOption.categories = zrUtil.clone(categories);
                } else {
                    mappingOption.mappingMethod = "piecewise";
                    mappingOption.pieceList = zrUtil.map(this._pieceList, function(piece) {
                        var piece = zrUtil.clone(piece);
                        if (state !== "inRange") {
                            piece.visual = null;
                        }
                        return piece;
                    });
                }
            });
        },
        _resetSelected: function(newOption, isInit) {
            var thisOption = this.option;
            var pieceList = this._pieceList;
            var selected = (isInit ? thisOption : newOption).selected || {};
            thisOption.selected = selected;
            zrUtil.each(pieceList, function(piece, index) {
                var key = this.getSelectedMapKey(piece);
                if (!(key in selected)) {
                    selected[key] = true;
                }
            }, this);
            if (thisOption.selectedMode === "single") {
                var hasSel = false;
                zrUtil.each(pieceList, function(piece, index) {
                    var key = this.getSelectedMapKey(piece);
                    if (selected[key]) {
                        hasSel ? selected[key] = false : hasSel = true;
                    }
                }, this);
            }
        },
        getSelectedMapKey: function(piece) {
            return this._mode === "categories" ? piece.value + "" : piece.index + "";
        },
        getPieceList: function() {
            return this._pieceList;
        },
        _decideMode: function() {
            var option = this.option;
            return option.pieces && option.pieces.length > 0 ? "pieces" : this.option.categories ? "categories" : "splitNumber";
        },
        setSelected: function(selected) {
            this.option.selected = zrUtil.clone(selected);
        },
        getValueState: function(value) {
            var pieceList = this._pieceList;
            var index = VisualMapping.findPieceIndex(value, pieceList);
            return index != null ? this.option.selected[this.getSelectedMapKey(pieceList[index])] ? "inRange" : "outOfRange" : "outOfRange";
        }
    });
    var resetMethods = {
        splitNumber: function() {
            var thisOption = this.option;
            var precision = thisOption.precision;
            var dataExtent = this.getExtent();
            var splitNumber = thisOption.splitNumber;
            splitNumber = Math.max(parseInt(splitNumber, 10), 1);
            thisOption.splitNumber = splitNumber;
            var splitStep = (dataExtent[1] - dataExtent[0]) / splitNumber;
            while (+splitStep.toFixed(precision) !== splitStep && precision < 5) {
                precision++;
            }
            thisOption.precision = precision;
            splitStep = +splitStep.toFixed(precision);
            for (var i = 0, curr = dataExtent[0]; i < splitNumber; i++, curr += splitStep) {
                var max = i === splitNumber - 1 ? dataExtent[1] : curr + splitStep;
                this._pieceList.push({
                    text: this.formatValueText([ curr, max ]),
                    index: i,
                    interval: [ curr, max ]
                });
            }
        },
        categories: function() {
            var thisOption = this.option;
            zrUtil.each(thisOption.categories, function(cate) {
                this._pieceList.push({
                    text: this.formatValueText(cate, true),
                    value: cate
                });
            }, this);
            normalizeReverse(thisOption, this._pieceList);
        },
        pieces: function() {
            var thisOption = this.option;
            zrUtil.each(thisOption.pieces, function(pieceListItem, index) {
                if (!zrUtil.isObject(pieceListItem)) {
                    pieceListItem = {
                        value: pieceListItem
                    };
                }
                var item = {
                    text: "",
                    index: index
                };
                var hasLabel;
                if (pieceListItem.label != null) {
                    item.text = pieceListItem.label;
                    hasLabel = true;
                }
                if (pieceListItem.hasOwnProperty("value")) {
                    item.value = pieceListItem.value;
                    if (!hasLabel) {
                        item.text = this.formatValueText(item.value);
                    }
                } else {
                    var min = pieceListItem.min;
                    var max = pieceListItem.max;
                    min == null && (min = -Infinity);
                    max == null && (max = Infinity);
                    if (min === max) {
                        item.value = min;
                    }
                    item.interval = [ min, max ];
                    if (!hasLabel) {
                        item.text = this.formatValueText([ min, max ]);
                    }
                }
                item.visual = VisualMapping.retrieveVisuals(pieceListItem);
                this._pieceList.push(item);
            }, this);
            normalizeReverse(thisOption, this._pieceList);
        }
    };
    function normalizeReverse(thisOption, arr) {
        var inverse = thisOption.inverse;
        if (thisOption.orient === "vertical" ? !inverse : inverse) {
            arr.reverse();
        }
    }
    return PiecewiseModel;
});