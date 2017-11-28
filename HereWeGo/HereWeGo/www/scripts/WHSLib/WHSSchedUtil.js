/*
 * I don't remember what this code does
 */
define(["require", "exports", "./WHSSched"], function (require, exports, WHSSched) {
    "use strict";
    class WHSEventParse {
        filterEvents(eventList) {
            this.eventCache = [];
            this.scheduleCache = undefined;
            let x = eventList.length;
            for (let i = 0; i < x; i++) {
                if (!WHSSched.isScheduleIndicator(eventList[i].getName()))
                    this.eventCache.push(eventList[i]);
                else if (this.scheduleCache == undefined)
                    this.scheduleCache = eventList[i].getName();
                else
                    console.log("Two schedule indicators found, taking the first one");
            }
        }
        getFilteredEvents() { return this.eventCache; }
        getSchedule() { return WHSSched.CAL_KEYS[this.scheduleCache]; }
    }
    return WHSEventParse;
});
//# sourceMappingURL=WHSSchedUtil.js.map