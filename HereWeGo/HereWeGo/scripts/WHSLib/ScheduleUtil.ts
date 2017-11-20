/*
 * Library which makes schedule data semi-accesible
 */

import ScheduleData = require('./Interfaces/ScheduleData');

namespace ScheduleUtil {
    export enum PeriodType {
        passing = -3,
        before_start = -2,
        class = 0,
        lunch,
        tutor_time,
        assembly,
        after_end = -1
    }

    //classes to simplify information acess
    export class Period {
        startTime: number;
        endTime: number;
        private startStr: string;
        private endStr: string;
        private type: PeriodType;
        private name: string;

        //takes start and end times in form of '9:36 am' or '12:45 pm'
        constructor(startStr: string, endStr: string, type: PeriodType, name: string, startTime?: number, endTime?: number) {
            this.startStr = startStr;
            this.endStr = endStr;
            if (!startTime) this.startTime = Period.timeFromCloudData(startStr);
            else this.startTime = startTime;
            if (!endTime) this.endTime = Period.timeFromCloudData(endStr);
            else this.endTime = endTime;
            this.type = type;
            this.name = name;
        }

        getName(): string { return this.name; }

        getStart(today: number): Date { return new Date(this.startTime + today); }

        getStartStr(): string { return this.startStr; }

        getEnd(today: number): Date { return new Date(this.endTime + today); }

        getEndStr(): string { return this.endStr; }

        getType(): PeriodType { return this.type; }

        getDuration(): number { return this.endTime - this.startTime; }

        //data conversion func (9:55pm => ms from start of day)
        private static timeFromCloudData(timeString: string): number {
            //hours, then mins, converted to ms (for Date logic), multiply by two if pm
            if (timeString[1] === ':') return (parseInt(timeString[0]) + (timeString[4] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(2, 4)) * 60000;
            let hours = parseInt(timeString.slice(0, 2));
            return (hours + (hours != 12 && timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(3, 5)) * 60000;
        }
    }

    //class which takes an array of periods, fills in the gaps, and then
    //makes the data semi-accesible
    export class Schedule {
        private periods: Period[] = [];
        private prettyName: string;

        constructor(schedule: ScheduleData.SchedCloudData | string, time: ScheduleData.TimeCloudData = null) {
            if (typeof schedule === "string" || !time) this.prettyName = <string>schedule;
            //construct period array
            else {
                for (let i = 0, len = schedule.periodNames.length; i < len; i++) this.periods.push(new Period(
                    Schedule.formatCloudTime(time.times[i][ScheduleData.TimeCloudEnum.start]),
                    Schedule.formatCloudTime(time.times[i][ScheduleData.TimeCloudEnum.end]),
                    PeriodType[schedule.periodNames[i][ScheduleData.PeriodCloudEnum.type]],
                    schedule.periodNames[i][ScheduleData.PeriodCloudEnum.name]
                ));
                this.prettyName = schedule.name;
            }
        }

        getPeriod(index: number): Period { return this.periods[index]; }

        getNumPeriods(): number { return this.periods.length; }

        getName(): string { return this.prettyName; }

        //I don't know if this is the best way, but it's my way
        //returns a negative number corresponding to a PeriodType if school hasn't started,
        //otherwise returns the index of the current period to be used in getPeriod()
        //[object, index]
        getCurrentPeriodAndIndex(time: Date): [number, Period] {
            let today = new Date(time).setHours(0, 0, 0, 0);
            //check if school has started
            //if so return before start
            if (this.periods[0].getStart(today) > time)
                return [PeriodType.before_start, new Period("12:00a", this.periods[0].getStartStr(), PeriodType.before_start, this.periods[0].getName(), 0, this.periods[0].startTime)];
            //school has started, check if school has ended
            //if so return after end
            let cache = this.periods.length - 1;
            if (this.periods[cache].getEnd(today) < time)
                return [PeriodType.after_end, new Period(this.periods[cache].getEndStr(), "11:59p", PeriodType.after_end, this.periods[cache].getName(), this.periods[cache].endTime, new Date(today).setHours(23, 59))];
            //find the current period
            for (let index = 0, len = this.periods.length; index < len; index++) {
                //if the period end is after the time
                if (this.periods[index].getEnd(today) > time) {
                    //if the period start is also after the time, we're in an in-between
                    if (this.periods[index].getStart(today) > time)
                        return [PeriodType.passing, new Period(this.periods[index - 1].getEndStr(), this.periods[index].getStartStr(), PeriodType.passing, "Passing", this.periods[index - 1].endTime, this.periods[index].startTime)];
                    //else the period has started, so return it
                    return [index, this.periods[index]];
                }
            }
            throw Error("Boi");
        }

        private static formatCloudTime(timeString: string): string {
            if (timeString[1] === ':' && timeString[4] != ' ') return timeString.slice(0, 4) + ' ' + timeString.slice(4) + 'm';
            if (timeString[5] != ' ') return timeString.slice(0, 5) + ' ' + timeString.slice(5) + 'm';
        }
    }

    //schedule constant
    export const NoSchool = new Schedule("No School");
}

export = ScheduleUtil;