 import UIUtil = require('./UIUtil');
 import IScroll = require('../iscroll-lite');


/**
 * Takes a list of UIItems and creates a simple scrolling page using {@link IScroll http://iscrolljs.com/}.
 */
 class ScrollPageUI extends UIUtil.UIItem {
    id: string;
    /**
     * Scroll wrapper template
     * @param id id: The ID of the div element
     * @param stuff stuff: The scrollable content HTML
     */
    private static readonly scrollWrapperTemplate: string = `
        <div id="{{id}}" class="full">                    
            <div class="scrollHack"> 
                {{stuff}} 
            </div>
        </div>`;
    //stored uiitems to display
    private readonly items: Array<UIUtil.UIItem>;
    private readonly endWithBreakline: boolean;
    //and the recv params to go with it
    readonly recvParams: Array<any>;
    //stored IScroll object
    private iscroll: any;
    private scrollBody: HTMLElement;
    /**
     * @param items Array of UIItems for content
     * @param endWithBreakline If true, add <p><br/></p> to the end of the content for a simple bottom margin
     */
    constructor(items: Array<UIUtil.UIItem>, endWithBreakline?: boolean) {
        super();
        this.items = items;
        this.recvParams = UIUtil.combineParams(items);
        this.endWithBreakline = endWithBreakline;
    }
    //build our page using the template and the html from all of our items
    onInit(data: Array<any>): string {
        let str = UIUtil.templateEngine(ScrollPageUI.scrollWrapperTemplate, { id : this.id, stuff : this.items.map(item => item.onInit(data)).join('') + (this.endWithBreakline ? "<p><br></p>" : "")});
        if(this.endWithBreakline) str += "<p><br></p>";
        return str;
    }
    //start up iscroll
    buildJS(): void {
        //store element
        this.scrollBody = document.querySelector('#' + this.id);
        //start and store iscroll
        this.iscroll = new IScroll(this.scrollBody);
        //run the js on all of our items
        for(let i = 0, len = this.items.length; i < len; i++) this.items[i].buildJS();
    }
    //onupdate calls all the children
    onUpdate(data: Array<any>): void {
        for(let i = 0, len = this.items.length; i < len; i++) if(this.items[i].onUpdate) this.items[i].onUpdate(data);
        //refresh iscoll just in case
        this.iscroll.refresh();
    }
    //ontimechanged same idea
    onTimeChanged(): void {
        for(let i = 0, len = this.items.length; i < len; i++) if(this.items[i].onTimeChanged) this.items[i].onTimeChanged();
        this.iscroll.refresh();
    }
    //onFocus as well
    onFocus(): void {
        for(let i = 0, len = this.items.length; i < len; i++) if(this.items[i].onFocus) this.items[i].onFocus();
        //also recalc IScroll
        //just in case
        this.iscroll.refresh();
    }
 }

 export = ScrollPageUI;