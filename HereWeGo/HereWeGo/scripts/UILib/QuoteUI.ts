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
    //get dat quote
    onInitRecv: Array<UIUtil.QuoteParams> = [
        {
            type: UIUtil.RecvType.QUOTE,
            storeQuote: ((quote) => { this.quoteStore = quote; }).bind(this),
        }
    ];
    //getHTMLJESUS
    getHTML(): string {
        let quotefix;
        //add breaklines to quote so we don't overflow
        if (this.quoteStore.length >= this.maxLen) {
            //work on the substring ending at the 64th char
            //starting at the 64th char, and work backwards until we find a space
            let breakPoint = (<string>this.quoteStore.quote).slice(0, this.maxLen).lastIndexOf(' ');
            //add a break tag to that space
            quotefix = (<string>this.quoteStore.quote).slice(0, breakPoint) + `<br/>` + (<string>this.quoteStore.quote).slice(breakPoint + 1);
        }
        else quotefix = this.quoteStore.quote;
        //add the author after another breakline
        quotefix += `<br/>-` + this.quoteStore.author;
        let ret = UIUtil.templateEngine(this.template, {
            className: this.className,
            id: this.id,
            text: quotefix,
        });
        //clear old data
        this.quoteStore = null;
        //return
        return ret;
    }
    //store document element
    onInit() {
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
    }
    //fix quote on update
    onQuoteUpdate() {
        this.elem.innerHTML = this.getHTML();
    }
}

export = QuoteUI;