/**
 * A sliding tab system for the bottom content UI
 * takes a buncha HTML strings created from individual UIItems, horizontally flatmaps them,
 * and then displays them in android-style moving tab thingys
 * IDK how I'm going to handle touch and stuff yet
 * LOL NVM FUCK TOUCH LIBRARY HERE WE COME
 */

import UIItem = require('./UIItem');
import HTMLMap = require('../HTMLMap');

class SlideTabUI extends UIItem{
    //wrapper template to make everything horizontally flatmapped
    private readonly wrapperTemplate: string = `<div class="js_slide">{{stuff}}</div>` 
    //stored temporary string of HTML;
    private tempString: string = "";
    //function to add an element to be flatmapped
    pushBackItem(item: string): void {
        this.tempString += this.templateEngine(this.wrapperTemplate, { stuff: item });
    }
    //and the getHTML
    getHTML(): string {
        let temp = this.tempString;
        this.tempString = "";
        return temp;
    }
    //and start up lory
    startSliderUI() {
        let thing = document.querySelector('.selectMe')
        lory(thing, {
            slideSpeed: 300,
            snapBackSpeed: 200,
            ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',

            indicators: [{
                element: document.querySelector('#menuLine'),
                axis: 'x',
                speedRatio: -0.25
            },
            {
                element: document.querySelector('#textWrap'),
                axis: 'y',
                speedRatio: -0.3
            }]
        });
    }
}

export = SlideTabUI;