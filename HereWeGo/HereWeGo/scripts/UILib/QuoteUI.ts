/**
 * text thing to display the quote of the day
 * cuz I could
 */

import UIUtil = require('./UIUtil');
import QuoteDataInterface = require('../WHSLib/QuoteDataInterface');

class QuoteUI extends UIUtil.UIItem {
    //template, pretty simple
    private readonly template: string = `<p class="{{className}}" id="{{id}}">{{text}}</p>`;
    //storage stuff
    private readonly className: string;
    private readonly maxLen: number;
    private elem: HTMLElement;
    //callback quote storage
    private quoteStore: QuoteDataInterface;
    //make it shake it bake it
    constructor(className: string, lineLen: number) {
        super();
        this.className = className;
        this.maxLen = lineLen;
    }
    //getHTMLJESUS
    getHTML(): string {
        let ret = UIUtil.templateEngine(this.template, {
            className: this.className,
            id: this.id,
            text: this.makeQuote(),
        });
        //return
        return ret;
    }
    //store document element
    onInit() {
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
    }
    //get dat quote
    recv: Array<UIUtil.QuoteParams> = [
        {
            type: UIUtil.RecvType.QUOTE,
            storeQuote: ((quote) => { this.quoteStore = quote; }).bind(this),
        }
    ];
    //fix quote on update
    onUpdate(why: Array<UIUtil.TRIGGERED>) {
        if (this.quoteStore) this.elem.innerHTML = this.makeQuote();
    }
    //utility construct quote HTML function
    private makeQuote(): string {
        let quotefix = '';
        let tempQuote: string = this.quoteStore.quote;
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
        quotefix += `<br/>-` + (this.quoteStore.author ? this.quoteStore.author : 'Unknown');
        //delete quoteStore
        this.quoteStore = null;
        //return!
        return quotefix;
    }
}

export = QuoteUI;