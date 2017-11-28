define(["require", "exports"], function (require, exports) {
    "use strict";
    var UIUtil;
    (function (UIUtil) {
        UIUtil.templateEngine = (template, values) => {
            let re = new RegExp(Object.keys(values)
                .map((str) => { return '{{' + str + '}}'; })
                .join('|'), 'g');
            return template.replace(re, function (matched) { return values[matched.replace(new RegExp(/{|}/, 'g'), '')]; });
        };
        UIUtil.combineParams = (ray) => {
            return [].concat.apply([], ray.map((item) => { return item.recvParams; }).filter((obj) => { return obj; }));
        };
        var idCount = 0;
        const getUniqueId = () => {
            return idCount++;
        };
        class UIItem {
            constructor() {
                this.id = 'i' + getUniqueId();
            }
        }
        UIUtil.UIItem = UIItem;
    })(UIUtil || (UIUtil = {}));
    return UIUtil;
});
//# sourceMappingURL=UIUtil.js.map