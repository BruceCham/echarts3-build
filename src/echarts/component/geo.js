define("crm-modules/common/echarts/component/geo", [ "../coord/geo/geoCreator", "./geo/GeoView", "../action/geoRoam" ], function(require, exports, module) {
    require("../coord/geo/geoCreator");
    require("./geo/GeoView");
    require("../action/geoRoam");
});