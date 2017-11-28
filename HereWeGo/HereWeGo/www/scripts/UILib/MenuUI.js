define(["require", "exports", "./UIUtil", "../HTMLMap", "../lory"], function (require, exports, UIUtil, HTMLMap, lory) {
    "use strict";
    class MenuUI extends UIUtil.UIItem {
        constructor(topItems, botItems) {
            super();
            this.templateStr = `
    <div class="SMFrame" id="{{id}}">
            <!-- div for shadow effect -->
            <div class="SMShadow"></div>
            <div class="SMCont">
                <!-- Actual Content -->
                <div class="SMSlide" id="sideMenu">
                    <div class="SMHead">
                        <p class="SMTopText">Wilson High School</p>
                    </div>
                    <div class="SMItems">
                        {{topItems}}
                    </div>
                    <div class="SMItems SMBot">
                        {{botItems}}
                    </div>
                </div>
                <!-- Blank Slide -->
                <div class="SMSlide blank"></div>
            </div>
        </div>
    </div>`;
            this.topItems = topItems;
            this.botItems = botItems;
            this.recvParams = UIUtil.combineParams(topItems).concat(UIUtil.combineParams(botItems));
        }
        onInit(data) {
            let topStr = this.topItems.map((item) => { return item.onInit(data); }).join('');
            let botStr = this.botItems.map((item) => { return item.onInit(data); }).join('');
            HTMLMap.setSideMenuHTML(UIUtil.templateEngine(this.templateStr, {
                id: this.id,
                topItems: topStr,
                botItems: botStr,
            }));
        }
        buildJS() {
            this.storly = lory.lory(HTMLMap.sideMenu, {
                classNameFrame: 'SMFrame',
                classNameSlideContainer: 'SMCont',
                slideSpeed: 300,
                snapBackSpeed: 200,
                ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
                overflowScroll: false,
                defaultIndex: 1,
                noTouchIndex: 1,
                indicators: [{
                        element: document.querySelector('.SMShadow'),
                        speedRatio: 0.002,
                        style: 'opacity',
                        reverse: true,
                    }],
            });
            HTMLMap.sideButton.addEventListener('touchstart', (event) => {
                this.openMenu();
            });
            document.querySelector('#' + this.id).addEventListener('touchend', (event) => {
                if (event.changedTouches[0].clientX > 0.7 * screen.width) {
                    event.preventDefault();
                    this.closeMenu();
                }
            });
            this.topItems.concat(this.botItems).map((item) => item.buildJS());
        }
        backButtonHandle(event) {
            event.preventDefault();
            this.closeMenu();
        }
        openMenu() {
            this.storly.slideTo(0);
            document.addEventListener('backbutton', this.backButtonHandle.bind(this));
        }
        closeMenu() {
            this.storly.slideTo(1);
            document.removeEventListener('backbutton', this.backButtonHandle.bind(this));
        }
    }
    return MenuUI;
});
//# sourceMappingURL=MenuUI.js.map