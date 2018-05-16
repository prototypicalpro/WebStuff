import UIUtil = require('./UIUtil');
import HTMLMap = require('../HTMLMap');
import lory = require('../lory');

/**
 * Side Menu (Slidey bit from the left). 
 * 
 * Automatically creates HTML and fills {@link HTMLMap.sideMenu} in {@link MenuUI.onInit}.
 * Contains two sets of children UIItems: Top, placed just below the header image of the menu,
 * and bottom, placed at the bottom of the menu. Binds the {@link MenuUI.openMenu} function to
 * touchstart of the element found in {@link HTMLMap.menuButton}, and when the menu is open uses a div
 * to darken the screen and look for touch events outside the menu to close it again. Sliding is handled
 * using lory: menu starts on slide 1 (menu hidden), and all touch events are ignored until menu
 * is opened (move to slide 0). Afterwards the used can touch anywhere on the screen to slide the menu until the slide is
 * set back to 1 (or menu is closed). Lory starts bounded to {@link HTMLMap.sideMenu}.
 * Note: {@link UIUtil.UIItem.onFocus} for children is called when menu finishes sliding into view.
 */
class MenuUI extends UIUtil.UIItem {
    /**
     * SideMenu HTML template (does not include menu button, which is in {@link HTMLMap.menuButton})
     * .SMFrame is used as the frame for lory, .SMCont the slide container, .SMSlide a generic
     * slide, and #sideMenu the actual sidemenu. .SMHead contains the header image at the top of the menu.
     * Top children items are placed in .SMItems, and bottom children are placed in .SMItems SMBot.
     * .SMShadow covers the entire screen and is used for the shadow effect. 
     * @param id ID: the div ID from {@link UIUtil.UIItem.id}
     * @param topItems topItems: the HTML strings for {@link MenuUI.topItems}
     * @param botItems botItems: the HTML string for {@link MenuUI.botItems}
     */
    private static readonly templateStr: string = `
    <div class="SMFrame" id="{{id}}">
            <div class="SMShadow"></div> 
            <div class="SMCont">
                <div class="SMSlide" id="sideMenu">
                    <div class="SMHead"><p class="SMTopText">Wilson High School</p></div>
                    <div class="SMItems">{{topItems}}</div>
                    <div class="SMItems SMBot">{{botItems}}</div>
                </div>
                <div class="SMSlide blank"></div>
            </div>
        </div>
    </div>`;
    /** Document selectors are slow, so specify the width of the menu as a fraction of clientX */
    private static readonly widthFrac: number = 0.7;
    //stored array of top and bottom UIItems
    private readonly topItems: Array<UIUtil.UIItem>;
    private readonly botItems: Array<UIUtil.UIItem>;
    //storage lory item
    private storly: any;
    //fill vars
    /**
     * @param topItems Items to display at the top of the menu
     * @param botItems Items to display at the bottom of the menu
     */
    constructor(topItems: Array<UIUtil.UIItem>, botItems: Array<UIUtil.UIItem>) {
        super();
        this.topItems = topItems;
        this.botItems = botItems;
        //build recv parameter list
        this.recvParams = UIUtil.combineParams(topItems).concat(UIUtil.combineParams(botItems));
    }
    /**
     * Pass data to children, join together our template, and stuff it into {@link HTMLMap.sideMenu}
     * @param data The {@link DataManage} generated data
     */
    onInit(data: Array<any>): void {
        //join top arrays HTML
        let topStr = this.topItems.map(item => item.onInit(data)).join('');
        //join bottom
        let botStr = this.botItems.map(item => item.onInit(data)).join('');
        //template and set
        HTMLMap.sideMenu.innerHTML = UIUtil.templateEngine(MenuUI.templateStr, {
            id: this.id,
            topItems: topStr,
            botItems: botStr,
        });
    }
    /**
     * Initialize {@link lory} slider, menu button, and all the children UIItems 
     */
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
        HTMLMap.menuButton.addEventListener('touchstart', () => this.openMenu());
        //tap outside of menu to close check
        document.querySelector('#' + this.id).addEventListener('touchend', event => {
            //MUST CHANGE TO REFLECT MENU SIZE
            if (event.changedTouches[0].clientX > MenuUI.widthFrac * screen.width) {
                event.preventDefault();
                this.closeMenu();
            }
        });
        //onFocus check
        HTMLMap.sideMenu.addEventListener('after.lory.slide', this.onSlideChanged.bind(this), { passive : true });
        //run the js of all our little dudes
        let ray: Array<UIUtil.UIItem> = this.botItems.concat(this.topItems);
        for(let i = 0, len = ray.length; i < len; i++) ray[i].buildJS();
    }
    onUpdate(data: Array<any>): void {
        let ray: Array<UIUtil.UIItem> = this.botItems.concat(this.topItems);
        for(let i = 0, len = ray.length; i < len; i++) if(ray[i].onUpdate) ray[i].onUpdate(data);
    }
    onTimeChanged(): void {
        let ray: Array<UIUtil.UIItem> = this.botItems.concat(this.topItems);
        for(let i = 0, len = ray.length; i < len; i++) if(ray[i].onTimeChanged) ray[i].onTimeChanged(); 
    }
    /** Handle back button without closing app (cancel default action) */
    private backButtonHandle = (event => {
        event.preventDefault();
        this.closeMenu();
    }).bind(this);
    /** Open menu */
    openMenu() {
        this.storly.slideTo(0);
        document.addEventListener('backbutton', this.backButtonHandle);
    }
    /** Close menu */
    closeMenu() {
        this.storly.slideTo(1);
        document.removeEventListener('backbutton', this.backButtonHandle);
    }
    /**
     * Handle 'after.lory.slide' event and call {@link UIUtil.UIItem.onFocus} of children if menu is in focus
     */
    private onSlideChanged(evt: CustomEvent): void {
        if(evt.detail.currentSlide === 0) {
            for(let i = 0, len = this.topItems.length; i < len; i++) if(this.topItems[i].onFocus) this.topItems[i].onFocus();
            for(let i = 0, len = this.botItems.length; i < len; i++) if(this.botItems[i].onFocus) this.botItems[i].onFocus();
        }
    }
}

export = MenuUI;