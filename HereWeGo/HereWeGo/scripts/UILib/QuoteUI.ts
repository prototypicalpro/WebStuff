/**
 * text thing to display the quote of the day
 * cuz I could
 */

import UIUtil = require('./UIUtil');
import QuoteDataInterface = require('../WHSLib/Interfaces/QuoteDataInterface');

class QuoteUI extends UIUtil.UIItem {
    //template, pretty simple
    private readonly templateStr: string = `<p class="{{className}}" id="{{id}}">{{text}}</p>`;
    //storage stuff
    private readonly className: string;
    private readonly maxLen: number;
    private elem: HTMLElement;
    //make it shake it bake it
    constructor(className: string, lineLen: number) {
        super();
        this.className = className;
        this.maxLen = lineLen;
    }
    //getHTMLJESUS
    onInit(data: Array<any>): string {
        let ret = UIUtil.templateEngine(this.templateStr, {
            className: this.className,
            id: this.id,
            text: this.makeQuote(data[UIUtil.RecvType.QUOTE]),
        });
        //return
        return ret;
    }
    //store document element
    buildJS() {
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
    }
    //get dat quote
    recv: Array<UIUtil.RecvParams> = [
        {
            type: UIUtil.RecvType.QUOTE,
        }
    ];
    //fix quote on update
    onUpdate(data: Array<any>) {
        if (data[UIUtil.RecvType.QUOTE]) this.elem.innerHTML = this.makeQuote(data[UIUtil.RecvType.QUOTE]);
    }
    //utility construct quote HTML function
    private makeQuote(data: QuoteDataInterface): string {
        let quotefix = '';
        let tempQuote: string = data.quote;
        //add breaklines to quote so we don't overflow
        while (tempQuote.length > this.maxLen) {
            //work on the substring ending at the 64th char
            //starting at the 64th char, and work backwards until we find a space
            let breakPoint = tempQuote.slice(0, this.maxLen).lastIndexOf(' ');
            //add a break tag to that space
            quotefix += tempQuote.slice(0, breakPoint) + `<br/>`;
            tempQuote = tempQuote.slice(breakPoint + 1);
        }
        if (quotefix.length) quotefix += tempQuote;
        else quotefix = tempQuote;
        //add the author after another breakline
        quotefix += `<br/>-` + (data.author ? data.author : 'Unknown');
        //delete quoteStore
        data = null;
        //return!
        return quotefix;
    }
}

export = QuoteUI;