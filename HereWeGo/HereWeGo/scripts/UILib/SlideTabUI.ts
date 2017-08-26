/**
 * A sliding tab system for the bottom content UI
 * takes a buncha HTML strings created from individual UIItems, horizontally flatmaps them,
 * and then displays them in android-style moving tab thingys
 * IDK how I'm going to handle touch and stuff yet
 * LOL NVM FUCK TOUCH LIBRARY HERE WE COME
 */

import UIItem = require('./UIItem');
import HTMLMap = require('../HTMLMap');
import lory = require('../lory');

class SlideTabUI extends UIItem {
    //wrapper template to make everything horizontally flatmapped
    private readonly wrapperTemplate: string = `<div class="js_slide content">{{stuff}}</div>`;
    //stored pages, to be flatmapped and shiz
    private readonly pages: Array<UIItem>;
    //fill them varlibles
    constructor(pages: Array<UIItem>) {
        super();
        this.pages = pages;
    }
    //and the getHTML
    getHTML(): Promise<string> {
        //get all the htmls in parellel
        return Promise.all(this.pages.map((page) => { return page.getHTML(); })).then((strings: Array<string>) => {
            //wrap each item,  join them all, and return the string
            return strings.map((string) => { return this.templateEngine(this.wrapperTemplate, { stuff: string }); }).join('');
        })
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
            //fancy indicators
            indicators: [{
                element: document.querySelector('#menuLine'),
                axis: 'x',
                speedRatio: -0.25, //TODO: Dynamically scale bottom menu and calculate at runtime
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