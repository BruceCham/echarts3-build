define("crm-modules/common/echarts/chart/helper/LineDraw", [ "../../util/graphic", "./Line" ], function(require, exports, module) {
    var graphic = require("../../util/graphic");
    var LineGroup = require("./Line");
    function LineDraw(ctor) {
        this._ctor = ctor || LineGroup;
        this.group = new graphic.Group();
    }
    var lineDrawProto = LineDraw.prototype;
    lineDrawProto.updateData = function(lineData, fromData, toData) {
        var oldLineData = this._lineData;
        var group = this.group;
        var LineCtor = this._ctor;
        lineData.diff(oldLineData).add(function(idx) {
            var lineGroup = new LineCtor(lineData, fromData, toData, idx);
            lineData.setItemGraphicEl(idx, lineGroup);
            group.add(lineGroup);
        }).update(function(newIdx, oldIdx) {
            var lineGroup = oldLineData.getItemGraphicEl(oldIdx);
            lineGroup.updateData(lineData, fromData, toData, newIdx);
            lineData.setItemGraphicEl(newIdx, lineGroup);
            group.add(lineGroup);
        }).remove(function(idx) {
            group.remove(oldLineData.getItemGraphicEl(idx));
        }).execute();
        this._lineData = lineData;
        this._fromData = fromData;
        this._toData = toData;
    };
    lineDrawProto.updateLayout = function() {
        var lineData = this._lineData;
        lineData.eachItemGraphicEl(function(el, idx) {
            el.updateLayout(lineData, this._fromData, this._toData, idx);
        }, this);
    };
    lineDrawProto.remove = function() {
        this.group.removeAll();
    };
    return LineDraw;
});