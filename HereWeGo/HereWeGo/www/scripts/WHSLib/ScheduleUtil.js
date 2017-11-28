define(["require", "exports"], function (require, exports) {
    "use strict";
    var ScheduleUtil;
    (function (ScheduleUtil) {
        var PeriodType;
        (function (PeriodType) {
            PeriodType[PeriodType["passing"] = -3] = "passing";
            PeriodType[PeriodType["before_start"] = -2] = "before_start";
            PeriodType[PeriodType["class"] = 0] = "class";
            PeriodType[PeriodType["lunch"] = 1] = "lunch";
            PeriodType[PeriodType["tutor_time"] = 2] = "tutor_time";
            PeriodType[PeriodType["assembly"] = 3] = "assembly";
            PeriodType[PeriodType["after_end"] = -1] = "after_end";
        })(PeriodType = ScheduleUtil.PeriodType || (ScheduleUtil.PeriodType = {}));
        class Period {
            constructor(startStr, endStr, type, name, startTime, endTime) {
                this.startStr = startStr;
                this.endStr = endStr;
                if (!startTime)
                    this.startTime = Period.timeFromCloudData(startStr);
                else
                    this.startTime = startTime;
                if (!endTime)
                    this.endTime = Period.timeFromCloudData(endStr);
                else
                    this.endTime = endTime;
                this.type = type;
                this.name = name;
            }
            getName() { return this.name; }
            getStart(today) { return new Date(this.startTime + today); }
            getStartStr() { return this.startStr; }
            getEnd(today) { return new Date(this.endTime + today); }
            getEndStr() { return this.endStr; }
            getType() { return this.type; }
            getDuration() { return this.endTime - this.startTime; }
            static timeFromCloudData(timeString) {
                if (timeString[1] === ':')
                    return (parseInt(timeString[0]) + (timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(2, 4)) * 60000;
                let hours = parseInt(timeString.slice(0, 2));
                return (hours + (hours != 12 && timeString[5] === 'p' ? 12 : 0)) * 3600000 + parseInt(timeString.slice(3, 5)) * 60000;
            }
        }
        ScheduleUtil.Period = Period;
        class Schedule {
            constructor(schedule, time = null) {
                this.periods = [];
                if (typeof schedule === "string" || !time)
                    this.prettyName = schedule;
                else {
                    for (let i = 0, len = schedule.periodNames.length; i < len; i++)
                        this.periods.push(new Period(Schedule.formatCloudTime(time.times[i][0]), Schedule.formatCloudTime(time.times[i][1]), PeriodType[schedule.periodNames[i][1]], schedule.periodNames[i][0]));
                    this.prettyName = schedule.name;
                }
            }
            getPeriod(index) { return this.periods[index]; }
            getNumPeriods() { return this.periods.length; }
            getName() { return this.prettyName; }
            getCurrentPeriodAndIndex(time) {
                let today = new Date(time).setHours(0, 0, 0, 0);
                if (this.periods[0].getStart(today).getTime() > time.getTime())
                    return [PeriodType.before_start, new Period("12:00 am", this.periods[0].getStartStr(), PeriodType.before_start, this.periods[0].getName(), 0, this.periods[0].startTime)];
                let cache = this.periods.length - 1;
                if (this.periods[cache].getEnd(today).getTime() < time.getTime())
                    return [PeriodType.after_end, new Period(this.periods[cache].getEndStr(), "11:59 pm", PeriodType.after_end, this.periods[cache].getName(), this.periods[cache].endTime, new Date(today).setHours(23, 59))];
                for (let index = 0, len = this.periods.length; index < len; index++) {
                    if (this.periods[index].getEnd(today) > time) {
                        if (this.periods[index].getStart(today) > time)
                            return [PeriodType.passing, new Period(this.periods[index - 1].getEndStr(), this.periods[index].getStartStr(), PeriodType.passing, "Passing", this.periods[index - 1].endTime, this.periods[index].startTime)];
                        return [index, this.periods[index]];
                    }
                }
                throw Error("Boi");
            }
            static formatCloudTime(timeString) {
                if (timeString[1] === ':' && timeString[4] != ' ')
                    return timeString.slice(0, 4) + ' ' + timeString.slice(4) + 'm';
                if (timeString[5] != ' ')
                    return timeString.slice(0, 5) + ' ' + timeString.slice(5) + 'm';
            }
        }
        ScheduleUtil.Schedule = Schedule;
        ScheduleUtil.NoSchool = new Schedule("No School");
    })(ScheduleUtil || (ScheduleUtil = {}));
    return ScheduleUtil;
});
//# sourceMappingURL=ScheduleUtil.js.map