/**
 * Class to standardify the opening of internal external pages
 * e.g. settings
 * Will open a page given an object specifying the pages html
 * and automatically templates in and out of existance 
 */

 import UIUtil = require("./UIUtil");
 import HTMLMap = require("../HTMLMap");
 import DataManage = require('../DataManage');

 class PopupUI extends UIUtil.UIItem {
    //css class to show the page
    private static readonly showClass: string = "pShown";
    //storage members
    private addDiv: HTMLElement;
    private textBox: HTMLElement;
    private pageDiv: HTMLElement;
    private backButton: HTMLElement;
    //the array of items
    private page: UIUtil.UIItem;
    //datamanage class to generate the data on click
    private readonly data: DataManage;
    //teh settings
    //pass the object of possible pages to open formatted as such:
    // {"page1" : new UIItem(), "page2": new thing(), etc. }
    // that way, later on we can reference each page by a string id
    // e.g. Popup.open("page1");
    constructor(data: DataManage) {
        super();
        this.data = data;
    }

    onInit(): void {

    }

    buildJS() {
        this.pageDiv = document.querySelector("#page");
        this.pageDiv.style.display = 'initial';
        this.addDiv = this.pageDiv.querySelector('#pageAdd');
        this.textBox = this.pageDiv.querySelector('#pageText');
        this.backButton = this.pageDiv.querySelector('#pageButton');
    }

    onUpdate(): void {

    }

    showPage(page: UIUtil.UIItem, name: string): Promise<any> {
        if(!page) throw "Wrong PageID dumbo";
        //initialize with new data, filling the html as we go
        return this.data.generateData([page]).then(((dataRay) => {
            this.textBox.innerHTML = name;
            this.addDiv.innerHTML = <string>page.onInit(dataRay);
            //display!
            //once it's done moving, run the JS and bind the back button
            //create event listener functions
            this.page = page
            this.pageDiv.addEventListener("transitionend", this.transitionEndOpen);
            this.pageDiv.classList.add(PopupUI.showClass);
        }).bind(this));
    }

    private transitionEndOpen = (() => {
        this.pageDiv.removeEventListener("transitionend", this.transitionEndOpen);
        this.page.buildJS();
        if(this.page.onFocus) this.page.onFocus();
        this.backButton.addEventListener("touchstart", this.hidePage, true);
        document.addEventListener("backbutton", this.hidePage, true);
    }).bind(this);

    private transitionEndClose = (()  => {
        this.pageDiv.removeEventListener("transitionend", this.transitionEndClose);
        delete this.page;
        this.textBox.innerHTML = '';
    }).bind(this);

    private hidePage = ((evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        this.backButton.removeEventListener("touchstart", this.hidePage, true);
        document.removeEventListener("backbutton", this.hidePage, true);
        this.pageDiv.addEventListener("transitionend", this.transitionEndClose);
        this.addDiv.innerHTML = '';
        this.pageDiv.classList.remove(PopupUI.showClass);
    }).bind(this);
 }

 export = PopupUI;