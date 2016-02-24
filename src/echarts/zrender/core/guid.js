define("crm-modules/common/echarts/zrender/core/guid", [], function() {
    var idStart = 2311;
    return function() {
        return "zr_" + idStart++;
    };
});