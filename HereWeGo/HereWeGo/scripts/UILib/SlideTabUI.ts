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

class SlideTabUI implements UIUtil.UIItem {
    //wrapper template to make everything horizontally flatmapped
    private readonly wrapperTemplate: string = `<div class="js_slide content">{{stuff}}</div>`;
    //stored pages, to be flatmapped and shiz
    private readonly pages: Array<Array<UIUtil.UIItem>>;
    //fill them varlibles
    constructor(pages: Array<Array<UIUtil.UIItem>>) {
        this.pages = pages;
    }
    //get children method
    //flatmap pages then return
    getChildren() {
        return UIUtil.findChildren([].concat.apply([], this.pages));
    }
    //and the getHTML
    getHTML(): Promise<string> {
        //get all the htmls in parellel
        //this chaining is gonna be beutiful
        //for every array of pages
        return Promise.all(this.pages.map((page) => {
            //get the html from that array, and join it into a single string
            return Promise.all(page.map((item) => { return item.getHTML(); })).then((htmls: Array<string>) => { return htmls.join(''); });
            //for every page string
        })).then((pages: Array<string>) => {
            //wrap each item,  join them all, and return the string
            return pages.map((string) => { return UIUtil.templateEngine(this.wrapperTemplate, { stuff: string }); }).join('');
        });
    }
    //and start up lory
    static startSliderUI() {
        let thing = document.querySelector('body')
        lory.lory(thing, {
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
                speedRatio: -0.333, //TODO: Dynamically scale bottom menu and calculate at runtime
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
    }
}

export = SlideTabUI;