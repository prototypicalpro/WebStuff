define(["require", "exports", "./UIUtil"], function (require, exports, UIUtil) {
    "use strict";
    class ButtonUI extends UIUtil.UIItem {
        constructor(wrapClass, textClass, text, callback, icon, longPressCallback, disableAnim) {
            super();
            this.strTemplate = `
    <div class="{{wrapClass}}" id="{{id}}" style="{{image}}">
        <p class="{{textClass}}">{{text}}</p>
    </div>`;
            this.imgTemplate = `background-image: url('./images/{{image}}')`;
            this.touchClass = 'bTouch';
            this.longPressTime = 500;
            this.callback = callback;
            this.longPress = longPressCallback;
            this.disableAnim = disableAnim;
            this.strStore = UIUtil.templateEngine(this.strTemplate, {
                id: this.id,
                wrapClass: wrapClass,
                textClass: textClass,
                text: text,
                image: icon ? UIUtil.templateEngine(this.imgTemplate, { image: icon }) : '',
            });
        }
        static Factory(wrapClass, textClass, params, disableAnim) {
            return params.map((param) => { return new ButtonUI(wrapClass, textClass, param.text, param.callback, param.icon, param.longPressCallback, disableAnim); });
        }
        onInit() {
            return this.strStore;
        }
        buildJS() {
            this.buttonStore = document.querySelector('#' + this.id);
            this.buttonStore.addEventListener('touchstart', this.onTouchStart.bind(this));
            this.buttonStore.addEventListener('touchmove', this.onTouchMove.bind(this));
            this.buttonStore.addEventListener('touchend', this.onTouchEnd.bind(this));
            this.buttonStore.addEventListener('touchcancel', this.onTouchCancel.bind(this));
        }
        onTouchStart(e) {
            if (!this.touchStore) {
                e.preventDefault();
                this.rectStore = this.buttonStore.getBoundingClientRect();
                this.touchStore = e.changedTouches.item(0).identifier;
                this.touchStart = Date.now();
                if (!this.disableAnim)
                    this.buttonStore.classList.add(this.touchClass);
            }
        }
        onTouchMove(e) {
            let ourTouch = this.findTouch(e.changedTouches);
            if (!ourTouch)
                return;
            e.preventDefault();
            if (ourTouch.clientX < this.rectStore.left || ourTouch.clientX > this.rectStore.left + this.rectStore.width ||
                ourTouch.clientY < this.rectStore.top || ourTouch.clientY > this.rectStore.top + this.rectStore.height) {
                this.touchStore = null;
                if (!this.disableAnim)
                    this.buttonStore.classList.remove(this.touchClass);
            }
        }
        onTouchEnd(e) {
            let ourTouch = this.findTouch(e.changedTouches);
            if (!ourTouch)
                return;
            e.preventDefault();
            if (!this.disableAnim)
                this.buttonStore.classList.remove(this.touchClass);
            this.touchStore = null;
            if (this.longPress && Date.now() - this.touchStart > this.longPressTime)
                this.longPress();
            else
                this.callback();
        }
        onTouchCancel(e) {
            let ourTouch = this.findTouch(e.changedTouches);
            if (!ourTouch)
                return;
            e.preventDefault();
            if (!this.disableAnim)
                this.buttonStore.classList.remove(this.touchClass);
            this.touchStore = null;
        }
        findTouch(touches) {
            let ourTouch;
            for (let i = 0, len = touches.length; i < len; i++)
                if (touches.item(i).identifier == this.touchStore)
                    ourTouch = touches.item(i);
            return ourTouch;
        }
    }
    return ButtonUI;
});
//# sourceMappingURL=ButtonUI.js.map