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
    readonly recvs: Array<UIArgs.Recv>;
    //constructor!
    constructor(schedHandle: UIArgs.SchedHandle, eventHandle: UIArgs.EventHandle, dayHandle: UIArgs.DayHandle, recievers: Array<UIUtil.UIItem>) {
        this.sched = schedHandle;
        this.events = eventHandle;
        //iterate through each item and it's children to get all the recivers
        this.recvs = <Array<UIArgs.Recv>>[].concat.apply([], recievers.map((item) => { return item.getChildren(); })).filter((item: any) => { return item.recv; });
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
}

export = UIData;