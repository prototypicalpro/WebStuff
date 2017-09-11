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
        params = this.getDataFromRecvArray('onInitRecv');
        //get all the things!
        Promise.all([
            this.sched.getSched(params[UIArgs.RecvType.SCHEDULE], this.events),
            this.events.getEvents(params[UIArgs.RecvType.EVENTS]),
            this.day.getDay(null),
        ]).then((ray: Array<any>) => {
            //inject all the things
            for(let i = 0, len = this.recvs.length; i < len; i++) {
                if(Array.isArray(this.recvs[i].onInitRecv))
            }
        });
    }

    //next, the triggers themselves
    //might as well use the enum
    trigger(why: UIArgs.TRIGGERED) {
        let triggerStore: Array<Array<any>> = [[], [], []];
        for(let i = 0, len = this.recvs.length; i < len; i++) {
            //stupid loose typing
            //if the trigger or any one of the triggers matches why, add it to the array to update
            if(this.recvs[i].triggers === why || (Array.isArray(this.recvs[i].triggers) && (<Array<UIArgs.TRIGGERED>>this.recvs[i].triggers).indexOf(why) != -1)){
                if(Array.isArray(this.recvs[i].recv)) {
                    //for every recv item, add the element to that spot in the trigger store
                    for(let o = 0, len1 = (<Array<UIArgs.ARGS>>this.recvs[i].recv).length; o < len1; o++) triggerStore[(<Array<UIArgs.ARGS>>this.recvs[i].recv)[o]].push(this.recvs[i]);
                }
                else triggerStore[<UIArgs.ARGS>this.recvs[i].recv].push(this.recvs[i]);
            }
        }
        //run all the updators, then run all thier update functions
        Promise.all([
            triggerStore[UIArgs.ARGS.SCHEDULE].length ? this.sched.injectSched(<Array<UIArgs.SchedRecv>> triggerStore[UIArgs.ARGS.SCHEDULE], this.events) : null,
            triggerStore[UIArgs.ARGS.EVENTS].length ? this.events.injectEvent(<Array<UIArgs.EventRecv>> triggerStore[UIArgs.ARGS.EVENTS]) : null,
            triggerStore[UIArgs.ARGS.DAY].length ? this.day.injectDay(<Array<UIArgs.DayRecv>> triggerStore[UIArgs.ARGS.DAY]) : null,
        ]).then(() => {
            for(let i = 0, len = this.recvs.length; i < len; i++) {
                if(this.recvs[i].triggers === why || (Array.isArray(this.recvs[i].triggers) && (<Array<UIArgs.TRIGGERED>>this.recvs[i].triggers).indexOf(why) != -1)) {
                    switch (why) {
                        case UIArgs.TRIGGERED.INIT:
                            this.recvs[i].onInit();
                            break;
                        case UIArgs.TRIGGERED.UPDATE:
                            this.recvs[i].onUpdate();
                            break;
                        case UIArgs.TRIGGERED.USER_REFRESH:
                            this.recvs[i].onUserRefresh();
                            break;
                    }
                }
            }
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
    private getDataFromRecvArray(key: string): Object {
        let ret = { eventDays: [], schedDays: [] };
        for(let i = 0, len = this.recvs.length; i < len; i++) {
            //add and deduplicate schedule days and event days to fetch
            for(let o = 0, len1 = this.recvs[i][key].length; o < len1; o++) {
                if(this.recvs[i][key][o].type === UIArgs.RecvType.EVENTS && ret.eventDays.indexOf(this.recvs[i][key][o].eventDay) === -1)  ret.eventDays.push(this.recvs[i][key][o].eventDay);
                if(this.recvs[i][key][o].type === UIArgs.RecvType.SCHEDULE && ret.schedDays.indexOf(this.recvs[i][key][o].schedDay) === -1)  ret.schedDays.push(this.recvs[i][key][o].schedDay);
            }
        }
        return ret;
    }
}

export = UIData;