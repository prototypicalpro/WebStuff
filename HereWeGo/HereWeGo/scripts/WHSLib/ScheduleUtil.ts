/*
 * Library which makes schedule data semi-accesible
 */

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
        private startTime: number;
        private endTime: number;
        private startStr: string;
        private endStr: string;
        private type: PeriodType;
        private name: string;

        //takes start and end times in form of '9:36am' or '12:45pm'
        constructor(startStr: string, endStr: string, type: PeriodType, name: string) {
            this.startStr = addSpaceToPM(startStr);
            this.endStr = addSpaceToPM(endStr);
            this.startTime = timeFromCloudData(startStr);
            this.endTime = timeFromCloudData(endStr);
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
        getCurrentPeriodIndex(time: Date): number {
            let today = new Date(time).setHours(0, 0, 0, 0);
            //check if school has started
            if (this.periods[0].getStart(today) > time) return PeriodType.BEFORE_START;
            //school has started, check if school has ended
            if (this.periods[this.periods.length - 1].getEnd(today) < time) return PeriodType.AFTER_END;
            //find the current period
            for (let index = 0, len = this.periods.length; index < len; index++) if (this.periods[index].getEnd(today) > time) return index;
            throw Error("WTF");
        }
    }

    //data conversion func (9:55pm => ms from start of day)
    const timeFromCloudData = (timeString: string): number => {
        //hours, then mins, converted to ms (for Date logic), multiply by two if pm
        if (timeString[1] === ':') return (parseInt(timeString[0]) + (timeString[4] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(2, 4)) * 60000;
        let hours = parseInt(timeString.slice(0, 2));
        return (hours + (hours != 12 && timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(3, 5)) * 60000;
    }

    const addSpaceToPM = (timeString: string): string => {
        if (timeString[1] === ':' && timeString[4] != ' ') return timeString.slice(0, 4) + ' ' + timeString.slice(4);
        if (timeString[5] != ' ') return timeString.slice(0, 5) + ' ' + timeString.slice(5);
    }

    //schedule constant
    export const NoSchool = new Schedule([], "No School");
}

export = ScheduleUtil;