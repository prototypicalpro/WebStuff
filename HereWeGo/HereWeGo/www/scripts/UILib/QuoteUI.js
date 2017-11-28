define(["require", "exports", "./UIUtil"], function (require, exports, UIUtil) {
    "use strict";
    class QuoteUI extends UIUtil.UIItem {
        constructor(className, lineLen) {
            super();
            this.templateStr = `<p class="{{className}}" id="{{id}}">{{text}}</p>`;
            this.recv = [
                {
                    type: 1,
                }
            ];
            this.className = className;
            this.maxLen = lineLen;
        }
        onInit(data) {
            let ret = UIUtil.templateEngine(this.templateStr, {
                className: this.className,
                id: this.id,
                text: this.makeQuote(data[1]),
            });
            return ret;
        }
        buildJS() {
            this.elem = document.querySelector('#' + this.id);
        }
        onUpdate(data) {
            if (data[1])
                this.elem.innerHTML = this.makeQuote(data[1]);
        }
        makeQuote(data) {
            let quotefix = '';
            let tempQuote = data.quote;
            while (tempQuote.length > this.maxLen) {
                let breakPoint = tempQuote.slice(0, this.maxLen).lastIndexOf(' ');
                quotefix += tempQuote.slice(0, breakPoint) + `<br/>`;
                tempQuote = tempQuote.slice(breakPoint + 1);
            }
            if (quotefix.length)
                quotefix += tempQuote;
            else
                quotefix = tempQuote;
            quotefix += `<br/>-` + (data.author ? data.author : 'Unknown');
            data = null;
            return quotefix;
        }
    }
    return QuoteUI;
});
//# sourceMappingURL=QuoteUI.js.map