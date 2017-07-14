/*
 * Library which parses schedule data recieved from the cloud,
 * and makes it semi-acessible
 */

import * as moment from 'moment';

namespace ScheduleUtil {
    export enum PeriodType {
        BEFORE_START = -2,
        CLASS = 0,
        LUNCH,
        PASSING,
        TUTOR_TIME,
        AFTER_END = -1
    }

    //utility interface to mrepresent the data retrieved from the cloud
    export interface StoreSchedule {
        periods: Array<Array<string>>;
        key: string;
        name: string;
    }
    //utility enum to represent the array locations of data items in the period string array from the cloud
    enum IndexName {
        START_TIME = 0,
        END_TIME = 1,
        PERIOD_TYPE = 2,
        NAME = 3
    }

    // all times from the cloud will read like a clock
    // for more info read "string + format" in moment.js docs
    const fmt = "hh:mma";

    //classes to simplify information acess
    export class Period {
        private startTime: any; //moment
        private endTime: any; //moment
        private type: PeriodType;
        private name: string;

        constructor(startTime, endTime, type: PeriodType, name: string) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.type = type;
            this.name = name;
        }

        static fromCloudData(data: Array<string>): Period {
            let type;
            switch (data[IndexName.PERIOD_TYPE]) {
                case 'class': type = PeriodType.CLASS; break;
                case 'lunch': type = PeriodType.LUNCH; break;
                case 'tutor': type = PeriodType.TUTOR_TIME; break;
                default: throw Error("Unknown period type!");
            }
            return new Period(moment(data[IndexName.START_TIME], fmt), moment(data[IndexName.END_TIME], fmt), type, data[IndexName.NAME]);
        }

        getName(): string { return this.name; }

        getStart(): any { return this.startTime; }

        getEnd(): any { return this.endTime; }

        getType(): PeriodType { return this.type; }

        getDuration(): any { return this.endTime.subtract(this.startTime); } //returns a moment
    }

    //class which takes an array of periods, fills in the gaps, and then
    //makes the data semi-accesible
    export class Schedule {
        private periods: Period[];
        private prettyName: string;

        constructor(periods: Period[], name: string) {
            this.periods = periods;
            this.prettyName = name;
        }

        static fromCloudData(data: StoreSchedule): Schedule {
            //construct period array from recieved data
            let schedule: Array<Period> = [];
            for (let i = 0, len = data.periods.length; i < len; i++) {
                schedule.push(Period.fromCloudData(data.periods[i]));
            }
            //fill in the gaps of the passed array
            let o = 0;
            for (let i = 0, len = schedule.length; i < len - 1; i++ , o++) {
                //if the end time for the first is not equal to the start time for the last
                //eg there is a time gap
                if (!schedule[o].getEnd().isSame(schedule[o + 1].getStart())) {
                    //fill the gap with a passing time
                    schedule.splice(o + 1, 0, new Period(schedule[o].getEnd(), schedule[o + 1].getStart(), PeriodType.PASSING, ""));
                    //increment index so we skip over the element we just made
                    o++;
                }
            }
            return new Schedule(schedule, data.name);
        }

        getPeriod(index: number): Period { return this.periods[index]; }

        getNumPeriods(): number { return this.periods.length; }

        getName(): string { return this.prettyName; }

        //I don't know if this is the best way, but it's my way
        //returns a negative number corresponding to a PeriodType if school hasn't started,
        //otherwise returns the index of the current period to be used in getPeriod()
        getCurrentPeriodIndex(): number {
            let now = moment();
            //check if school has started
            if (this.periods[0].getStart().isAfter(now)) return PeriodType.BEFORE_START;
            //school has started, check if school has ended
            if (this.periods[this.periods.length - 1].getEnd().isBefore(now)) return PeriodType.AFTER_END;
            //find the current period
            let index = 0;
            for (let len = this.periods.length; index < len; index++) {
                if (this.periods[index].getEnd().isAfter(now)) {
                    return index;
                };
            }
            throw Error("WTF");
        }
    }

    //schedule constants
    const NoSchool = new Schedule([], "No School");

    //finally, the magic function
    export const getSchedule = (schedData: Array<StoreSchedule>, schedKey: string): Schedule => {
        if (typeof schedKey === 'undefined' || schedKey == null || schedKey === "") return NoSchool;
        for (let i = 0, len = schedData.length; i < len; i++) {
            if (schedData[i].key === schedKey) return Schedule.fromCloudData(schedData[i]);
        }
        return NoSchool;
    };
}

export = ScheduleUtil;