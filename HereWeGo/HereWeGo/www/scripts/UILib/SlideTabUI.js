define(["require", "exports", "./UIUtil", "../HTMLMap", "../lory", "./ButtonUI", "../TimeFormatUtil"], function (require, exports, UIUtil, HTMLMap, lory, ButtonUI, TimeFormatUtil) {
    "use strict";
    class SlideTabUI extends UIUtil.UIItem {
        constructor(pages, names) {
            super();
            this.wrapperTemplate = `<div class="js_slide content">{{stuff}}</div>`;
            this.pages = pages;
            this.names = names;
            this.recvParams = UIUtil.combineParams([].concat.apply([], pages));
        }
        onInit(data) {
            HTMLMap.setSliderHTML(this.pages.map((items) => { return UIUtil.templateEngine(this.wrapperTemplate, { stuff: items.map((item) => { return item.onInit(data); }).join('') }); }).join(''));
        }
        buildJS() {
            let thing = document.querySelector('body');
            this.storly = lory.lory(thing, {
                classNameSlide: 'js_slide',
                searchDepth: 1,
                slideSpeed: 300,
                snapBackSpeed: 200,
                ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
                overflowScroll: false,
                indicators: [{
                        element: document.querySelector('#menuLine'),
                        axis: 'x',
                        speedRatio: -(1 / this.names.length),
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
            let htmlStr = '';
            let buttonRay = this.names.map((name, index) => {
                let button = new ButtonUI('menu', 'menuText', name, (() => this.storly.slideTo(index)).bind(this), null, null, true);
                htmlStr += button.onInit();
                return button;
            });
            HTMLMap.menuBar.innerHTML = htmlStr;
            for (let i = 0, len = buttonRay.length; i < len; i++)
                buttonRay[i].buildJS();
            HTMLMap.topBarText.innerHTML = TimeFormatUtil.asLongDayMonthText(new Date());
            this.dayUpdate = false;
            for (let i = 0, len = this.pages.length; i < len; i++)
                for (let o = 0, len1 = this.pages[i].length; o < len1; o++)
                    this.pages[i][o].buildJS();
        }
    }
    return SlideTabUI;
});
//# sourceMappingURL=SlideTabUI.js.map