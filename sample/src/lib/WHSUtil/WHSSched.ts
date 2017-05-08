/*
 * Javascript class types for a WHS schedule abstraction framework (now with typescript!)
 * And the encoded schedule as constansts in the framework
 * Designed to make unexpected schedule changes (such as skinny mondays)
 * easy to deal with in code
 * I also hate javascript, and will therefore be explicitly defining as
 * many things as I can to make the code more readable
 */ 

// moment.js to simplify formatting crap
import * as moment from 'moment';

//classes to simplify information acess
class Period {
    private startTime: any; //moment
    private endTime: any; //moment
    private name: string;

    constructor(times: any[2], showName: string){
        this.startTime = times[0];
        this.endTime = times[1];
        this.name = showName;
    }

    getName() : string { return this.name; }

    getStart() : any { return this.startTime; }

    getEnd(): any { return this.endTime; }
}

class Schedule {
    private periods: Period[];
    private name: string;
    private prettyName: string;

    constructor(schedule: Period[], calenderName: string, showName: string){
        this.periods = schedule;
        this.name = calenderName;
        this.prettyName = showName;
    }

    getPeriod(index: number) : Period { return this.periods[index]; }

    getNumPeriods() : number {return this.periods.length; }

    getCalenderName() : string { return this.name; }

    getShowName() : string { return this.prettyName; }
}

// all times in his file will read like a clock
// for more info read "string + format" in moment.js docs
let fmt = "h:mma";

// common a/b schedule
let times = {
    "1/5": [moment("8:15am", fmt), moment("9:47am", fmt)],
    "2/6": [moment("9:52am", fmt), moment("11:24am", fmt)],
    "Lunch": [moment("11:24am", fmt), moment("12:01am", fmt)],
    "3/7": [moment("12:06am", fmt), moment("1:38pm", fmt)],
    "4/8": [moment("1:43pm", fmt), moment("3:15pm", fmt)]
};

export namespace WHSSched{
    export const ADay = new Schedule([
        new Period(times["1/5"], "1"),
        new Period(times["2/6"], "2"),
        new Period(times["Lunch"], "Lunch"),
        new Period(times["3/7"], "3"),
        new Period(times["4/8"], "4")
    ], "A", "A Day");

    export const BDay = new Schedule([
        new Period(times["1/5"], "5"),
        new Period(times["2/6"], "6"),
        new Period(times["Lunch"], "Lunch"),
        new Period(times["3/7"], "7"),
        new Period(times["4/8"], "8")
    ], "B", "B Day");

    export const CAL_KEYS = [ADay.getCalenderName(), BDay.getCalenderName()];
}

