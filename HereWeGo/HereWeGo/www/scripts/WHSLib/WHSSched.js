/*
 * Javascript class types for a WHS schedule abstraction framework (now with typescript!)
 * And the encoded schedule as constansts in the framework
 * Designed to make unexpected schedule changes (such as skinny mondays)
 * easy to deal with in code
 * I also hate javascript, and will therefore be explicitly defining as
 * many things as I can to make the code more readable
 */
define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    var WHSSched;
    (function (WHSSched) {
        var PeriodType;
        (function (PeriodType) {
            PeriodType[PeriodType["BEFORE_START"] = -2] = "BEFORE_START";
            PeriodType[PeriodType["CLASS"] = 0] = "CLASS";
            PeriodType[PeriodType["LUNCH"] = 1] = "LUNCH";
            PeriodType[PeriodType["PASSING"] = 2] = "PASSING";
            PeriodType[PeriodType["TUTOR_TIME"] = 3] = "TUTOR_TIME";
            PeriodType[PeriodType["AFTER_END"] = -1] = "AFTER_END";
        })(PeriodType = WHSSched.PeriodType || (WHSSched.PeriodType = {}));
        //classes to simplify information acess
        class Period {
            constructor(times, type, showName) {
                this.startTime = times[0];
                this.endTime = times[1];
                this.type = type;
                this.name = showName;
            }
            getName() { return this.name; }
            getStart() { return this.startTime; }
            getEnd() { return this.endTime; }
            getType() { return this.type; }
            getDuration() { return this.endTime.subtract(this.startTime); } //returns a moment
        }
        WHSSched.Period = Period;
        //class which takes an array of periods, fills in the gaps, and then
        //makes the data semi-accesible
        class Schedule {
            constructor(schedule, showName) {
                //fill in the gaps of the passed period array
                let o = 0;
                for (let i = 0, len = schedule.length; i < len - 1; i++, o++) {
                    //if the end time for the first is not equal to the start time for the last
                    //eg there is a time gap
                    if (!schedule[o].getEnd().isSame(schedule[o + 1].getStart())) {
                        //fill the gap with a passing time
                        schedule.splice(o + 1, 0, new Period([schedule[o].getEnd(), schedule[o + 1].getStart()], PeriodType.PASSING, ""));
                        //increment index so we skip over the element we just made
                        o++;
                    }
                }
                this.periods = schedule;
                this.prettyName = showName;
            }
            getPeriod(index) { return this.periods[index]; }
            getNumPeriods() { return this.periods.length; }
            getName() { return this.prettyName; }
            //I don't know if this is the best way, but it's my way
            //returns a negative number corresponding to a PeriodType if school hasn't started,
            //otherwise returns the index of the current period to be used in getPeriod()
            getCurrentPeriodIndex() {
                let now = moment();
                //check if school has started
                if (this.periods[0].getStart().isAfter(now))
                    return PeriodType.BEFORE_START;
                //school has started, check if school has ended
                if (this.periods[this.periods.length - 1].getEnd().isBefore(now))
                    return PeriodType.AFTER_END;
                //find the current period
                let index = 0;
                for (let len = this.periods.length; index < len; index++) {
                    if (this.periods[index].getEnd().isAfter(now)) {
                        return index;
                    }
                    ;
                }
                throw Error("WTF");
            }
        }
        WHSSched.Schedule = Schedule;
        // all times in his file will read like a clock
        // for more info read "string + format" in moment.js docs
        const fmt = "hh:mma";
        //function to make less verbose
        const t = (time) => { return moment(time, fmt); };
        // common a/b schedule
        const times = {
            "1/5": [t("8:15am"), t("9:47am")],
            "2/6": [t("9:52am"), t("11:24am")],
            "Lunch": [t("11:24am"), t("12:01pm")],
            "3/7": [t("12:06pm"), t("1:38pm")],
            "4/8": [t("1:43pm"), t("3:15pm")]
        };
        //schedule constants
        WHSSched.NoSchool = new Schedule([], "No School");
        WHSSched.ADay = new Schedule([
            new Period(times["1/5"], PeriodType.CLASS, "1"),
            new Period(times["2/6"], PeriodType.CLASS, "2"),
            new Period(times["Lunch"], PeriodType.LUNCH, "Lunch"),
            new Period(times["3/7"], PeriodType.CLASS, "3"),
            new Period(times["4/8"], PeriodType.CLASS, "4")
        ], "A");
        WHSSched.BDay = new Schedule([
            new Period(times["1/5"], PeriodType.CLASS, "5"),
            new Period(times["2/6"], PeriodType.CLASS, "6"),
            new Period(times["Lunch"], PeriodType.LUNCH, "Lunch"),
            new Period(times["3/7"], PeriodType.CLASS, "7"),
            new Period(times["4/8"], PeriodType.CLASS, "8")
        ], "B");
        //Keys which match calendar named events to schedule objects
        WHSSched.CAL_KEYS = { 'A': WHSSched.ADay, 'B': WHSSched.BDay };
        //function which checks event to see if it's a schedule event or not
        WHSSched.isScheduleIndicator = (eventName) => {
            return WHSSched.CAL_KEYS[eventName] != undefined;
        };
        //function to parse calendar and return the current schedule
        //basically searches through event names for one that matches the names of one of the keys
        //you should make sure that the events passed to this function are today's event for program sucsess
        WHSSched.getScheduleEventIndex = (eventList) => {
            let x = eventList.length;
            for (let i = 0; i < x; i++)
                if (WHSSched.isScheduleIndicator(eventList[i].getName()))
                    return i;
            return undefined;
            //hot
        };
        WHSSched.getScheduleFromEvent = (event) => {
            return WHSSched.CAL_KEYS[event.getName()];
        };
    })(WHSSched || (WHSSched = {}));
    return WHSSched;
});
//# sourceMappingURL=WHSSched.js.map