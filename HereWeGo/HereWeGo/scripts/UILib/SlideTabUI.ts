/**
 * A sliding tab system for the bottom content UI
 * takes a buncha HTML strings created from individual UIItems, horizontally flatmaps them,
 * and then displays them in android-style moving tab thingys
 * IDK how I'm going to handle touch and stuff yet
 * LOL NVM FUCK TOUCH LIBRARY HERE WE COME
 */

import UIItem = require('./UIItem');
import HTMLMap = require('../HTMLMap');

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
    getHTML(): string {
        let tempstr: string = '';
        for (let i = 0, len = this.pages.length; i < len; i++) {
            tempstr += this.templateEngine(this.wrapperTemplate, { stuff: this.pages[i].getHTML() });
        }
        return tempstr;
    }
    //and start up lory
    static startSliderUI() {
        let thing = document.querySelector('body')
        lory(thing, {
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