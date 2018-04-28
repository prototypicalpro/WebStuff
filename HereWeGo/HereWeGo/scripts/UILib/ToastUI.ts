/**
 * Simple JS thing to display a hacked HTML toast message
 * I'm lazy I guess?
 */

import UIUtil = require('./UIUtil');

class ToastUI {
    //toast text template
    private static readonly template = `<p class="tText">{{msg}}</p>`;
    //show toast class
    private static readonly toastShowClass = 'tShown';
    //toast transition duration in ms
    private static readonly toastAnimDuration = 300;
    //toast show duration in ms
    private static readonly toastShowDuration = 3000;
    //element to toast in
    private readonly toastBox: HTMLElement;
    //toast queue so we don't multi-toast
    private toastQueue: Array<string> = [];
    //state machine!
    private toastState: number = 0;
    //constructors are dumb!
    constructor(toastBox: HTMLElement) {
        this.toastBox = toastBox;
    }
    //function to display toast
    showToast(msg: string) {
        this.toastQueue.push(msg);
        if (this.toastQueue.length === 1) this.updateToast();
    }

    //callback function to update toast, called from setTimeout
    private updateToast() {
        const enum TOAST_STATE {
            TOAST_HIDDEN = 0,
            TOAST_SHOW_TRANSITION,
            TOAST_SHOWN,
            TOAST_HIDE_TRANSITION,
        };
        switch (this.toastState) {
            case TOAST_STATE.TOAST_HIDDEN:
                //fill the toast
                this.toastBox.innerHTML = UIUtil.templateEngine(ToastUI.template, { msg: this.toastQueue[0] });
                //show the toast
                this.toastBox.classList.add(ToastUI.toastShowClass);
                //update state
                this.toastState = TOAST_STATE.TOAST_SHOW_TRANSITION;
                //call this function again when the animation finishes
                setTimeout(this.updateToast.bind(this), ToastUI.toastAnimDuration);
                break;
            case TOAST_STATE.TOAST_SHOW_TRANSITION:
                //update state
                this.toastState = TOAST_STATE.TOAST_SHOWN;
                //wait for toast to be read
                setTimeout(this.updateToast.bind(this), ToastUI.toastShowDuration);
                break;
            case TOAST_STATE.TOAST_SHOWN:
                //start the hiding animation
                this.toastBox.classList.remove(ToastUI.toastShowClass);
                //update state
                this.toastState = TOAST_STATE.TOAST_HIDE_TRANSITION;
                //call this function when it finishes
                setTimeout(this.updateToast.bind(this), ToastUI.toastAnimDuration);
                break;
            case TOAST_STATE.TOAST_HIDE_TRANSITION:
                //remove toast from queue
                this.toastQueue.shift();
                //update state
                this.toastState = TOAST_STATE.TOAST_HIDDEN;
                //if there's more toasts, call this function again
                if (this.toastQueue.length) this.updateToast();
                break;
        }
    }
}

export = ToastUI;