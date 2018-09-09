import ScheduleData = require('./Interfaces/ScheduleData');
/**
 * A collection of utility classes defining a object structure for schedule data
 */
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

    /**
     * Class parsing and exposing an internet fetched start/end time and metadata for a class period.
     */
    export class Period {
        startTime: number;
        endTime: number;
        private startStr: string;
        private endStr: string;
        private type: PeriodType;
        private name: string;

        /**
         * @param startStr start time in format of (h)h:mm a ex. "12:45 am"
         * @param endStr end time in format of (h)h:mm a ex. "3:45 pm"
         * @param type numerical period type representation
         * @param name name of the period
         * @param startTime override the startStr with this number time
         * @param endTime override the endStr with this number time
         */
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

        //data conversion func (9:55 pm => ms from start of day)
        private static timeFromCloudData(timeString: string): number {
            //hours, then mins, converted to ms (for Date logic), multiply by two if pm
            if (timeString[1] === ':') return (parseInt(timeString[0]) + (timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(2, 4)) * 60000;
            let hours = parseInt(timeString.slice(0, 2));
            return (hours + (hours != 12 && timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(3, 5)) * 60000;
        }
    }

    /**
     * Class which takes data retrieved from functions in {@link CalDataManage}, and converts it into
     * a list of periods which can be retrieved based on time.
     */
    export class Schedule {
        private periods: Period[] = [];
        private prettyName: string;

        /**
         * @param schedule The schedule cloud data or string name of the schedule
         * @param time The time cloud data associated with the schedule
         */
        constructor(schedule: ScheduleData.SchedCloudData | string, time: ScheduleData.TimeCloudData) {
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

        /**
         * Returns the current period index and period object given a time. 
         * @param time the time that you want to lookup the period of
         * @returns the index for {@link ScheduleUtil.Schedule.getPeriod}, and period object 
         */
        getCurrentPeriodAndIndex(time: Date): [number, Period] {
            let today = new Date(time).setHours(0, 0, 0, 0);
            //check if school has started
            //if so return before start
            if (this.periods[0].getStart(today).getTime() > time.getTime())
                return [PeriodType.before_start, new Period("12:00 am", this.periods[0].getStartStr(), PeriodType.before_start, this.periods[0].getName(), 0, this.periods[0].startTime)];
            //school has started, check if school has ended
            //if so return after end
            let cache = this.periods.length - 1;
            if (this.periods[cache].getEnd(today).getTime() < time.getTime())
                return [PeriodType.after_end, new Period(this.periods[cache].getEndStr(), "11:59 pm", PeriodType.after_end, this.periods[cache].getName(), this.periods[cache].endTime, new Date(today).setHours(23, 59))];
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

    /** No School schedule to be used instead of creating a new one */
    export const NoSchool = new Schedule("No School", null);
}

export = ScheduleUtil;