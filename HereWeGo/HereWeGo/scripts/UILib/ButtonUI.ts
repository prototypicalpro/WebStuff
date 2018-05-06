/**
 * Simple UI Item to implement a clickable button
 * Handles all the javascript to detect if a touch is on/off your button
 * and has short and long press actions
 * includes some fancy animations as well
 * 
 * extending class MUST create an element selectable by '#(this.id)' where (this.id) is the id
 * of the object
 * ButtonUI will create a button around that element
 */

import UIUtil = require('./UIUtil');

abstract class ButtonUI extends UIUtil.UIItem {
    //perminant class members for animations
    private static readonly touchClass: string = 'bTouch';
    private static readonly longPressTime: number = 500;
    //storage stuff
    private readonly disableAnim: boolean;
    private readonly callback: () => void; //TODO: make protected
    private readonly longPress: () => void;
    //storage document element for the button
    private buttonStore: HTMLElement;
    //storage bounding rect
    private rectStore: ClientRect;
    //storage touch id
    private touchStore: number; 
    private touchStart: number;
    //make that thing
    constructor(callback: () => void, longPressCallback?: () => void, disableAnim?: boolean) {
        super();
        this.callback = callback;
        this.longPress = longPressCallback;
        this.disableAnim = disableAnim;
        
    }

    //handle all the selector stuff to make button work
    buildJS() {
        //add members
        this.buttonStore = document.querySelector('#' + this.id) as HTMLElement;
        //register callbacks
        const opts = { passive: true }; 
        this.buttonStore.addEventListener('touchstart', this.onTouchStart.bind(this), opts);
        this.buttonStore.addEventListener('touchmove', this.onTouchMove.bind(this), opts);
        this.buttonStore.addEventListener('touchend', this.onTouchEnd.bind(this), opts);
        this.buttonStore.addEventListener('touchcancel', this.onTouchCancel.bind(this), opts);
    }

    //callback functions for button, handles all touch events then passes through as necessary
    private onTouchStart(e: TouchEvent) {
        //we got a touch!
        //start the touch and hold animation for the button, but only if it's the first touch
        if (typeof this.touchStore !== 'number' && typeof e.changedTouches.item(0).identifier === 'number') {
            //e.preventDefault();
            //store the client rect of the button
            this.rectStore = this.buttonStore.getBoundingClientRect();
            //store the touch
            this.touchStore = e.changedTouches.item(0).identifier;
            this.touchStart = Date.now();
            if (!this.disableAnim) this.buttonStore.classList.add(ButtonUI.touchClass);
        }
    }

    private onTouchMove(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //steal it
        //e.preventDefault();
        //check to make sure the pointer is still within the button
        if (ourTouch.clientX < this.rectStore.left || ourTouch.clientX > this.rectStore.left + this.rectStore.width ||
            ourTouch.clientY < this.rectStore.top || ourTouch.clientY > this.rectStore.top + this.rectStore.height) {
            this.touchStore = null;
            if (!this.disableAnim) this.buttonStore.classList.remove(ButtonUI.touchClass);
        }
    }

    //finally, if the touch ends, click the button!
    private onTouchEnd(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //mine
        //e.preventDefault();
        //click button!
        if (!this.disableAnim) this.buttonStore.classList.remove(ButtonUI.touchClass);
        //clear touch cache
        this.touchStore = null;
        //run code!
        if (this.longPress && Date.now() - this.touchStart > ButtonUI.longPressTime) this.longPress();
        else this.callback();
    }

    //and if touch cancelled, reset and catch fire
    private onTouchCancel(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //mine
        //e.preventDefault();
        //clear cache and classes
        if (!this.disableAnim) this.buttonStore.classList.remove(ButtonUI.touchClass);
        this.touchStore = null;
    }

    //utility touch search function
    private findTouch(touches: TouchList): Touch | false {
        //find our touch
        if(typeof this.touchStore !== 'number') return false;
        for (let i = 0, len = touches.length; i < len; i++) if (touches.item(i).identifier === this.touchStore) return touches.item(i);
        return false;
    }
}

export = ButtonUI;