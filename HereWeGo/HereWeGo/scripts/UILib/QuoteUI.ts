import UIUtil = require('./UIUtil');
import QuoteDataInterface = require('../WHSLib/Interfaces/QuoteDataInterface');

/**
 * Daily Quote element, as suggested by Mr. Chatard.
 * 
 * Creates a little paragraph quote of the day, used in the bottom of {@link MenuUI}. Recieves quote
 * information from {@link QuoteDataManage} through {@link DataManage}.
 */

class QuoteUI extends UIUtil.UIItem {
    /**
     * Quote text template
     * .smallT is a default CSS text class, all values in it can be overriden, but I thought it looks nice
     * @param className className: CSS classes to apply to the quote
     * @param id id: The div ID from {@link UIUtil.UIItem.id}
     * @param text text: The actual quote content (line breaks need to be added manually) 
     */
    private static readonly templateStr: string = `<p class="smallT {{className}}" id="{{id}}">{{text}}</p>`;
    /**
     * Recv parameters ({@link UIUtil.RecvParams}) specifying we need quote data.
     */
    readonly recv: Array<UIUtil.RecvParams> = [
        {
            type: UIUtil.RecvType.QUOTE,
        }
    ];
    //storage stuff
    private readonly className: string;
    private readonly maxLen: number;
    private elem: HTMLElement;
    //make it shake it bake it
    //^ I have no memory writing this, don't code at 2am kids
    /**
     * @param className CSS classes to apply to the <p> containing the quote
     * @param lineLen Maximum line length before <br> tags are automatically inserted
     */
    constructor(className: string, lineLen: number) {
        super();
        this.className = className;
        this.maxLen = lineLen;
    }
    /**
     * Build HTML based on the quote data generated from {@link QuoteDataManage}.
    * @param data The {@link DataManage} generated data, containing {@link QuoteDataManage} data
    * @returns The quote HTML
     */
    onInit(data: Array<any>): string {
        let ret = UIUtil.templateEngine(QuoteUI.templateStr, {
            className: this.className,
            id: this.id,
            text: this.makeQuote(data[UIUtil.RecvType.QUOTE]),
        });
        //return
        return ret;
    }
    /**
     * Store {@link QuoteUI.elem}.
     */
    buildJS() {
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
    }
    /**
     * Replace quote with updated quote on update using {@link QuoteDataManage.elem}.
     * @param data The {@link DataManage} generated data, containing {@link QuoteDataManage} data
     */
    onUpdate(data: Array<any>) {
        if (data[UIUtil.RecvType.QUOTE]) this.elem.innerHTML = this.makeQuote(data[UIUtil.RecvType.QUOTE]);
    }
    //utility construct quote HTML function
    private makeQuote(data: QuoteDataInterface): string {
        //add breaklines to quote so we don't overflow, and add the author after another breakline
        return UIUtil.breakText(data.quote, this.maxLen) + `<br/>-` + (data.author ? data.author : 'Unknown');
    }
}

export = QuoteUI;