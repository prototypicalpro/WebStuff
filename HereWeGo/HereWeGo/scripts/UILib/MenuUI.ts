/**
 * UI Item to handle the side menu
 * Uses my UI framework
 * For better or worse
 */

import UIUtil = require('./UIUtil');
import HTMLMap = require('../HTMLMap');
import lory = require('../lory');

class MenuUI extends UIUtil.UIItem {
    //main HTML for sidemenu
    private readonly templateStr: string = `
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
    //stored array of top and bottom UIItems
    private readonly topItems: Array<UIUtil.UIItem>;
    private readonly botItems: Array<UIUtil.UIItem>;
    //storage lory item
    private storly: any;
    //fill vars
    constructor(topItems: Array<UIUtil.UIItem>, botItems: Array<UIUtil.UIItem>) {
        super();
        this.topItems = topItems;
        this.botItems = botItems;
        //build recv parameter list
        this.recvParams = UIUtil.combineParams(topItems).concat(UIUtil.combineParams(botItems));
    }
    //get them htmls by mega joining
    onInit(data: Array<any>): void {
        //join top arrays HTML
        let topStr = this.topItems.map((item) => { return item.onInit(data); }).join('');
        //join bottom
        let botStr = this.botItems.map((item) => { return item.onInit(data); }).join('');
        //template and set
        HTMLMap.setSideMenuHTML(UIUtil.templateEngine(this.templateStr, {
            id: this.id,
            topItems: topStr,
            botItems: botStr,
        }));
    }
    //init all that js
    buildJS() {
        this.storly = lory.lory(HTMLMap.sideMenu, {
            //different naming scheme
            classNameFrame: 'SMFrame',
            classNameSlideContainer: 'SMCont',
            //snappier scrolling
            slideSpeed: 300,
            snapBackSpeed: 200,
            ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
            //disable overflow scrolling
            overflowScroll: false,
            //set default index to when menu is hidden
            defaultIndex: 1,
            //and no touchy when it's hidden as well
            noTouchIndex: 1,
            //finally, black fade thingy
            indicators: [{
                element: document.querySelector('.SMShadow'),
                speedRatio: 0.002,
                style: 'opacity',
                reverse: true,
            }],
        });

        //menu button check
        HTMLMap.sideButton.addEventListener('touchstart', (event) => {
            this.openMenu();
        });

        //tap outside of menu to close check
        document.querySelector('#' + this.id).addEventListener('touchend', (event) => {
            //MUST CHANGE TO REFLECT MENU SIZE
            if (event.changedTouches[0].clientX > 0.7 * screen.width) {
                event.preventDefault();
                this.closeMenu();
            }
        });

        //run the js of all our little dudes
        this.topItems.concat(this.botItems).map((item) => item.buildJS());
    }

    private backButtonHandle(event) {
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

export = MenuUI;