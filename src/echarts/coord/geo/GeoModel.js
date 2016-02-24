define("crm-modules/common/echarts/coord/geo/GeoModel", [ "../../util/model", "../../model/Component" ], function(require, exports, module) {
    "use strict";
    var modelUtil = require("../../util/model");
    var ComponentModel = require("../../model/Component");
    ComponentModel.extend({
        type: "geo",
        coordinateSystem: null,
        init: function(option) {
            ComponentModel.prototype.init.apply(this, arguments);
            modelUtil.defaultEmphasis(option.label, [ "position", "show", "textStyle", "distance", "formatter" ]);
        },
        defaultOption: {
            zlevel: 0,
            z: 0,
            show: true,
            left: "center",
            top: "center",
            map: "",
            roamDetail: {
                x: 0,
                y: 0,
                zoom: 1
            },
            label: {
                normal: {
                    show: false,
                    textStyle: {
                        color: "#000"
                    }
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        color: "rgb(100,0,0)"
                    }
                }
            },
            itemStyle: {
                normal: {
                    borderWidth: .5,
                    borderColor: "#444",
                    color: "#eee"
                },
                emphasis: {
                    color: "rgba(255,215,0,0.8)"
                }
            }
        },
        getFormattedLabel: function(name, status) {
            var formatter = this.get("label." + status + ".formatter");
            var params = {
                name: name
            };
            if (typeof formatter === "function") {
                params.status = status;
                return formatter(params);
            } else if (typeof formatter === "string") {
                return formatter.replace("{a}", params.seriesName);
            }
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
        }
    });
});