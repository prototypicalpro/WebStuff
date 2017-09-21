/*
 * Library which makes schedule data semi-accesible
 */

import moment = require('../moment');

namespace ScheduleUtil {
    export enum PeriodType {
        BEFORE_START = -2,
        CLASS = 0,
        LUNCH,
        PASSING,
        TUTOR_TIME,
        ASSEMBLY,
        AFTER_END = -1
    }

    //classes to simplify information acess
    export class Period {
        private startTime: number; //moment
        private endTime: number; //moment
        private type: PeriodType;
        private name: string;

        constructor(startTime: string, endTime: string, type: PeriodType, name: string) {
            
            this.startTime = startTime;
            this.endTime = endTime;
            this.type = type;
            this.name = name;
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

        getPeriod(index: number): Period { return this.periods[index]; }

        getNumPeriods(): number { return this.periods.length; }

        getName(): string { return this.prettyName; }

        //I don't know if this is the best way, but it's my way
        //returns a negative number corresponding to a PeriodType if school hasn't started,
        //otherwise returns the index of the current period to be used in getPeriod()
        getCurrentPeriodIndex(time: number): number {
            let now = moment(time);
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

    //schedule constant
    export const NoSchool = new Schedule([], "No School");

    //data conversion func (9:55pm => number respresenting time)
    const timeFromCloudData = (timeString: string): number => {
        let hrs;
        if (timeString[1] == ':') hrs = parseInt(timeString[0]);
        else hrs = parseInt(timeString.slice(0, 2));
    }
}

export = ScheduleUtil;