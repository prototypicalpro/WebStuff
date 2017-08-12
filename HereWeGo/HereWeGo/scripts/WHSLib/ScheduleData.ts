/**
 * Class to expose all the methods from the data recieved from the cloud
 * Designed to be returned from the DataManage superclass
 */

import * as moment from 'moment';
import ScheduleUtil = require('./ScheduleUtil');
import StoreSchedUtil = require('./StoreSchedUtil');

//utility class, which is returned by the datamanage superclass
class ScheduleData {
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

    getSchedule(key: string): Promise<ScheduleUtil.Schedule> {
        //do a database query for the key
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(key);
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then((data: any) => {
            return this.scheduleFromCloudData(data.target.result);
        //if we don't find it or error, there's no school
            }).catch((err) => { return ScheduleUtil.NoSchool; });
    }
}

export = ScheduleData;