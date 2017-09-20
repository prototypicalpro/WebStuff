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
    //the thoughtful quote handler
    private readonly quote: UIUtil.QuoteHandle;
    //the array of recv params, for quickness
    private readonly recvParamList: Array<Array<any>> = [[], [], [], []]; //one for every type of update
    //the array of recievers, for callbacks
    private readonly recvs: Array<UIUtil.UIItem>;
    //constructor!
    constructor(schedHandle: UIUtil.SchedHandle, eventHandle: UIUtil.EventHandle, dayHandle: UIUtil.DayHandle, quoteHandle: UIUtil.QuoteHandle, recievers: Array<UIUtil.UIItem>) {
        this.sched = schedHandle;
        this.events = eventHandle;
        this.day = dayHandle;
        this.quote = quoteHandle;
        //iterate through each item and it's children and filter out the ones that don't need any callbacks
        for (let i = 0, len = recievers.length; i < len; i++) if (recievers[i].getChildren) recievers = recievers.concat(recievers[i].getChildren());
        //store that array
        this.recvs = recievers;
        //take that array and map it's parameters to arrays, which we store
        for (let i = 0, len = recievers.length; i < len; i++)
            //push every recv parameter to it's appropriate array
            if (recievers[i].recv) for (let o = 0, len1 = recievers[i].recv.length; o < len1; o++) this.recvParamList[recievers[i].recv[o].type].push(recievers[i].recv[o]);
    }
    
    //initialize the UIItems with all the data they need
    initInject(): Promise<any> {
        //get all the things!
        return Promise.all([
            this.sched.getSched(this.recvParamList[UIUtil.RecvType.SCHEDULE], this.events),
            this.events.getEvents(this.recvParamList[UIUtil.RecvType.EVENTS]),
            this.day.getDay(this.recvParamList[UIUtil.RecvType.DAY]),
            this.quote.getQuote(this.recvParamList[UIUtil.RecvType.QUOTE]),
        ]);
        //each UIItem will then ititialize itself (or something like that), we just inject the data
    }

    //run the initialization routine after the html has been made
    initRun(): void {
        for (let i = 0, len = this.recvs.length; i < len; i++) if (this.recvs[i].onInit) this.recvs[i].onInit();
    }

    //next, the triggers themselves
    //might as well use the enum
    trigger(why: Array<UIUtil.TRIGGERED>) {
        //inject all the things!
        let thing: Promise<any>;
        if (why.indexOf(UIUtil.TRIGGERED.UPDATE_ALL_DATA) != -1) thing = Promise.all([
            this.sched.getSched(this.recvParamList[UIUtil.RecvType.SCHEDULE], this.events),
            this.events.getEvents(this.recvParamList[UIUtil.RecvType.EVENTS]),
            this.day.getDay(this.recvParamList[UIUtil.RecvType.DAY]),
            this.quote.getQuote(this.recvParamList[UIUtil.RecvType.QUOTE]),
        ]);
        else {
            //check every type of update, and add if so
            let ray = [];
            if (why.indexOf(UIUtil.TRIGGERED.SCHEDULE_UPDATE) != -1) ray.push(this.sched.getSched(this.recvParamList[UIUtil.RecvType.SCHEDULE], this.events));
            if (why.indexOf(UIUtil.TRIGGERED.EVENT_UPDATE) != -1) ray.push(this.events.getEvents(this.recvParamList[UIUtil.RecvType.EVENTS]));
            if (why.indexOf(UIUtil.TRIGGERED.QUOTE_UPDATE) != -1) ray.push(this.quote.getQuote(this.recvParamList[UIUtil.RecvType.QUOTE]));
            if (why.indexOf(UIUtil.TRIGGERED.TIME_UPDATE) != -1) ray.push(this.day.getDay(this.recvParamList[UIUtil.RecvType.DAY]));
            thing = Promise.all(ray);
        }
        //and the finishing touch
        thing.then(() => {
            //run all the functions!
            for (let i = 0, len = this.recvs.length; i < len; i++) if (this.recvs[i].onUpdate) this.recvs[i].onUpdate(why);
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
}

export = UIData;