define("crm-modules/common/echarts/coord/parallel/ParallelModel", [ "crm-modules/common/echarts/zrender/core/util", "../../model/Component", "./AxisModel" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Component = require("../../model/Component");
    require("./AxisModel");
    Component.extend({
        type: "parallel",
        dependencies: [ "parallelAxis" ],
        coordinateSystem: null,
        dimensions: null,
        parallelAxisIndex: null,
        defaultOption: {
            zlevel: 0,
            z: 0,
            left: 80,
            top: 60,
            right: 80,
            bottom: 60,
            layout: "horizontal",
            parallelAxisDefault: null
        },
        init: function() {
            Component.prototype.init.apply(this, arguments);
            this.mergeOption({});
        },
        mergeOption: function(newOption) {
            var thisOption = this.option;
            newOption && zrUtil.merge(thisOption, newOption);
            this._initDimensions();
        },
        contains: function(model, ecModel) {
            var parallelIndex = model.get("parallelIndex");
            return parallelIndex != null && ecModel.getComponent("parallel", parallelIndex) === this;
        },
        _initDimensions: function() {
            var dimensions = this.dimensions = [];
            var parallelAxisIndex = this.parallelAxisIndex = [];
            var axisModels = zrUtil.filter(this.dependentModels.parallelAxis, function(axisModel) {
                return axisModel.get("parallelIndex") === this.componentIndex;
            });
            zrUtil.each(axisModels, function(axisModel) {
                dimensions.push("dim" + axisModel.get("dim"));
                parallelAxisIndex.push(axisModel.componentIndex);
            });
        }
    });
});