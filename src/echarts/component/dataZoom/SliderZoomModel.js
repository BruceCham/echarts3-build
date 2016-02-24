define("crm-modules/common/echarts/component/dataZoom/SliderZoomModel", [ "./DataZoomModel", "../../util/layout" ], function(require, exports, module) {
    var DataZoomModel = require("./DataZoomModel");
    var layout = require("../../util/layout");
    return DataZoomModel.extend({
        type: "dataZoom.slider",
        inputPositionParams: null,
        defaultOption: {
            show: true,
            left: "auto",
            right: "auto",
            top: "auto",
            bottom: "auto",
            width: "auto",
            height: "auto",
            backgroundColor: "rgba(47,69,84,0)",
            dataBackgroundColor: "#ddd",
            fillerColor: "rgba(47,69,84,0.25)",
            handleColor: "rgba(47,69,84,0.65)",
            handleSize: 10,
            labelPrecision: null,
            labelFormatter: null,
            showDetail: true,
            showDataShadow: "auto",
            realtime: true,
            zoomLock: false,
            textStyle: {
                color: "#333"
            }
        },
        init: function(option) {
            this.inputPositionParams = layout.getLayoutParams(option);
            this.$superApply("init", arguments);
        },
        mergeOption: function(option) {
            this.inputPositionParams = layout.getLayoutParams(option);
            this.$superApply("mergeOption", arguments);
        }
    });
});