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
    private readonly wrapperTemplate: string = `<div class="wrap">{{stuff}}</div>` 
    //stored temporary string of HTML;
    private tempString: string = "";
    //IScroll object to store
    private scroll: IScroll;
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
    //and start up iscroll
    startSliderUI() {
        this.scroll = new IScroll('#wrapper', {
            scrollX: true,
            scrollY: false,
            snap: true,
            scrollbars: false,
            indicators: {
                el: '#menuWrap',
                listenY: false,
                shrink: 'clip'
            }
        } as any);
        this.scroll.scrollTo(10, 0);
    }
}

export = SlideTabUI;