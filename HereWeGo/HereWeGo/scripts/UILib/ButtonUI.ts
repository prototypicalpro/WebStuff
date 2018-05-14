import UIUtil = require('./UIUtil');

/**
 * Simple UI Item to implement a clickable button.
 * 
 * Handles all the javascript to detect if a touch is on/off your button
 * and has short and long press actions. Uses touch events, clientX and clientY,
 * and getBoundingClientRect to acomplish this. Only supports single touch.
 * Also includes CSS animations.
 * 
 * Note: Extending class MUST create an element selectable by '#(this.id)' 
 * where (this.id) is the id object given by {@link UIUtil.UIItem.id}.
 * ButtonUI will use this selector to create a button around that element.
 */
abstract class ButtonUI extends UIUtil.UIItem {
    /** CSS class for animations */
    private static readonly touchClass: string = 'bTouch';
    /** Time in milliseconds to consider a press a long press and run the long press action */
    private static readonly longPressTime: number = 500;
    //storage stuff
    private readonly disableAnim: boolean;
    private readonly maxXDelta: number;
    private readonly maxYDelta: number;
    /** Storage document element for the button */
    protected buttonStore: HTMLElement;
    //storage bounding rect
    private rectStore: ClientRect;
    //storage touch id
    private touchStore: number; 
    private touchStart: number;
    private touchX: number;
    private touchY: number;
    /** Press callback, designed to be overriden by the extending class */
    protected abstract callback: () => void;
    /** 
     * Long press callback, designed to be overriden by the extending class.
     * Defaults to {@link ButtonUI.callback} if falsey.
     */
    protected longPress?: () => void;
    /**
     * @param disableAnim Disable the button CSS animation (true disables)
     * @param maxXDelta Maximum X distance the touch can travel in pixels before being discarded
     * @param maxYDelta Maximum Y distance the touch can travel in pixels before being discarded
     */
    constructor(disableAnim?: boolean, maxXDelta?: number, maxYDelta?: number) {
        super();
        this.disableAnim = disableAnim;
        this.maxXDelta = maxXDelta;
        this.maxYDelta = maxYDelta;
    }

    /**
     * Use the ID to get our button element and put it into {@link ButtonUI.buttonStore}, then
     * bind event listeners to touch events.
     */
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

    private onTouchStart(e: TouchEvent) {
        //we got a touch!
        //start the touch and hold animation for the button, but only if it's the first touch
        if (typeof this.touchStore !== 'number' && typeof e.changedTouches.item(0).identifier === 'number') {
            //store the touch
            let touch = e.changedTouches.item(0);
            this.touchStore = touch.identifier;
            this.touchX = touch.clientX;
            this.touchY = touch.clientY;
            this.touchStart = Date.now();
            //e.preventDefault();
            //store the client rect of the button
            this.rectStore = this.buttonStore.getBoundingClientRect();
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
            ourTouch.clientY < this.rectStore.top || ourTouch.clientY > this.rectStore.top + this.rectStore.height ||
            (this.maxXDelta && Math.abs(this.touchX - ourTouch.clientX) > this.maxXDelta) ||
            (this.maxYDelta && Math.abs(this.touchY - ourTouch.clientY) > this.maxYDelta)) {
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

    /**
     * Utility TouchList search function, matches a touch to an identifier stored in {@link ButtonUI.touchStore}.
     * @param touches The TouchList from the touch event
     * @returns The matching touch or false
     */
    private findTouch(touches: TouchList): Touch | false {
        //find our touch
        if(typeof this.touchStore !== 'number') return false;
        for (let i = 0, len = touches.length; i < len; i++) if (touches.item(i).identifier === this.touchStore) return touches.item(i);
        return false;
    }
}

export = ButtonUI;