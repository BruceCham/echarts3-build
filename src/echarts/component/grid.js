define("crm-modules/common/echarts/component/grid", [ "../util/graphic", "crm-modules/common/echarts/zrender/core/util", "../coord/cartesian/Grid", "./axis", "../echarts" ], function(require, exports, module) {
    "use strict";
    var graphic = require("../util/graphic");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    require("../coord/cartesian/Grid");
    require("./axis");
    require("../echarts").extendComponentView({
        type: "grid",
        render: function(gridModel, ecModel) {
            this.group.removeAll();
            if (gridModel.get("show")) {
                this.group.add(new graphic.Rect({
                    shape: gridModel.coordinateSystem.getRect(),
                    style: zrUtil.defaults({
                        fill: gridModel.get("backgroundColor")
                    }, gridModel.getItemStyle()),
                    silent: true
                }));
            }
        }
    });
});