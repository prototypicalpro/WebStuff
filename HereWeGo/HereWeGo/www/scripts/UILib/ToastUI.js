define(["require", "exports", "./UIUtil"], function (require, exports, UIUtil) {
    "use strict";
    class ToastUI {
        constructor(toastBox) {
            this.template = `<p class="tText">{{msg}}</p>`;
            this.toastShowClass = 'tShown';
            this.toastAnimDuration = 300;
            this.toastShowDuration = 3000;
            this.toastQueue = [];
            this.toastState = 0;
            this.toastBox = toastBox;
        }
        showToast(msg) {
            this.toastQueue.push(msg);
            if (this.toastQueue.length === 1)
                this.updateToast();
        }
        updateToast() {
            ;
            switch (this.toastState) {
                case 0:
                    this.toastBox.innerHTML = UIUtil.templateEngine(this.template, { msg: this.toastQueue[0] });
                    this.toastBox.classList.add(this.toastShowClass);
                    this.toastState = 1;
                    setTimeout(this.updateToast.bind(this), this.toastAnimDuration);
                    break;
                case 1:
                    this.toastState = 2;
                    setTimeout(this.updateToast.bind(this), this.toastShowDuration);
                    break;
                case 2:
                    this.toastBox.classList.remove(this.toastShowClass);
                    this.toastState = 3;
                    setTimeout(this.updateToast.bind(this), this.toastAnimDuration);
                    break;
                case 3:
                    this.toastQueue.shift();
                    this.toastState = 0;
                    if (this.toastQueue.length)
                        this.updateToast();
                    break;
            }
        }
    }
    return ToastUI;
});
//# sourceMappingURL=ToastUI.js.map