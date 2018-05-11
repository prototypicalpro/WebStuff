/**
 * A sliding tab system for the bottom content UI
 * takes a buncha HTML strings created from individual UIItems, horizontally flatmaps them,
 * and then displays them in android-style moving tab thingys
 * IDK how I'm going to handle touch and stuff yet
 * LOL NVM FUCK TOUCH. LIBRARY HERE WE COME
 * 
 * onFocus is called when the slide is done sliding on the screen
 */

import UIUtil = require('./UIUtil');
import HTMLMap = require('../HTMLMap');
import lory = require('../lory');
import TextButtonUI = require('./TextButtonUI');
import TimeFormatUtil = require('../TimeFormatUtil');
import IScroll = require('../iscroll-lite');
import ScrollPageUI = require('./ScrollPageUI');

class SlideTabUI extends UIUtil.UIItem {
    id: string;
    //wrapper template to make everything horizontally flatmapped
    private static readonly slideWrapperTemplate: string = `<div class="js_slide content">{{c}}</div>`;
    //stored pages, to be flatmapped and shiz
    private readonly pages: Array<ScrollPageUI>;
    //stored names for buttons later on
    private readonly names: Array<string>;
    //stored date
    private dayUpdate: boolean;
    //storeage lory object
    private storly: any;
    //fill them varlibles
    constructor(pages: Array<ScrollPageUI>, names: Array<string>) {
        super();
        this.pages = pages;
        this.names = names;
        this.recvParams = UIUtil.combineParams(pages);
    }
    //and the getHTML
    onInit(data: Array<any>): void {
        //get all the htmls in parellel
        //this chaining is gonna be beutiful
        //for every array of pages
        HTMLMap.setSliderHTML(this.pages.map(page => UIUtil.templateEngine(SlideTabUI.slideWrapperTemplate, {c : page.onInit(data)})).join('')); //one. freaking. line
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
            //disable rewinding on resizing
            rewindOnResize: false,
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
                element: document.querySelector('#mainBar'),
                axis: 'x',
                speedRatio: 1,
                maxSlide: 1
            }]
        });
        //then fire up the menu and menu buttons
        let htmlStr = '';
        //create a bunch of button objects, bind thier callbacks, then destroy them b/c they don't need updating
        let buttonRay = this.names.map((name, index) => {
            let button = new TextButtonUI('menu', 'menuText', name, (() => this.storly.slideTo(index)).bind(this), null, null, true);
            htmlStr += button.onInit();
            return button;
        });
        //set the menu html
        HTMLMap.menuBar.innerHTML = htmlStr;
        //run all that menu javascript
        for (let i = 0, len = buttonRay.length; i < len; i++) buttonRay[i].buildJS();
        //set the top grey bar date correctly
        document.querySelector("#mainBText").innerHTML = TimeFormatUtil.asLongDayMonthText(new Date());
        this.dayUpdate = false;
        //run the pages js
        for (let i = 0, len = this.pages.length; i < len; i++) this.pages[i].buildJS();
        //bind the onSlideChanged function
        thing.addEventListener('after.lory.slide', this.onSlideChanged.bind(this), { passive : true });
    }

    //call the onFocus of the children if thier slide has been slidden to
    private onSlideChanged(evt: CustomEvent): void {
        let currentSlide: number = evt.detail.currentSlide;
        if(currentSlide !== 0 && this.pages[currentSlide - 1].onFocus) this.pages[currentSlide - 1].onFocus();
    }

    //onUpdate calls the update function of all the children
    onUpdate(data: Array<any>): void {
        for(let i = 0, len = this.pages.length; i < len; i++) if(this.pages[i].onUpdate) if(this.pages[i].onUpdate) this.pages[i].onUpdate(data);
    }

    onTimeChanged(): void {
        for(let i = 0, len = this.pages.length; i < len; i++) if(this.pages[i].onUpdate) if(this.pages[i].onTimeChanged) this.pages[i].onTimeChanged();
    }
}

export = SlideTabUI;