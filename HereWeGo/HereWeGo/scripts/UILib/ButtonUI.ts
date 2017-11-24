/**
 * Simple UI Item to implement a clickable button
 * accepts classes in getHTML, meaning the css is meant to change
 * hopefully will include some fancy animations as well
 */

import UIUtil = require('./UIUtil');

class ButtonUI extends UIUtil.UIItem {
    //main html! pretty simple, just a lot of varibles
    private readonly strTemplate: string = `
    <div class="{{wrapClass}}" id="{{id}}" style="{{image}}">
        <p class="{{textClass}}">{{text}}</p>
    </div>`
    private readonly imgTemplate: string = `background-image: url('./images/{{image}}')`;
    //perminant class members for animations
    private readonly touchClass: string = 'bTouch';
    private readonly longPressTime: number = 500;
    //storage stuff
    private readonly disableAnim: boolean;
    private readonly callback: () => void; //TODO: make protected
    private readonly longPress: () => void;
    //storage string (we'll just go straight to a string since nothing we get needs data)
    private readonly strStore: string;
    //storage document element for the button
    private buttonStore: HTMLElement;
    //storage bounding rect
    private rectStore: ClientRect;
    //storage touch id
    private touchStore: number; 
    private touchStart: number;
    //make that thing
    constructor(wrapClass: string, textClass: string, text: string, callback: () => void, icon?: string, longPressCallback?: () => void, disableAnim?: boolean) {
        super();
        this.callback = callback;
        this.longPress = longPressCallback;
        this.disableAnim = disableAnim;
        this.strStore = super.template(this.strTemplate, {
            id: this.id,
            wrapClass: wrapClass,
            textClass: textClass,
            text: text,
            image: icon ? super.template(this.imgTemplate, { image: icon }) : '',
        });
    }

    //make a whole buncha that thing
    static Factory(wrapClass: string, textClass: string, params: Array<UIUtil.ButtonParam>, disableAnim?: boolean): Array<ButtonUI> {
        return params.map((param) => { return new ButtonUI(wrapClass, textClass, param.text, param.callback, param.icon, param.longPressCallback, disableAnim); });
    }


    //init dat HTML
    onInit(): string {
        return this.strStore;
    }

    //init dat javascript
    buildJS() {
        //add members
        this.buttonStore = document.querySelector('#' + this.id) as HTMLElement;
        //register callbacks
        this.buttonStore.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.buttonStore.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.buttonStore.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.buttonStore.addEventListener('touchcancel', this.onTouchCancel.bind(this));
    }

    //callback functions for button, handles all touch events then passes through as necessary
    private onTouchStart(e: TouchEvent) {
        //we got a touch!
        //start the touch and hold animation for the button, but only if it's the first touch
        if (!this.touchStore) {
            e.preventDefault();
            //store the client rect of the button
            this.rectStore = this.buttonStore.getBoundingClientRect();
            //store the touch
            this.touchStore = e.changedTouches.item(0).identifier;
            this.touchStart = Date.now();
            if (!this.disableAnim) this.buttonStore.classList.add(this.touchClass);
        }
    }

    private onTouchMove(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //steal it
        e.preventDefault();
        //check to make sure the pointer is still within the button
        if (ourTouch.clientX < this.rectStore.left || ourTouch.clientX > this.rectStore.left + this.rectStore.width ||
            ourTouch.clientY < this.rectStore.top || ourTouch.clientY > this.rectStore.top + this.rectStore.height) {
            this.touchStore = null;
            if (!this.disableAnim) this.buttonStore.classList.remove(this.touchClass);
        }
    }

    //finally, if the touch ends, click the button!
    private onTouchEnd(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //mine
        e.preventDefault();
        //click button!
        if (!this.disableAnim) this.buttonStore.classList.remove(this.touchClass);
        //clear touch cache
        this.touchStore = null;
        //run code!
        if (this.longPress && Date.now() - this.touchStart > this.longPressTime) this.longPress();
        else this.callback();
    }

    //and if touch cancelled, reset and catch fire
    private onTouchCancel(e: TouchEvent) {
        //find our touch
        let ourTouch = this.findTouch(e.changedTouches);
        if (!ourTouch) return;
        //mine
        e.preventDefault();
        //clear cache and classes
        if (!this.disableAnim) this.buttonStore.classList.remove(this.touchClass);
        this.touchStore = null;
    }

    //utility touch search function
    private findTouch(touches: TouchList): Touch | null {
        //find our touch
        let ourTouch: Touch;
        for (let i = 0, len = touches.length; i < len; i++) if (touches.item(i).identifier == this.touchStore) ourTouch = touches.item(i);
        return ourTouch;
    }
}

export = ButtonUI;