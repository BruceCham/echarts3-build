define("crm-modules/common/echarts/component/legend/LegendView", [ "crm-modules/common/echarts/zrender/core/util", "../../util/symbol", "../../util/graphic", "../helper/listComponent", "../../echarts" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var symbolCreator = require("../../util/symbol");
    var graphic = require("../../util/graphic");
    var listComponentHelper = require("../helper/listComponent");
    var curry = zrUtil.curry;
    var LEGEND_DISABLE_COLOR = "#ccc";
    function dispatchSelectAction(name, api) {
        api.dispatchAction({
            type: "legendToggleSelect",
            name: name
        });
    }
    function dispatchHighlightAction(seriesModel, dataName, api) {
        seriesModel.get("legendHoverLink") && api.dispatchAction({
            type: "highlight",
            seriesName: seriesModel.name,
            name: dataName
        });
    }
    function dispatchDownplayAction(seriesModel, dataName, api) {
        seriesModel.get("legendHoverLink") && api.dispatchAction({
            type: "downplay",
            seriesName: seriesModel.name,
            name: dataName
        });
    }
    return require("../../echarts").extendComponentView({
        type: "legend",
        init: function() {
            this._symbolTypeStore = {};
        },
        render: function(legendModel, ecModel, api) {
            var group = this.group;
            group.removeAll();
            if (!legendModel.get("show")) {
                return;
            }
            var selectMode = legendModel.get("selectedMode");
            var itemWidth = legendModel.get("itemWidth");
            var itemHeight = legendModel.get("itemHeight");
            var itemAlign = legendModel.get("align");
            if (itemAlign === "auto") {
                itemAlign = legendModel.get("left") === "right" && legendModel.get("orient") === "vertical" ? "right" : "left";
            }
            var legendItemMap = {};
            var legendDrawedMap = {};
            zrUtil.each(legendModel.getData(), function(itemModel) {
                var seriesName = itemModel.get("name");
                if (seriesName === "" || seriesName === "\n") {
                    group.add(new graphic.Group({
                        newline: true
                    }));
                }
                var seriesModel = ecModel.getSeriesByName(seriesName)[0];
                legendItemMap[seriesName] = itemModel;
                if (!seriesModel || legendDrawedMap[seriesName]) {
                    return;
                }
                var data = seriesModel.getData();
                var color = data.getVisual("color");
                if (!legendModel.isSelected(seriesName)) {
                    color = LEGEND_DISABLE_COLOR;
                }
                if (typeof color === "function") {
                    color = color(seriesModel.getDataParams(0));
                }
                var legendSymbolType = data.getVisual("legendSymbol") || "roundRect";
                var symbolType = data.getVisual("symbol");
                var itemGroup = this._createItem(seriesName, itemModel, legendModel, legendSymbolType, symbolType, itemWidth, itemHeight, itemAlign, color, selectMode);
                itemGroup.on("click", curry(dispatchSelectAction, seriesName, api)).on("mouseover", curry(dispatchHighlightAction, seriesModel, "", api)).on("mouseout", curry(dispatchDownplayAction, seriesModel, "", api));
                legendDrawedMap[seriesName] = true;
            }, this);
            ecModel.eachRawSeries(function(seriesModel) {
                if (seriesModel.legendDataProvider) {
                    var data = seriesModel.legendDataProvider();
                    data.each(function(idx) {
                        var name = data.getName(idx);
                        if (!legendItemMap[name] || legendDrawedMap[name]) {
                            return;
                        }
                        var color = data.getItemVisual(idx, "color");
                        if (!legendModel.isSelected(name)) {
                            color = LEGEND_DISABLE_COLOR;
                        }
                        var legendSymbolType = "roundRect";
                        var itemGroup = this._createItem(name, legendItemMap[name], legendModel, legendSymbolType, null, itemWidth, itemHeight, itemAlign, color, selectMode);
                        itemGroup.on("click", curry(dispatchSelectAction, name, api)).on("mouseover", curry(dispatchHighlightAction, seriesModel, name, api)).on("mouseout", curry(dispatchDownplayAction, seriesModel, name, api));
                        legendDrawedMap[name] = true;
                    }, false, this);
                }
            }, this);
            listComponentHelper.layout(group, legendModel, api);
            listComponentHelper.addBackground(group, legendModel);
        },
        _createItem: function(name, itemModel, legendModel, legendSymbolType, symbolType, itemWidth, itemHeight, itemAlign, color, selectMode) {
            var itemGroup = new graphic.Group();
            var textStyleModel = itemModel.getModel("textStyle");
            var itemIcon = itemModel.get("icon");
            legendSymbolType = itemIcon || legendSymbolType;
            itemGroup.add(symbolCreator.createSymbol(legendSymbolType, 0, 0, itemWidth, itemHeight, color));
            if (!itemIcon && symbolType && symbolType !== legendSymbolType && symbolType != "none") {
                var size = itemHeight * .8;
                itemGroup.add(symbolCreator.createSymbol(symbolType, (itemWidth - size) / 2, (itemHeight - size) / 2, size, size, color));
            }
            var textX = itemAlign === "left" ? itemWidth + 5 : -5;
            var textAlign = itemAlign;
            var formatter = legendModel.get("formatter");
            if (typeof formatter === "string" && formatter) {
                name = formatter.replace("{name}", name);
            } else if (typeof formatter === "function") {
                name = formatter(name);
            }
            var text = new graphic.Text({
                style: {
                    text: name,
                    x: textX,
                    y: itemHeight / 2,
                    fill: textStyleModel.getTextColor(),
                    textFont: textStyleModel.getFont(),
                    textAlign: textAlign,
                    textBaseline: "middle"
                }
            });
            itemGroup.add(text);
            itemGroup.add(new graphic.Rect({
                shape: itemGroup.getBoundingRect(),
                invisible: true
            }));
            itemGroup.eachChild(function(child) {
                child.silent = !selectMode;
            });
            this.group.add(itemGroup);
            return itemGroup;
        }
    });
});