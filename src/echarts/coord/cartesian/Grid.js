define("crm-modules/common/echarts/coord/cartesian/Grid", [ "../../util/layout", "../../coord/axisHelper", "crm-modules/common/echarts/zrender/core/util", "./Cartesian2D", "./Axis2D", "./GridModel", "../../CoordinateSystem" ], function(require, factory) {
    var layout = require("../../util/layout");
    var axisHelper = require("../../coord/axisHelper");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Cartesian2D = require("./Cartesian2D");
    var Axis2D = require("./Axis2D");
    var each = zrUtil.each;
    var ifAxisCrossZero = axisHelper.ifAxisCrossZero;
    var ifAxisNeedsCrossZero = axisHelper.ifAxisNeedsCrossZero;
    var niceScaleExtent = axisHelper.niceScaleExtent;
    require("./GridModel");
    function isAxisUsedInTheGrid(axisModel, gridModel, ecModel) {
        return ecModel.getComponent("grid", axisModel.get("gridIndex")) === gridModel;
    }
    function getLabelUnionRect(axis) {
        var axisModel = axis.model;
        var labels = axisModel.getFormattedLabels();
        var rect;
        for (var i = 0; i < labels.length; i++) {
            if (!axis.isLabelIgnored(i)) {
                var singleRect = axisModel.getTextRect(labels[i]);
                rect ? rect.union(singleRect) : rect = singleRect;
            }
        }
        return rect;
    }
    function Grid(gridModel, ecModel, api) {
        this._coordsMap = {};
        this._coordsList = [];
        this._axesMap = {};
        this._axesList = [];
        this._initCartesian(gridModel, ecModel, api);
    }
    var gridProto = Grid.prototype;
    gridProto.type = "grid";
    gridProto.getRect = function() {
        return this._rect;
    };
    gridProto.resize = function(gridModel, api) {
        var gridRect = layout.getLayoutRect(gridModel.getBoxLayoutParams(), {
            width: api.getWidth(),
            height: api.getHeight()
        });
        this._rect = gridRect;
        var axesList = this._axesList;
        adjustAxes();
        if (gridModel.get("containLabel")) {
            each(axesList, function(axis) {
                if (!axis.model.get("axisLabel.inside")) {
                    var labelUnionRect = getLabelUnionRect(axis);
                    if (labelUnionRect) {
                        var dim = axis.isHorizontal() ? "height" : "width";
                        var margin = axis.model.get("axisLabel.margin");
                        gridRect[dim] -= labelUnionRect[dim] + margin;
                        if (axis.position === "top") {
                            gridRect.y += labelUnionRect.height + margin;
                        } else if (axis.position === "left") {
                            gridRect.x += labelUnionRect.width + margin;
                        }
                    }
                }
            });
            adjustAxes();
        }
        function adjustAxes() {
            each(axesList, function(axis) {
                var isHorizontal = axis.isHorizontal();
                var extent = isHorizontal ? [ 0, gridRect.width ] : [ 0, gridRect.height ];
                var idx = axis.inverse ? 1 : 0;
                axis.setExtent(extent[idx], extent[1 - idx]);
                updateAxisTransfrom(axis, isHorizontal ? gridRect.x : gridRect.y);
            });
        }
    };
    gridProto.getAxis = function(axisType, axisIndex) {
        if (axisIndex != null) {
            var key = axisType + axisIndex;
            return this._axesMap[key];
        } else {
            var axesList = this._axesList;
            for (var i = 0; i < axesList.length; i++) {
                if (axesList[i].dim === axisType) {
                    return axesList[i];
                }
            }
        }
    };
    gridProto.getCartesian = function(xAxisIndex, yAxisIndex) {
        var key = "x" + xAxisIndex + "y" + yAxisIndex;
        return this._coordsMap[key];
    };
    gridProto._initCartesian = function(gridModel, ecModel, api) {
        var axisPositionUsed = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
        var axesMap = {
            x: {},
            y: {}
        };
        var axesCount = {
            x: 0,
            y: 0
        };
        ecModel.eachComponent("xAxis", createAxisCreator("x"), this);
        ecModel.eachComponent("yAxis", createAxisCreator("y"), this);
        if (!axesCount.x || !axesCount.y) {
            this._axesMap = {};
            this._axesList = [];
            return;
        }
        each(axesMap.x, function(xAxis, xAxisIndex) {
            each(axesMap.y, function(yAxis, yAxisIndex) {
                var key = "x" + xAxisIndex + "y" + yAxisIndex;
                var cartesian = new Cartesian2D(key);
                cartesian.grid = this;
                this._coordsMap[key] = cartesian;
                this._coordsList.push(cartesian);
                cartesian.addAxis(xAxis);
                cartesian.addAxis(yAxis);
            }, this);
        }, this);
        this._updateCartesianFromSeries(ecModel, gridModel);
        function ifAxisCanNotOnZero(otherAxisDim) {
            var axes = axesMap[otherAxisDim];
            return axes[0] && (axes[0].type === "category" || !ifAxisCrossZero(axes[0])) || axes[1] && (axes[1].type === "category" || !ifAxisCrossZero(axes[1]));
        }
        each(axesMap.x, function(xAxis) {
            if (ifAxisCanNotOnZero("y")) {
                xAxis.onZero = false;
            }
            if (ifAxisNeedsCrossZero(xAxis)) {
                xAxis.scale.unionExtent([ 0, 0 ]);
            }
            niceScaleExtent(xAxis, xAxis.model);
        }, this);
        each(axesMap.y, function(yAxis) {
            if (ifAxisCanNotOnZero("x")) {
                yAxis.onZero = false;
            }
            if (ifAxisNeedsCrossZero(yAxis)) {
                yAxis.scale.unionExtent([ 0, 0 ]);
            }
            niceScaleExtent(yAxis, yAxis.model);
        }, this);
        function createAxisCreator(axisType) {
            return function(axisModel, idx) {
                if (!isAxisUsedInTheGrid(axisModel, gridModel, ecModel)) {
                    return;
                }
                var axisPosition = axisModel.get("position");
                if (axisType === "x") {
                    if (axisPosition !== "top" && axisPosition !== "bottom") {
                        axisPosition = "bottom";
                    }
                    if (axisPositionUsed[axisPosition]) {
                        axisPosition = axisPosition === "top" ? "bottom" : "top";
                    }
                } else {
                    if (axisPosition !== "left" && axisPosition !== "right") {
                        axisPosition = "left";
                    }
                    if (axisPositionUsed[axisPosition]) {
                        axisPosition = axisPosition === "left" ? "right" : "left";
                    }
                }
                axisPositionUsed[axisPosition] = true;
                var axis = new Axis2D(axisType, axisHelper.createScaleByModel(axisModel), [ 0, 0 ], axisModel.get("type"), axisPosition);
                var isCategory = axis.type === "category";
                axis.onBand = isCategory && axisModel.get("boundaryGap");
                axis.inverse = axisModel.get("inverse");
                axis.onZero = axisModel.get("axisLine.onZero");
                axisModel.axis = axis;
                axis.model = axisModel;
                axis.index = idx;
                this._axesList.push(axis);
                this._axesMap[axisType + idx] = axis;
                axesMap[axisType][idx] = axis;
                axesCount[axisType]++;
            };
        }
    };
    gridProto._updateCartesianFromSeries = function(ecModel, gridModel) {
        ecModel.eachSeries(function(seriesModel) {
            if (seriesModel.get("coordinateSystem") === "cartesian2d") {
                var xAxisIndex = seriesModel.get("xAxisIndex");
                var yAxisIndex = seriesModel.get("yAxisIndex");
                var xAxisModel = ecModel.getComponent("xAxis", xAxisIndex);
                var yAxisModel = ecModel.getComponent("yAxis", yAxisIndex);
                if (!isAxisUsedInTheGrid(xAxisModel, gridModel, ecModel) || !isAxisUsedInTheGrid(yAxisModel, gridModel, ecModel)) {
                    return;
                }
                var cartesian = this.getCartesian(xAxisIndex, yAxisIndex);
                var data = seriesModel.getData();
                if (data.type === "list") {
                    unionExtent(data, cartesian.getAxis("x"), "x", seriesModel);
                    unionExtent(data, cartesian.getAxis("y"), "y", seriesModel);
                }
            }
        }, this);
        function unionExtent(data, axis, axisDim, seriesModel) {
            each(seriesModel.getDimensionsOnAxis(axisDim), function(dim) {
                axis.scale.unionExtent(data.getDataExtent(dim, axis.scale.type !== "ordinal"));
            });
        }
    };
    function updateAxisTransfrom(axis, coordBase) {
        var axisExtent = axis.getExtent();
        var axisExtentSum = axisExtent[0] + axisExtent[1];
        axis.toGlobalCoord = axis.dim === "x" ? function(coord) {
            return coord + coordBase;
        } : function(coord) {
            return axisExtentSum - coord + coordBase;
        };
        axis.toLocalCoord = axis.dim === "x" ? function(coord) {
            return coord - coordBase;
        } : function(coord) {
            return axisExtentSum - coord + coordBase;
        };
    }
    Grid.create = function(ecModel, api) {
        var grids = [];
        ecModel.eachComponent("grid", function(gridModel, idx) {
            var grid = new Grid(gridModel, ecModel, api);
            grid.name = "grid_" + idx;
            grid.resize(gridModel, api);
            gridModel.coordinateSystem = grid;
            grids.push(grid);
        });
        ecModel.eachSeries(function(seriesModel) {
            if (seriesModel.get("coordinateSystem") !== "cartesian2d") {
                return;
            }
            var xAxisIndex = seriesModel.get("xAxisIndex");
            var xAxisModel = ecModel.getComponent("xAxis", xAxisIndex);
            var grid = grids[xAxisModel.get("gridIndex")];
            seriesModel.coordinateSystem = grid.getCartesian(xAxisIndex, seriesModel.get("yAxisIndex"));
        });
        return grids;
    };
    Grid.dimensions = Cartesian2D.prototype.dimensions;
    require("../../CoordinateSystem").register("grid", Grid);
    return Grid;
});