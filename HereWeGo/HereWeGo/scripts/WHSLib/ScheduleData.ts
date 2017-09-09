/**
 * Class to expose all the methods from the data recieved from the cloud
 * Designed to be returned from the DataManage superclass
 */

import * as moment from 'moment';
import ScheduleUtil = require('./ScheduleUtil');
import StoreSchedUtil = require('./StoreSchedUtil');
import EventInterface = require('./EventInterface');
import UIArgs = require('../UIArgs');
import ErrorUtil = require('../ErrorUtil');

//utility class, which is returned by the datamanage superclass
class ScheduleData implements UIArgs.SchedHandle {
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
            moment(data[StoreSchedUtil.IndexName.START_TIME], StoreSchedUtil.fmt),
            moment(data[StoreSchedUtil.IndexName.END_TIME], StoreSchedUtil.fmt),
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
            if (!schedule[o].getEnd().isSame(schedule[o + 1].getStart())) {
                //fill the gap with a passing time
                schedule.splice(o + 1, 0, new ScheduleUtil.Period(schedule[o].getEnd(), schedule[o + 1].getStart(), ScheduleUtil.PeriodType.PASSING, ""));
                //increment index so we skip over the element we just made
                o++;
            }
        }
        return new ScheduleUtil.Schedule(schedule, data.key);
    }

    getSchedule(day: Date, events: UIArgs.EventHandle): Promise<ScheduleUtil.Schedule> {
        //have the events get the schedule key for today
        return events.getScheduleKey(new Date(day).setHours(0, 0, 0, 0)).then((key: string) => {
            //do a database query for the key
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(key);
                req.onsuccess = resolve;
                req.onerror = reject;
            });
        }).then((data: any) => {
            return this.scheduleFromCloudData(data.target.result);
        //if we don't find it or error, there's no school
        }).catch((err) => {
            if (err != ErrorUtil.code.NO_SCHOOL) console.log(err);
            throw ErrorUtil.code.NO_SCHOOL;
        });
    }

    static eventFromSchedule(sched: ScheduleUtil.Schedule): EventInterface {
        return {
            title: sched.getName() + ' Schedule',
            isAllDay: true,
            startTime: sched.getPeriod(0).getStart().valueOf() as number,
            endTime: sched.getPeriod(sched.getNumPeriods() - 1).getEnd.valueOf() as number,
            schedule: true,
            id: '',
        };
    }

    //stupid UI stuff!
    injectSched(objs: Array<UIArgs.SchedRecv>, event: UIArgs.EventHandle): Promise<any> {
        //step one: figure out the quiries to make
        //code moved to UIArgs file for (questionable) portability
        let days: Object = UIArgs.deDupeDays('schedDay', objs);
        //step two: get the relevant events
        return Promise.all(Object.keys(days).map((dayKey) => {
            //today plus whatever specified by object
            let time = new Date().setHours(0, 0, 0, 0) + parseInt(dayKey) * 86400000;
            return event.getScheduleKey(time).then((key: string) => {
                //do a database query for the key
                return new Promise((resolve, reject) => {
                    let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(key);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }).catch((err) => {
                    console.log(err);
                    return null;
                }).then((data: any) => {
                    //if the data is null, fill with null and leave
                    if(!data || !data.target.result) {
                        //for every index of an object in the array in the object
                        for(let i = 0, len = days[time].length; i < len; i++) objs[days[time][i]].schedule = null;
                        return;
                    }
                    //for every index of an object in the array in the object
                    for(let i = 0, len = days[time].length; i < len; i++) {
                        //if the object wanted a specific property, give it to them
                        let object = objs[days[time][i]];
                        if(object.schedProps){
                            if(Array.isArray(object.schedProps)) object.schedule = object.schedProps.map((prop) => { return data.target.result[prop] });
                            else object.schedule = data.target.result[object.schedProps];
                        }
                        //else parse and give full schedule
                        else object.schedule = this.scheduleFromCloudData(data.target.result);
                    }
                });
            });
        }));
    }
}

export = ScheduleData;