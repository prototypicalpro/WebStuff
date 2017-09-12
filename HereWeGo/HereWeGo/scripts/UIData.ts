/**
 * Handling and serving all that data to different parts of the UI
 * is already getting complicated, so I'm going to build an automated
 * dependecy-injector type thing to simplify it
 */

import UIUtil = require('./UILib/UIUtil');

class UIData {
    //storage members!
    //the schedule handler
    private readonly sched: UIUtil.SchedHandle;
    //the event handler
    private readonly events: UIUtil.EventHandle;
    //the useful day handler
    private readonly day: UIUtil.DayHandle;
    //the array of recievers
    private readonly recvs: Array<UIUtil.UIItem> = [];
    //constructor!
    constructor(schedHandle: UIUtil.SchedHandle, eventHandle: UIUtil.EventHandle, dayHandle: UIUtil.DayHandle, recievers: Array<UIUtil.UIItem>) {
        this.sched = schedHandle;
        this.events = eventHandle;
        this.day = dayHandle;
        //iterate through each item and it's children and filter out the ones that don't need any callbacks
        for (let i = 0, len = recievers.length; i < len; i++) {
            if (recievers[i].getChildren) {
                this.recvs = this.recvs.concat(recievers[i].getChildren());
            }
            this.recvs.push(recievers[i]);
        }
    }
    
    //initialize the UIItems with all the data they need
    initInject(): Promise<any> {
        //get all the things ww need to quire
        let params = this.getDataFromRecvArray('onInitRecv');
        //get all the things!
        return Promise.all([
            params[UIUtil.RecvType.SCHEDULE].length ? this.sched.getSched(params[UIUtil.RecvType.SCHEDULE], this.events) : null,
            params[UIUtil.RecvType.EVENTS].length ? this.events.getEvents(params[UIUtil.RecvType.EVENTS]) : null,
            params[UIUtil.RecvType.DAY].length ? this.day.getDay(params[UIUtil.RecvType.DAY]) : null,
        ]);
        //each UIItem will then ititialize itself (or something like that), we just inject the data
    }

    //run the initialization routine after the html has been made
    initRun(): void {
        for (let i = 0, len = this.recvs.length; i < len; i++) if (this.recvs[i].onInit) this.recvs[i].onInit();
    }

    //next, the triggers themselves
    //might as well use the enum
    trigger(why: UIUtil.TRIGGERED) {
        //get all the parameters
        let params = this.getDataFromRecvArray(UIUtil.TRIGGERED[why] + 'Recv');
        //inject all the things!
        Promise.all([
            params[UIUtil.RecvType.SCHEDULE].length ? this.sched.getSched(params[UIUtil.RecvType.SCHEDULE], this.events) : null,
            params[UIUtil.RecvType.EVENTS].length ? this.events.getEvents(params[UIUtil.RecvType.EVENTS]) : null,
            params[UIUtil.RecvType.DAY].length ? this.day.getDay(params[UIUtil.RecvType.DAY]) : null,
        ]).then(() => {
            //run all the functions!
            this.recvs.map((recv) => recv[UIUtil.TRIGGERED[why]]());
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
            if (this.recvs[i][key]) for (let o = 0, len1 = this.recvs[i][key].length; o < len1; o++) ret[this.recvs[i][key][o].type].push(this.recvs[i][key][o]);
        }
        return ret;
    }
}

export = UIData;