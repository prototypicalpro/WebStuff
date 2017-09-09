/**
 * Time handler
 * not really necessary
 */

import UIArgs = require('./UIArgs');

class DayHandler implements UIArgs.DayHandle {
    storeDay: Date;
    
    constructor(useThis?: Date){
        if(useThis) this.storeDay = useThis;
    }
    
    injectDay(objs: Array<UIArgs.DayRecv>): Promise<any>{
        return new Promise(() => {
            let day = this.storeDay;
            if(!day) day = new Date();
            for(let i = 0, len = objs.length; i < len; i++) objs[i].time = day;
        });
    }
}

export = DayHandler;