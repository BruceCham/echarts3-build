define("crm-modules/common/echarts/chart/helper/createGraphFromNodeEdge", [ "../../data/List", "../../data/Graph", "../../data/helper/linkList", "../../data/helper/completeDimensions", "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var List = require("../../data/List");
    var Graph = require("../../data/Graph");
    var linkList = require("../../data/helper/linkList");
    var completeDimensions = require("../../data/helper/completeDimensions");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    return function(nodes, edges, hostModel, directed) {
        var graph = new Graph(directed);
        for (var i = 0; i < nodes.length; i++) {
            graph.addNode(zrUtil.retrieve(nodes[i].id, nodes[i].name, i), i);
        }
        var linkNameList = [];
        var validEdges = [];
        for (var i = 0; i < edges.length; i++) {
            var link = edges[i];
            if (graph.addEdge(link.source, link.target, i)) {
                validEdges.push(link);
                linkNameList.push(zrUtil.retrieve(link.id, link.source + " - " + link.target));
            }
        }
        var dimensionNames = completeDimensions([ "value" ], nodes);
        var nodeData = new List(dimensionNames, hostModel);
        var edgeData = new List([ "value" ], hostModel);
        nodeData.initData(nodes);
        edgeData.initData(validEdges, linkNameList);
        graph.setEdgeData(edgeData);
        linkList.linkToGraph(nodeData, graph);
        graph.update();
        return graph;
    };
});