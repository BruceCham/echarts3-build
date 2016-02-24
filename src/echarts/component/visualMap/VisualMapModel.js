define("crm-modules/common/echarts/component/visualMap/VisualMapModel", [ "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/core/env", "../../echarts", "../../util/model", "../../visual/visualDefault", "../../visual/VisualMapping", "../../util/number" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var env = require("crm-modules/common/echarts/zrender/core/env");
    var echarts = require("../../echarts");
    var modelUtil = require("../../util/model");
    var visualDefault = require("../../visual/visualDefault");
    var VisualMapping = require("../../visual/VisualMapping");
    var mapVisual = VisualMapping.mapVisual;
    var eachVisual = VisualMapping.eachVisual;
    var numberUtil = require("../../util/number");
    var isArray = zrUtil.isArray;
    var each = zrUtil.each;
    var asc = numberUtil.asc;
    var linearMap = numberUtil.linearMap;
    return echarts.extendComponentModel({
        type: "visualMap",
        dependencies: [ "series" ],
        dataBound: [ -Infinity, Infinity ],
        stateList: [ "inRange", "outOfRange" ],
        layoutMode: {
            type: "box",
            ignoreSize: true
        },
        defaultOption: {
            show: true,
            zlevel: 0,
            z: 4,
            min: 0,
            max: 200,
            dimension: null,
            inRange: null,
            outOfRange: null,
            left: 0,
            right: null,
            top: null,
            bottom: 0,
            itemWidth: null,
            itemHeight: null,
            inverse: false,
            orient: "vertical",
            seriesIndex: null,
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "#ccc",
            contentColor: "#5793f3",
            inactiveColor: "#aaa",
            borderWidth: 0,
            padding: 5,
            textGap: 10,
            precision: 0,
            color: [ "#bf444c", "#d88273", "#f6efa6" ],
            formatter: null,
            text: null,
            textStyle: {
                color: "#333"
            }
        },
        init: function(option, parentModel, ecModel) {
            this._autoSeriesIndex = false;
            this._dataExtent;
            this.controllerVisuals = {};
            this.targetVisuals = {};
            this.textStyleModel;
            this.itemSize;
            this.mergeDefaultAndTheme(option, ecModel);
            this.doMergeOption({}, true);
        },
        mergeOption: function(option) {
            this.$superApply("mergeOption", arguments);
            this.doMergeOption(option, false);
        },
        doMergeOption: function(newOption, isInit) {
            var thisOption = this.option;
            if (!env.canvasSupported) {
                thisOption.realtime = false;
            }
            this.textStyleModel = this.getModel("textStyle");
            this.resetItemSize();
            this.completeVisualOption();
        },
        formatValueText: function(value, isCategory) {
            var option = this.option;
            var precision = option.precision;
            var dataBound = this.dataBound;
            var formatter = option.formatter;
            var isMinMax;
            var textValue;
            if (zrUtil.isArray(value)) {
                value = value.slice();
                isMinMax = true;
            }
            textValue = isCategory ? value : isMinMax ? [ toFixed(value[0]), toFixed(value[1]) ] : toFixed(value);
            if (zrUtil.isString(formatter)) {
                return formatter.replace("{value}", isMinMax ? textValue[0] : textValue).replace("{value2}", isMinMax ? textValue[1] : textValue);
            } else if (zrUtil.isFunction(formatter)) {
                return isMinMax ? formatter(value[0], value[1]) : formatter(value);
            }
            if (isMinMax) {
                if (value[0] === dataBound[0]) {
                    return "< " + textValue[1];
                } else if (value[1] === dataBound[1]) {
                    return "> " + textValue[0];
                } else {
                    return textValue[0] + " - " + textValue[1];
                }
            } else {
                return textValue;
            }
            function toFixed(val) {
                return val === dataBound[0] ? "min" : val === dataBound[1] ? "max" : (+val).toFixed(precision);
            }
        },
        resetTargetSeries: function(newOption, isInit) {
            var thisOption = this.option;
            var autoSeriesIndex = this._autoSeriesIndex = (isInit ? thisOption : newOption).seriesIndex == null;
            thisOption.seriesIndex = autoSeriesIndex ? [] : modelUtil.normalizeToArray(thisOption.seriesIndex);
            autoSeriesIndex && this.ecModel.eachSeries(function(seriesModel, index) {
                var data = seriesModel.getData();
                if (data.type === "list") {
                    thisOption.seriesIndex.push(index);
                }
            });
        },
        resetExtent: function() {
            var thisOption = this.option;
            var extent = asc([ thisOption.min, thisOption.max ]);
            this._dataExtent = extent;
        },
        getDataDimension: function(list) {
            var optDim = this.option.dimension;
            return optDim != null ? optDim : list.dimensions.length - 1;
        },
        getExtent: function() {
            return this._dataExtent.slice();
        },
        resetVisual: function(fillVisualOption) {
            var dataExtent = this.getExtent();
            doReset.call(this, "controller", this.controllerVisuals);
            doReset.call(this, "target", this.targetVisuals);
            function doReset(baseAttr, visualMappings) {
                each(this.stateList, function(state) {
                    var mappings = visualMappings[state] || (visualMappings[state] = {});
                    var visaulOption = this.option[baseAttr][state] || {};
                    each(visaulOption, function(visualData, visualType) {
                        if (!VisualMapping.isValidType(visualType)) {
                            return;
                        }
                        var mappingOption = {
                            type: visualType,
                            dataExtent: dataExtent,
                            visual: visualData
                        };
                        fillVisualOption && fillVisualOption.call(this, mappingOption, state);
                        mappings[visualType] = new VisualMapping(mappingOption);
                    }, this);
                }, this);
            }
        },
        completeVisualOption: function() {
            var thisOption = this.option;
            var base = {
                inRange: thisOption.inRange,
                outOfRange: thisOption.outOfRange
            };
            var target = thisOption.target || (thisOption.target = {});
            var controller = thisOption.controller || (thisOption.controller = {});
            zrUtil.merge(target, base);
            zrUtil.merge(controller, base);
            var isCategory = this.isCategory();
            completeSingle.call(this, target);
            completeSingle.call(this, controller);
            completeInactive.call(this, target, "inRange", "outOfRange");
            completeInactive.call(this, target, "outOfRange", "inRange");
            completeController.call(this, controller);
            function completeSingle(base) {
                if (isArray(thisOption.color) && !base.inRange) {
                    base.inRange = {
                        color: thisOption.color.slice().reverse()
                    };
                }
                each(this.stateList, function(state) {
                    var visualType = base[state];
                    if (zrUtil.isString(visualType)) {
                        var defa = visualDefault.get(visualType, "active", isCategory);
                        if (defa) {
                            base[state] = {};
                            base[state][visualType] = defa;
                        } else {
                            delete base[state];
                        }
                    }
                }, this);
            }
            function completeInactive(base, stateExist, stateAbsent) {
                var optExist = base[stateExist];
                var optAbsent = base[stateAbsent];
                if (optExist && !optAbsent) {
                    optAbsent = base[stateAbsent] = {};
                    each(optExist, function(visualData, visualType) {
                        var defa = visualDefault.get(visualType, "inactive", isCategory);
                        if (VisualMapping.isValidType(visualType) && defa) {
                            optAbsent[visualType] = defa;
                        }
                    });
                }
            }
            function completeController(controller) {
                var symbolExists = (controller.inRange || {}).symbol || (controller.outOfRange || {}).symbol;
                var symbolSizeExists = (controller.inRange || {}).symbolSize || (controller.outOfRange || {}).symbolSize;
                var inactiveColor = this.get("inactiveColor");
                each(this.stateList, function(state) {
                    var itemSize = this.itemSize;
                    var visuals = controller[state];
                    if (!visuals) {
                        visuals = controller[state] = {
                            color: isCategory ? inactiveColor : [ inactiveColor ]
                        };
                    }
                    if (!visuals.symbol) {
                        visuals.symbol = symbolExists && zrUtil.clone(symbolExists) || (isCategory ? "roundRect" : [ "roundRect" ]);
                    }
                    if (!visuals.symbolSize) {
                        visuals.symbolSize = symbolSizeExists && zrUtil.clone(symbolSizeExists) || (isCategory ? itemSize[0] : [ itemSize[0], itemSize[0] ]);
                    }
                    visuals.symbol = mapVisual(visuals.symbol, function(symbol) {
                        return symbol === "none" || symbol === "square" ? "roundRect" : symbol;
                    });
                    var symbolSize = visuals.symbolSize;
                    if (symbolSize) {
                        var max = -Infinity;
                        eachVisual(symbolSize, function(value) {
                            value > max && (max = value);
                        });
                        visuals.symbolSize = mapVisual(symbolSize, function(value) {
                            return linearMap(value, [ 0, max ], [ 0, itemSize[0] ], true);
                        });
                    }
                }, this);
            }
        },
        eachTargetSeries: function(callback, context) {
            zrUtil.each(this.option.seriesIndex, function(seriesIndex) {
                callback.call(context, this.ecModel.getSeriesByIndex(seriesIndex));
            }, this);
        },
        isCategory: function() {
            return !!this.option.categories;
        },
        resetItemSize: function() {
            this.itemSize = [ parseFloat(this.get("itemWidth")), parseFloat(this.get("itemHeight")) ];
        },
        setSelected: zrUtil.noop,
        getValueState: zrUtil.noop
    });
});