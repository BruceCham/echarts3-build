define("crm-modules/common/echarts/chart/graph/GraphSeries", [ "../../data/List", "crm-modules/common/echarts/zrender/core/util", "../helper/createGraphFromNodeEdge", "../../echarts" ], function(require, exports, module) {
    "use strict";
    var List = require("../../data/List");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var createGraphFromNodeEdge = require("../helper/createGraphFromNodeEdge");
    return require("../../echarts").extendSeriesModel({
        type: "series.graph",
        init: function(option) {
            this.$superApply("init", arguments);
            this.legendDataProvider = function() {
                return this._categoriesData;
            };
            this._updateCategoriesData();
        },
        mergeOption: function(option) {
            this.$superApply("mergeOption", arguments);
            this._updateCategoriesData();
        },
        getInitialData: function(option, ecModel) {
            var edges = option.edges || option.links;
            var nodes = option.data || option.nodes;
            if (nodes && edges) {
                var graph = createGraphFromNodeEdge(nodes, edges, this, true);
                var list = graph.data;
                var self = this;
                list.wrapMethod("getItemModel", function(model) {
                    var categoriesModels = self._categoriesModels;
                    var categoryIdx = model.getShallow("category");
                    var categoryModel = categoriesModels[categoryIdx];
                    if (categoryModel) {
                        categoryModel.parentModel = model.parentModel;
                        model.parentModel = categoryModel;
                    }
                    return model;
                });
                return list;
            }
        },
        restoreData: function() {
            this.$superApply("restoreData", arguments);
            this.getGraph().restoreData();
        },
        getGraph: function() {
            return this.getData().graph;
        },
        getEdgeData: function() {
            return this.getGraph().edgeData;
        },
        getCategoriesData: function() {
            return this._categoriesData;
        },
        _updateCategoriesData: function() {
            var categories = zrUtil.map(this.option.categories || [], function(category) {
                return category.value != null ? category : zrUtil.extend({
                    value: 0
                }, category);
            });
            var categoriesData = new List([ "value" ], this);
            categoriesData.initData(categories);
            this._categoriesData = categoriesData;
            this._categoriesModels = categoriesData.mapArray(function(idx) {
                return categoriesData.getItemModel(idx, true);
            });
        },
        setRoamZoom: function(zoom) {
            var roamDetail = this.option.roamDetail;
            roamDetail && (roamDetail.zoom = zoom);
        },
        setRoamPan: function(x, y) {
            var roamDetail = this.option.roamDetail;
            if (roamDetail) {
                roamDetail.x = x;
                roamDetail.y = y;
            }
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            color: [ "#61a0a8", "#d14a61", "#fd9c35", "#675bba", "#fec42c", "#dd4444", "#fd9c35", "#cd4870" ],
            coordinateSystem: "view",
            legendHoverLink: true,
            hoverAnimation: true,
            layout: null,
            force: {
                initLayout: null,
                repulsion: 50,
                gravity: .1,
                edgeLength: 30,
                layoutAnimation: true
            },
            left: "center",
            top: "center",
            symbol: "circle",
            symbolSize: 10,
            draggable: false,
            roam: false,
            roamDetail: {
                x: 0,
                y: 0,
                zoom: 1
            },
            nodeScaleRatio: .6,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {},
                emphasis: {}
            },
            lineStyle: {
                normal: {
                    color: "#aaa",
                    width: 1,
                    curveness: 0,
                    opacity: .5
                },
                emphasis: {}
            }
        }
    });
});