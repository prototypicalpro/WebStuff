/**
 * A sliding tab system for the bottom content UI
 * takes a buncha HTML strings created from individual UIItems, horizontally flatmaps them,
 * and then displays them in android-style moving tab thingys
 * IDK how I'm going to handle touch and stuff yet
 * LOL NVM FUCK TOUCH. LIBRARY HERE WE COME
 */

import UIUtil = require('./UIUtil');
import HTMLMap = require('../HTMLMap');
import lory = require('../lory');
import ButtonUI = require('./ButtonUI');
import TimeFormatUtil = require('../TimeFormatUtil');

class SlideTabUI extends UIUtil.UIItem {
    id: string;
    //wrapper template to make everything horizontally flatmapped
    private readonly wrapperTemplate: string = `<div class="js_slide content">{{stuff}}</div>`;
    //stored pages, to be flatmapped and shiz
    private readonly pages: Array<Array<UIUtil.UIItem>>;
    //stored names for buttons later on
    private readonly names: Array<string>;
    //stored date
    private dayUpdate: boolean;
    //storeage lory object
    private storly: any;
    //fill them varlibles
    constructor(pages: Array<Array<UIUtil.UIItem>>, names: Array<string>) {
        super();
        this.pages = pages;
        this.names = names;
        this.recvParams = UIUtil.combineParams([].concat.apply(pages));
    }
    //and the getHTML
    onInit(data: Array<any>): void {
        //get all the htmls in parellel
        //this chaining is gonna be beutiful
        //for every array of pages
        HTMLMap.setSliderHTML(this.pages.map((items: Array<UIUtil.UIItem>) => { return UIUtil.templateEngine(this.wrapperTemplate, { stuff: items.map((item) => { return item.onInit(data); }).join('') }); }).join('')); //one. freaking. line
    }
    
    buildJS() {
        //start up lory
        let thing = document.querySelector('body');
        this.storly = lory.lory(thing, {
            //snapping only to js_slide
            classNameSlide: 'js_slide',
            searchDepth: 1,
            //snappier scrolling
            slideSpeed: 300,
            snapBackSpeed: 200,
            ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
            //disable overflow scrolling
            overflowScroll: false,
            //fancy indicators
            indicators: [{
                element: document.querySelector('#menuLine'),
                axis: 'x',
                speedRatio: -(1 / this.names.length), //TODO: Dynamically scale bottom menu and calculate at runtime
            },
            {
                element: document.querySelector('#textWrap'),
                axis: 'y',
                speedRatio: -0.3,
                maxSlide: 1
            },
            {
                element: document.querySelector('#topBar'),
                axis: 'x',
                speedRatio: 1,
                maxSlide: 1
            }]
        });
        //then fire up the menu and menu buttons
        let htmlStr = '';
        //create a bunch of button objects, bind thier callbacks, then destroy them b/c they don't need updating
        let buttonRay = this.names.map((name, index) => {
            let button = new ButtonUI('menu', 'menuText', name, (() => this.storly.slideTo(index)).bind(this), null, null, true);
            htmlStr += button.onInit();
            return button;
        });
        //set the menu html
        HTMLMap.menuBar.innerHTML = htmlStr;
        //run all that menu javascript
        for (let i = 0, len = buttonRay.length; i < len; i++) buttonRay[i].buildJS();
        //set the top grey bar date correctly
        HTMLMap.topBarText.innerHTML = TimeFormatUtil.asLongDayMonthText(new Date());
        this.dayUpdate = false;
        //finally, run the JS of all the little dudes
        for (let i = 0, len = this.pages.length; i < len; i++) for (let o = 0, len1 = this.pages[i].length; o < len1; o++) this.pages[i][o].buildJS();
    }
    /* TODO: fix for new system
    onUpdate(why: Array<UIUtil.TRIGGERED>) {
        if (this.dayUpdate && why.indexOf(UIUtil.TRIGGERED.TIME_UPDATE) != -1) {
            HTMLMap.topBarText.innerHTML = TimeFormatUtil.asLongDayMonthText(this.storeDay);
            this.dayUpdate = false;
        }
    }
    */
}

export = SlideTabUI;