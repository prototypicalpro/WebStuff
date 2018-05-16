 import UIUtil = require("./UIUtil");
 import HTMLMap = require("../HTMLMap");
 import DataManage = require('../DataManage');

/**
 * Class to standardize opening of external pages (ex. settings page).
 * 
 * Uses HTML generated from a {@link UIUtil.UIItem}, and displays it in a "popup" page which
 * slides up from the bottom of the screen. Data is applied to the page during the opening
 * process using a stored {@link DataManage} class, so the UIItem is only constructed when the
 * page is shown. Content is added to {@link HTMLMap.pageDiv}, and page is displayed and hidden using CSS.
 * Note: {@link UIUtil.UIItem.onFocus} is called immediatly after {@link UIUtil.UIItem.buildJS} on the end
 * of the displaying CSS transistion.
 */
 class PopupUI extends UIUtil.UIItem {
    /** CSS class to add to {@link HTMLMap.pageDiv} to display the page */
    private static readonly showClass: string = "pShown";
    //storage members
    private addDiv: HTMLElement;
    private textBox: HTMLElement;
    private backButton: HTMLElement;
    //the array of items
    private page: UIUtil.UIItem;
    //datamanage class to generate the data on click
    private readonly data: DataManage;
    /**
     * @param data {@link DataManage} class instance to be used to generate the HTML strings in {@link PopupUI.showPage}
     */
    constructor(data: DataManage) {
        super();
        this.data = data;
    }
    onInit(): void {

    }
    buildJS() {
        HTMLMap.pageDiv.style.display = 'initial';
        this.addDiv = HTMLMap.pageDiv.querySelector('#pageAdd');
        this.textBox = HTMLMap.pageDiv.querySelector('#pageText');
        this.backButton = HTMLMap.pageDiv.querySelector('#pageButton');
    }
    onUpdate(): void {

    }
    /**
     * Display a UIItem in our popup. First applies data to the page using {@link DataManage.generateData},
     * then takes the returned HTML from {@link UIUtil.UIItem.onInit} and places it into the page, then
     * applies the CSS to display the page, then finally after the CSS is finished transitioning runs the
     * {@link UIUtil.UIItem.buildJS} and {@link UIUtil.UIItem.onFocus} of the page.
     * @param page The UIItem to display on the page
     * @param name Name to display at the top of the page
     */
    showPage(page: UIUtil.UIItem, name: string): Promise<any> {
        if(!page) throw "Page is null";
        //initialize with new data, filling the html as we go
        return this.data.generateData([page]).then((dataRay => {
            this.textBox.innerHTML = name;
            this.addDiv.innerHTML = <string>page.onInit(dataRay);
            //display!
            //once it's done moving, run the JS and bind the back button
            //create event listener functions
            this.page = page
            HTMLMap.pageDiv.addEventListener("transitionend", this.transitionEndOpen);
            HTMLMap.pageDiv.classList.add(PopupUI.showClass);
        }).bind(this));
    }
    /** After transition calling of fuctions and binding of listeners */
    private transitionEndOpen = (() => {
        HTMLMap.pageDiv.removeEventListener("transitionend", this.transitionEndOpen);
        this.page.buildJS();
        if(this.page.onFocus) this.page.onFocus();
        this.backButton.addEventListener("touchstart", this.hidePage, true);
        document.addEventListener("backbutton", this.hidePage, true);
    }).bind(this);

    /** Cleanup our old items we don't need anymore */
    private transitionEndClose = (()  => {
        HTMLMap.pageDiv.removeEventListener("transitionend", this.transitionEndClose);
        delete this.page;
        this.textBox.innerHTML = '';
    }).bind(this);

    /** Event listener for the back button located in the top left */
    private hidePage = ((evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        this.backButton.removeEventListener("touchstart", this.hidePage, true);
        document.removeEventListener("backbutton", this.hidePage, true);
        HTMLMap.pageDiv.addEventListener("transitionend", this.transitionEndClose);
        this.addDiv.innerHTML = '';
        HTMLMap.pageDiv.classList.remove(PopupUI.showClass);
    }).bind(this);
 }

 export = PopupUI;