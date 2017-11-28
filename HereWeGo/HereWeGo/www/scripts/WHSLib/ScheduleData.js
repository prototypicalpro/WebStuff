define(["require", "exports", "./ScheduleUtil", "./StoreSchedUtil"], function (require, exports, ScheduleUtil, StoreSchedUtil) {
    "use strict";
    class ScheduleData {
        constructor(db, name) {
            this.db = db;
            this.name = name;
        }
        periodFromCloudData(data) {
            return new ScheduleUtil.Period(data[0], data[1], ScheduleUtil.PeriodType[data[2]], data[3]);
        }
        scheduleFromCloudData(data) {
            let schedule = [];
            for (let i = 0, len = data.periods.length; i < len; i++) {
                schedule.push(this.periodFromCloudData(data.periods[i]));
            }
            let o = 0;
            for (let i = 0, len = schedule.length; i < len - 1; i++, o++) {
                if (schedule[o].getStartStr() != schedule[o + 1].getEndStr()) {
                    schedule.splice(o + 1, 0, new ScheduleUtil.Period(schedule[o].getEndStr(), schedule[o + 1].getStartStr(), ScheduleUtil.PeriodType.PASSING, ""));
                    o++;
                }
            }
            return new ScheduleUtil.Schedule(schedule, data.key);
        }
        static eventFromSchedule(sched) {
            return {
                title: sched.getName() + ' Schedule',
                isAllDay: true,
                startTime: 0,
                endTime: 0,
                schedule: true,
                id: '',
            };
        }
        getSched(objs, event) {
            let days = [];
            for (let i = 0, len = objs.length; i < len; i++) {
                let index = days.findIndex((day) => { return day.day === objs[i].day; });
                if (index === -1) {
                    days.push({
                        day: objs[i].day,
                        objs: [objs[i]],
                    });
                }
                else
                    days[index].objs.push(objs[i]);
            }
            return Promise.all(days.map((day) => {
                let tempDay = new Date();
                tempDay.setHours(0, 0, 0, 0);
                let time = tempDay.setDate(tempDay.getDate() + day.day);
                return event.getScheduleKey(time).then((key) => {
                    if (key) {
                        return new Promise((resolve, reject) => {
                            let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(key);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }).catch((err) => {
                            console.log(err);
                            return null;
                        }).then((data) => {
                            if (!data || !data.target.result) {
                                for (let i = 0, len = day.objs.length; i < len; i++)
                                    day.objs[i].storeSchedule(null);
                                return;
                            }
                            for (let i = 0, len = day.objs.length; i < len; i++) {
                                if (day.objs[i].schedProps && day.objs[i].schedProps.length)
                                    day.objs[i].storeSchedule(day.objs[i].schedProps.map((prop) => { return data.target.result[prop]; }));
                                else
                                    day.objs[i].storeSchedule(this.scheduleFromCloudData(data.target.result));
                            }
                        });
                    }
                    else {
                        for (let i = 0, len = day.objs.length; i < len; i++)
                            day.objs[i].storeSchedule(null);
                    }
                });
            }));
        }
    }
    return ScheduleData;
});
//# sourceMappingURL=ScheduleData.js.map