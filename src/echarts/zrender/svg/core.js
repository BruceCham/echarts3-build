define("crm-modules/common/echarts/zrender/svg/core", [], function(require, exports, module) {
    var svgURI = "http://www.w3.org/2000/svg";
    return {
        createElement: function(name) {
            return document.createElementNS(svgURI, name);
        }
    };
});