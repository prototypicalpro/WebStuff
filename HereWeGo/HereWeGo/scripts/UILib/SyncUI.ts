/**
 * Class to manage synchronization of UI elements during use
 * This is the thing that does the callbacks fo every item
 * In a class to simplify the main file
 */

import UIUtil = require('./UIUtil');

class SyncUI {
    //stored array of UIItems
    items: Array<UIUtil.UIItem>;
    //constructor
    constructor(items: Array<UIUtil.UIItem>) {
        //get all the children, then flatmap that array, then filter it for the ones that care about callbacks
        //bwahaha I have ultrawide so I don't care about how long my lines are
        this.items = [].concat.apply([], items.map((item) => { return item.getChildren(); })).filter((item: UIUtil.UIItem) => { return item.enableCallbacks; });
    }
    //aand the callback triggers to be used in the main loop
    triggerInit() {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].onInit) this.items[i].onInit();
        }
    }
    //pretty self explanitory
    triggerRefresh() {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].onRefresh) this.items[i].onRefresh();
        }
    }
    //this one also triggers refresh (wow)
    triggerUserRefresh() {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].onRefresh) this.items[i].onRefresh();
            if (this.items[i].onUserRefresh) this.items[i].onUserRefresh();
        }
    }
}

export = SyncUI;