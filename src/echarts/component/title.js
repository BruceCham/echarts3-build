define("crm-modules/common/echarts/component/title", [ "../echarts", "../util/graphic", "../util/layout" ], function(require, exports, module) {
    "use strict";
    var echarts = require("../echarts");
    var graphic = require("../util/graphic");
    var layout = require("../util/layout");
    echarts.extendComponentModel({
        type: "title",
        defaultOption: {
            zlevel: 0,
            z: 6,
            show: true,
            text: "",
            target: "blank",
            subtext: "",
            subtarget: "blank",
            left: "left",
            top: "top",
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "#ccc",
            borderWidth: 0,
            padding: 5,
            itemGap: 10,
            textStyle: {
                fontSize: 18,
                fontWeight: "bolder",
                color: "#333"
            },
            subtextStyle: {
                color: "#aaa"
            }
        }
    });
    echarts.extendComponentView({
        type: "title",
        render: function(titleModel, ecModel, api) {
            this.group.removeAll();
            if (!titleModel.get("show")) {
                return;
            }
            var group = this.group;
            var textStyleModel = titleModel.getModel("textStyle");
            var subtextStyleModel = titleModel.getModel("subtextStyle");
            var textAlign = titleModel.get("textAlign");
            var textEl = new graphic.Text({
                style: {
                    text: titleModel.get("text"),
                    textFont: textStyleModel.getFont(),
                    fill: textStyleModel.getTextColor(),
                    textBaseline: "top"
                },
                z2: 10
            });
            var textRect = textEl.getBoundingRect();
            var subText = titleModel.get("subtext");
            var subTextEl = new graphic.Text({
                style: {
                    text: subText,
                    textFont: subtextStyleModel.getFont(),
                    fill: subtextStyleModel.getTextColor(),
                    y: textRect.height + titleModel.get("itemGap"),
                    textBaseline: "top"
                },
                z2: 10
            });
            var link = titleModel.get("link");
            var sublink = titleModel.get("sublink");
            textEl.silent = !link;
            subTextEl.silent = !sublink;
            if (link) {
                textEl.on("click", function() {
                    window.open(link, titleModel.get("target"));
                });
            }
            if (sublink) {
                subTextEl.on("click", function() {
                    window.open(sublink, titleModel.get("subtarget"));
                });
            }
            group.add(textEl);
            subText && group.add(subTextEl);
            var groupRect = group.getBoundingRect();
            var layoutOption = titleModel.getBoxLayoutParams();
            layoutOption.width = groupRect.width;
            layoutOption.height = groupRect.height;
            var layoutRect = layout.getLayoutRect(layoutOption, {
                width: api.getWidth(),
                height: api.getHeight()
            }, titleModel.get("padding"));
            if (!textAlign) {
                var p = layoutRect.x / api.getWidth();
                var p2 = (layoutRect.x + layoutRect.width) / api.getWidth();
                if (p < .2) {
                    textAlign = "left";
                } else if (p2 > .8) {
                    layoutRect.x += layoutRect.width;
                    textAlign = "right";
                } else {
                    layoutRect.x += layoutRect.width / 2;
                    textAlign = "center";
                }
            }
            group.position = [ layoutRect.x, layoutRect.y ];
            textEl.setStyle("textAlign", textAlign);
            subTextEl.setStyle("textAlign", textAlign);
            groupRect = group.getBoundingRect();
            var padding = layoutRect.margin;
            var style = titleModel.getItemStyle([ "color", "opacity" ]);
            style.fill = titleModel.get("backgroundColor");
            var rect = new graphic.Rect({
                shape: {
                    x: groupRect.x - padding[3],
                    y: groupRect.y - padding[0],
                    width: groupRect.width + padding[1] + padding[3],
                    height: groupRect.height + padding[0] + padding[2]
                },
                style: style,
                silent: true
            });
            graphic.subPixelOptimizeRect(rect);
            group.add(rect);
        }
    });
});