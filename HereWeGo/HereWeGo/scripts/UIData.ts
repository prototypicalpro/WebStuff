/**
 * Handling and serving all that data to different parts of the UI
 * is already getting complicated, so I'm going to build an automated
 * dependecy-injector type thing to simplify it
 */

import UIArgs = require('./UIArgs');
import UIUtil = require('./UILib/UIUtil');

class UIData {
    //storage members!
    //the schedule handler
    readonly sched: UIArgs.SchedHandle;
    //the event handler
    readonly events: UIArgs.EventHandle;
    //the useful day handler
    readonly day: UIArgs.DayHandle;
    //the array of recievers
    readonly recvs: Array<UIUtil.UIItem>;
    //constructor!
    constructor(schedHandle: UIArgs.SchedHandle, eventHandle: UIArgs.EventHandle, dayHandle: UIArgs.DayHandle, recievers: Array<UIUtil.UIItem>) {
        this.sched = schedHandle;
        this.events = eventHandle;
        //iterate through each item and it's children and filter out the ones that don't need any callbacks
        this.recvs = (<Array<UIUtil.UIItem>>[].concat.apply([], recievers.map((item) => { return item.getChildren ? item.getChildren() : item; }))).filter((item) => { return item.onInitRecv || item.onScheduleUpdateRecv || item.onTimeUpdateRecv || item.onEventUpdateRecv; })
    }
    
    //initialize the UIItems with all the data they need
    initItems() {
        //TODO: Fix this backend crap
        //may need to rething frontend
        //get all the things ww need to quire
        let params = this.getDataFromRecvArray('onInitRecv');
        //get all the things!
        Promise.all([
            this.sched.getSched(params[UIArgs.RecvType.SCHEDULE], this.events),
            this.events.getEvents(params[UIArgs.RecvType.EVENTS]),
            this.day.getDay(params[UIArgs.RecvType.DAY]),
        ]).then(() => {
            //run all the functions!
            this.recvs.map((recv) => recv.onInit());
        });
    }

    //next, the triggers themselves
    //might as well use the enum
    trigger(why: UIArgs.TRIGGERED) {
        //get all the parameters
        let params = this.getDataFromRecvArray(UIArgs.TRIGGERED[why] + 'Recv');
        //inject all the things!
        Promise.all([
            this.sched.getSched(params[UIArgs.RecvType.SCHEDULE], this.events),
            this.events.getEvents(params[UIArgs.RecvType.EVENTS]),
            this.day.getDay(params[UIArgs.RecvType.DAY]),
        ]).then(() => {
            //run all the functions!
            this.recvs.map((recv) => recv[UIArgs.TRIGGERED[why]]());
        });
    }

    //utility function to de duplicate an array of days stored inside an object
    private deDupeDays(key: string, objs: Array<Object>): Array<number> {
        let days: Array<number> = [];
        for (let i = 0, len = objs.length; i < len; i++) {
            //convert the date(s) into a number so we can compare it
            //if it's an array, do every date
            let dayRay = objs[i][key] as Array<number>;
            if (Array.isArray(dayRay)) {
                //for every item, if the day isn't a duplicate add it
                for (let o = 0, len1 = dayRay.length; o < len1; o++) if(days.indexOf(dayRay[o]) == -1) days.push(dayRay[o]);
            }
            //else if it's a single item, add it if it's not a dupe
            else if(days.indexOf(dayRay[i]) == -1) days.push(dayRay[i]);
        }
        return days;
    }

    //utility function to take an array of recievers and return the schedule and event days it needs
    private getDataFromRecvArray(key: string): Array<Array<any>> {
        let ret = [[], [], []]; //hehe
        for(let i = 0, len = this.recvs.length; i < len; i++) {
            //push every recv parameter to it's appropriate array, then return it
            for (let o = 0, len1 = this.recvs[i][key].length; o < len1; o++) ret[this.recvs[i][key][o].type].push(this.recvs[i][key][o]);
        }
        return ret;
    }
}

export = UIData;