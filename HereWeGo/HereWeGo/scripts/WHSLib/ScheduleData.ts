/**
 * Class to expose all the methods from the data recieved from the cloud
 * Designed to be returned from the DataManage superclass
 */

import TimeFormatUtil = require('../TimeFormatUtil');
import ScheduleUtil = require('./ScheduleUtil');
import StoreSchedUtil = require('./StoreSchedUtil');
import EventInterface = require('./EventInterface');
import UIUtil = require('../UILib/UIUtil');
import ErrorUtil = require('../ErrorUtil');

//utility class, which is returned by the datamanage superclass
class ScheduleData implements UIUtil.SchedHandle {
    //database pointer
    private readonly db: IDBDatabase;
    //database store name
    private readonly name: string;

    //constructor which takes a pointer to an initialized DB
    constructor(db: IDBDatabase, name: string) {
        this.db = db;
        this.name = name;
    }

    //utility functions for conversion
    private periodFromCloudData(data: Array<string>): ScheduleUtil.Period {
        return new ScheduleUtil.Period(
            data[StoreSchedUtil.IndexName.START_TIME],
            data[StoreSchedUtil.IndexName.END_TIME],
            ScheduleUtil.PeriodType[data[StoreSchedUtil.IndexName.PERIOD_TYPE]],
            data[StoreSchedUtil.IndexName.NAME]
        );
    }

    private scheduleFromCloudData(data: StoreSchedUtil.StoreSchedule): ScheduleUtil.Schedule {
        //construct period array from recieved data
        let schedule: Array<ScheduleUtil.Period> = [];
        for (let i = 0, len = data.periods.length; i < len; i++) {
            schedule.push(this.periodFromCloudData(data.periods[i]));
        }
        //fill in the gaps of the passed array
        let o = 0;
        for (let i = 0, len = schedule.length; i < len - 1; i++ , o++) {
            //if the end time for the first is not equal to the start time for the last
            //eg there is a time gap
            if (schedule[o].getStartStr() != schedule[o + 1].getEndStr()) {
                //fill the gap with a passing time
                schedule.splice(o + 1, 0, new ScheduleUtil.Period(schedule[o].getEndStr(), schedule[o + 1].getStartStr(), ScheduleUtil.PeriodType.PASSING, ""));
                //increment index so we skip over the element we just made
                o++;
            }
        }
        return new ScheduleUtil.Schedule(schedule, data.key);
    }

    static eventFromSchedule(sched: ScheduleUtil.Schedule): EventInterface {

        return {
            title: sched.getName() + ' Schedule',
            isAllDay: true,
            startTime: 0,
            endTime: 0,
            schedule: true,
            id: '',
        };
    }

    //stupid UI stuff!
    getSched(objs: Array<UIUtil.SchedParams>, event: UIUtil.EventHandle): Promise<any> {
        //step one: figure out the quiries to make
        //sigh
        interface dayObj {
            day: number;
            objs: Array<UIUtil.SchedParams>;
        }
        //create an object with all the data we need to get and run the thigs
        let days: Array<dayObj> = [];
        for (let i = 0, len = objs.length; i < len; i++) {
            let index = days.findIndex((day) => { return day.day === objs[i].day; })
            if (index === -1) {
                days.push({
                    day: objs[i].day,
                    objs: [objs[i]],
                });
            }
            else days[index].objs.push(objs[i]);
        }
        //step two: get the relevant events
        return Promise.all(days.map((day: dayObj) => {
            //today plus whatever specified by object
            let tempDay = new Date();
            tempDay.setHours(0, 0, 0, 0);
            let time = tempDay.setDate(tempDay.getDate() + day.day);
            return event.getScheduleKey(time).then((key: string) => {
                //do a database query for the key
                //if there is a key
                if (key) {
                    return new Promise((resolve, reject) => {
                        let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(key);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }).catch((err) => {
                        console.log(err);
                        return null;
                    }).then((data: any) => {
                        //if the data is null, fill with null and leave
                        if (!data || !data.target.result) {
                            //for every index of an object in the array in the object
                            for (let i = 0, len = day.objs.length; i < len; i++) day.objs[i].storeSchedule(null);
                            return;
                        }
                        //for every index of an object in the array in the object
                        for (let i = 0, len = day.objs.length; i < len; i++) {
                            //if the object wanted a specific property, give it to them
                            if (day.objs[i].schedProps && day.objs[i].schedProps.length) day.objs[i].storeSchedule(day.objs[i].schedProps.map((prop) => { return data.target.result[prop] }));
                            //else parse and give full schedule
                            else day.objs[i].storeSchedule(this.scheduleFromCloudData(data.target.result));
                        }
                    });
                }
                //else return null
                else {
                    //for every index of an object in the array in the object
                    for (let i = 0, len = day.objs.length; i < len; i++) day.objs[i].storeSchedule(null);
                }
            });
        }));
    }
}

export = ScheduleData;