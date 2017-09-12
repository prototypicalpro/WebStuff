/**
 * Time handler
 * not really necessary
 */

import UIUtil = require('./UILib/UIUtil');

class DayHandler implements UIUtil.DayHandle {
    storeDay: Date;
    
    constructor(useThis?: Date){
        if(useThis) this.storeDay = useThis;
    }
    
    getDay(objs: Array<UIUtil.DayParams>): Promise<any> | any {
        let day = this.storeDay;
        if (!day) day = new Date();
        for (let i = 0, len = objs.length; i < len; i++) objs[i].storeDay(day);
    }
}

export = DayHandler;