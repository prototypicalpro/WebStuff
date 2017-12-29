/**
 * Class to standardify the opening of internal external pages
 * e.g. settings
 * Will open a page given an object specifying the pages html
 * and automatically templates in and out of existance 
 */

 import UIUtil = require("./UIUtil");
 import HTMLMap = require("../HTMLMap");

 class PopupUI extends UIUtil.UIItem {
    //the template string for the page
    //in this, we duplicate the title bar except with a back button and custom text
    private readonly template: string = `
        <div class="topBar topH"><div class="textPos"><p id="pageText" class="barText"></p></div></div>
        <div class="topPos topH">
            <div class="barShade"></div>
            <div id="pageButton" class="sideButton"></div>
        </div>
        <div id="pageAdd"></div>`;
    //css class to show the page
    private readonly showClass: string = "pShown";
    //storage members
    private addDiv: HTMLElement;
    private textBox: HTMLElement;
    private pageDiv: HTMLElement;
    private backButton: HTMLElement;
    //store the last recieved data object so we can pass it to the page later
    private lastData: Array<any>;
    //the array of items
    private pages: { [key:string]:UIUtil.UIItem; };
    private pageKey: string;
    //and the recv params
    recvParams: Array<UIUtil.RecvParams>;
    //teh settings
    //pass the object of possible pages to open formatted as such:
    // {"page1" : new UIItem(), "page2": new thing(), etc. }
    // that way, later on we can reference each page by a string id
    // e.g. Popup.open("page1");
    constructor(pages: { [key:string]:UIUtil.UIItem; }) {
        super();
        this.pages = pages;
        //convert to array, then store in recv params
        this.recvParams = UIUtil.combineParams(Object.keys(pages).map((key: string) => { return pages[key]; }));
    }

    onInit(data: Array<any>): void {
        HTMLMap.pageBox.innerHTML = this.template;
        this.lastData = data;
    }

    buildJS() {
        this.pageDiv = document.querySelector("#page");
        this.addDiv = this.pageDiv.querySelector('#pageAdd');
        this.textBox = this.pageDiv.querySelector('#pageText');
        this.backButton = this.pageDiv.querySelector('#pageButton');
    }

    onUpdate(data: Array<any>) {
        this.lastData = data;
    }

    showPage(pageId: string) {
        if(!this.pages[pageId]) throw "Wrong PageID dumbo";
        //initialize with last known data, filling the html as we go
        this.textBox.innerHTML = pageId;
        this.addDiv.innerHTML = <string>this.pages[pageId].onInit(this.lastData);
        //display!
        //once it's done moving, run the JS and bind the back button
        //create event listener functions
        this.pageKey = pageId;
        this.pageDiv.addEventListener("transitionend", this.transitionEndOpen);
        this.pageDiv.classList.add(this.showClass);
    }

    private transitionEndOpen = (() => {
        this.pageDiv.removeEventListener("transitionend", this.transitionEndOpen);
        this.pages[this.pageKey].buildJS();
        this.backButton.addEventListener("touchstart", this.hidePage, true);
        document.addEventListener("backbutton", this.hidePage, true);
    }).bind(this);

    private transitionEndClose = (()  => {
        this.pageDiv.removeEventListener("transitionend", this.transitionEndClose);
        this.addDiv.innerHTML = '';
        this.textBox.innerHTML = '';
    }).bind(this);

    private hidePage = ((evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        this.backButton.removeEventListener("touchstart", this.hidePage, true);
        document.removeEventListener("backbutton", this.hidePage, true);
        this.pageDiv.addEventListener("transitionend", this.transitionEndClose);
        this.pageDiv.classList.remove(this.showClass);
    }).bind(this);
 }

 export = PopupUI;