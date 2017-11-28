define(["require", "exports"], function (require, exports) {
    "use strict";
    class EventData {
        constructor(db, name) {
            this.db = db;
            this.objName = name;
        }
        getScheduleKey(start) {
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('schedule').openCursor(IDBKeyRange.only(1));
                req.onsuccess = (event) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value.startTime === start)
                            return resolve(cursor.value.title);
                        else
                            cursor.continue();
                    }
                    else
                        resolve(null);
                };
                req.onerror = reject;
            }).then((result) => {
                if (!result)
                    return null;
                else
                    return result;
            });
        }
        getEvents(objs) {
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
                let start = tempDay.setDate(tempDay.getDate() + day.day);
                let end = tempDay.setDate(tempDay.getDate() + 1) - 1;
                return new Promise((resolve) => {
                    let req = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
                    req.onsuccess = (event) => {
                        let cursor = event.target.result;
                        if (cursor) {
                            if (!cursor.value.schedule) {
                                for (let i = 0, len = day.objs.length; i < len; i++)
                                    day.objs[i].storeEvent(cursor.value);
                            }
                            cursor.continue();
                        }
                        else
                            return resolve();
                    };
                });
            }));
        }
    }
    return EventData;
});
//# sourceMappingURL=EventData.js.map