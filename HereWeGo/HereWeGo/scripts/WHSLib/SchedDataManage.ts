/*
 * Class and function which simplify management of schedule objects
 * and creation from the cloud data
 */

import * as moment from 'moment';
import localforage = require('localforage');
import DataInterface = require("./DataInterface");
import { SCHED_CACHE_KEY } from './CacheKeys';
import ScheduleUtil = require('./ScheduleUtil');

//utility interface to represent the data retrieved from the cloud
interface StoreSchedule {
    periods: Array<Array<string>>;
    key: string;
    name: string;
}
//utility enum to represent the array locations of data items in the period string array from the cloud
const enum IndexName {
    START_TIME = 0,
    END_TIME = 1,
    PERIOD_TYPE = 2,
    NAME = 3
}

// all times from the cloud will read like a clock
// for more info read "string + format" in moment.js docs
const fmt = "hh:mma";

const periodFromCloudData = (data: Array<string>): ScheduleUtil.Period => {
    return new ScheduleUtil.Period(moment(data[IndexName.START_TIME], fmt), moment(data[IndexName.END_TIME], fmt), ScheduleUtil.PeriodType[data[IndexName.PERIOD_TYPE]], data[IndexName.NAME]);
}

const scheduleFromCloudData = (data: StoreSchedule): ScheduleUtil.Schedule => {
    //construct period array from recieved data
    let schedule: Array<ScheduleUtil.Period> = [];
    for (let i = 0, len = data.periods.length; i < len; i++) {
        schedule.push(periodFromCloudData(data.periods[i]));
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
    return new ScheduleUtil.Schedule(schedule, data.name);
}

//class which takes all that raw nonsense and turns it into abstraction
class SchedDataManage implements DataInterface {
    dataKey: string = 'schedSyncData';
    private storedData: Array<StoreSchedule>;

    init(): Promise<any> {
        return new Promise(() => this.storedData = []);
    }

    loadData(): Promise<any> {
        return localforage.getItem(SCHED_CACHE_KEY).then((data: Array<StoreSchedule>) => {
            if (data === null) return Promise.reject("No stored schedule!");
            else {
                this.storedData = data;
                localforage.setItem(SCHED_CACHE_KEY, this.storedData);
            }
        });
    }

    //this update function is simple: if we got data, overwrite
    updataData(data: any): void {
        if (data.length > 0) {
            this.storedData = data;
            localforage.setItem(SCHED_CACHE_KEY, this.storedData);
        }
    }

    overwriteData(data: any): void {
        this.storedData = data;
        localforage.setItem(SCHED_CACHE_KEY, this.storedData);
    }

    //proprietary functions for frontend use
    getScheduleFromKey(schedKey: string): ScheduleUtil.Schedule {
        for (let i = 0, len = this.storedData.length; i < len; i++) {
            if (this.storedData[i].key === schedKey) return scheduleFromCloudData(this.storedData[i]);
        }
        return ScheduleUtil.NoSchool;
    }
}

export = SchedDataManage;