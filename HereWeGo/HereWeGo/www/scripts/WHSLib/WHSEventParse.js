/*
 * I don't remember what this code does
 */
/*
import Event = require('./Event');
import ScheduleUtil = require('./ScheduleUtil');

class WHSEventParse {
    private eventCache: Array<Event>;
    private scheduleCache: string;

    filterEvents(eventList: Array<Event>): void {
        this.eventCache = [];
        this.scheduleCache = undefined;

        let x = eventList.length;
        for (let i = 0; i < x; i++) {
            if (!ScheduleUtil.isScheduleIndicator(eventList[i].getName())) this.eventCache.push(eventList[i]);
            else if (this.scheduleCache == undefined) this.scheduleCache = eventList[i].getName();
            else console.log("Two schedule indicators found, taking the first one");
        }
    }

    getFilteredEvents(): Array<Event> { return this.eventCache; }

    getSchedule(): WHSSched.Schedule {
        if (WHSSched.CAL_KEYS[this.scheduleCache] != undefined) return WHSSched.CAL_KEYS[this.scheduleCache];
        else return WHSSched.NoSchool;
    }

    getSchoolToday(): boolean { return WHSSched.CAL_KEYS[this.scheduleCache] != undefined; }
}

export = WHSEventParse;
*/
//needs to be rewritten 
//# sourceMappingURL=WHSEventParse.js.map