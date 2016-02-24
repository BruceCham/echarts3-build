define("crm-modules/common/echarts/chart/sankey/SankeySeries", [ "../../model/Series", "../helper/createGraphFromNodeEdge" ], function(require, exports, module) {
    "use strict";
    var SeriesModel = require("../../model/Series");
    var createGraphFromNodeEdge = require("../helper/createGraphFromNodeEdge");
    return SeriesModel.extend({
        type: "series.sankey",
        layoutInfo: null,
        getInitialData: function(option, ecModel) {
            var links = option.edges || option.links;
            var nodes = option.data || option.nodes;
            if (nodes && links) {
                var graph = createGraphFromNodeEdge(nodes, links, this, true);
                return graph.data;
            }
        },
        getGraph: function() {
            return this.getData().graph;
        },
        getEdgeData: function() {
            return this.getGraph().edgeData;
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "view",
            layout: null,
            left: "5%",
            top: "5%",
            right: "20%",
            bottom: "5%",
            nodeWidth: 20,
            nodeGap: 8,
            layoutIterations: 32,
            label: {
                normal: {
                    show: true,
                    position: "right",
                    textStyle: {
                        color: "#000",
                        fontSize: 12
                    }
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    borderWidth: 1,
                    borderColor: "#aaa"
                }
            },
            lineStyle: {
                normal: {
                    color: "#314656",
                    opacity: .2,
                    curveness: .5
                },
                emphasis: {
                    opacity: .6
                }
            },
            color: [ "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2" ],
            animationEasing: "linear",
            animationDuration: 1e3
        }
    });
});