define(["require", "exports", "./ScheduleUtil", "../UILib/UIUtil"], function (require, exports, ScheduleUtil, UIUtil) {
    "use strict";
    var DBInfoEnum;
    (function (DBInfoEnum) {
        DBInfoEnum[DBInfoEnum["cal"] = 0] = "cal";
        DBInfoEnum[DBInfoEnum["sched"] = 1] = "sched";
        DBInfoEnum[DBInfoEnum["time"] = 2] = "time";
    })(DBInfoEnum || (DBInfoEnum = {}));
    ;
    class CalDataManage {
        constructor() {
            this.dataType = 0;
            this.dataKey = 'calSyncData';
            this.dbInfo = [
                {
                    storeName: DBInfoEnum[DBInfoEnum.cal],
                    keyPath: 'id',
                    keys: ['isAllDay', 'startTime', 'endTime', 'title', 'schedule'],
                },
                {
                    storeName: DBInfoEnum[DBInfoEnum.sched],
                    keyPath: 'name',
                    keys: [],
                },
                {
                    storeName: DBInfoEnum[DBInfoEnum.time],
                    keyPath: 'name',
                    keys: [],
                },
            ];
        }
        setDB(db) { this.db = db; }
        updateData(data) {
            let nextFunc = (args) => {
                let ray = [];
                for (let i = 0, len = data[args[1].storeName].length; i < len; i++) {
                    if ('cancelled' in data[args[1].storeName][i])
                        ray.push(new Promise((resolve, reject) => {
                            let req = args[0].delete(data[args[1].storeName][i][args[1].keyPath]);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }));
                    else
                        ray.push(new Promise((resolve, reject) => {
                            let req = args[0].put(data[i]);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }));
                }
                return Promise.all(ray).then(() => { return data.length > 0; });
            };
            let transactions = this.dbInfo.map((dbInf) => { return this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName); });
            return Promise.all([
                new Promise((resolve, reject) => {
                    let objectStore = transactions[DBInfoEnum.cal];
                    data[this.dbInfo[DBInfoEnum.cal].storeName] = this.inflateCalCloudData(data[this.dbInfo[DBInfoEnum.cal].storeName]);
                    let nowDay = new Date();
                    nowDay.setHours(0, 0, 0, 0);
                    let nowTime = nowDay.getTime();
                    objectStore.openCursor(IDBKeyRange.upperBound(nowTime, true)).onsuccess = (event) => {
                        let cursor = event.target.result;
                        if (cursor) {
                            cursor.delete();
                            cursor.continue();
                        }
                        else
                            resolve([objectStore, this.dbInfo[DBInfoEnum.cal]]);
                    };
                }).then(nextFunc),
                nextFunc([transactions[DBInfoEnum.sched], this.dbInfo[DBInfoEnum.sched]]),
                nextFunc([transactions[DBInfoEnum.time], this.dbInfo[DBInfoEnum.time]]),
            ]).then((datums) => { return datums.indexOf(true) != -1; });
        }
        overwriteData(data) {
            data.cal = this.inflateCalCloudData(data.cal);
            return Promise.all(this.dbInfo.map(((dbInf) => {
                let objectStore = this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName);
                return new Promise((resolve, reject) => {
                    let req = objectStore.clear();
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }).then(() => {
                    let ray = [];
                    for (let i = 0, len = data[dbInf.storeName].length; i < len; i++) {
                        ray.push(new Promise((resolve, reject) => {
                            let req = objectStore.add(data[dbInf.storeName][i]);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }));
                    }
                    return Promise.all(ray);
                });
            }).bind(this)));
        }
        inflateCalCloudData(data) {
            return data.map((item) => {
                return {
                    id: item[0],
                    schedule: item[1],
                    title: item[2],
                    startTime: item[3],
                    endTime: item[4],
                    isAllDay: item[5],
                };
            });
        }
        getData(params) {
            let evRange = [];
            let schedList = [];
            let onlySched = true;
            const expandRange = (start, count) => {
                if (typeof evRange[0] != 'number' || start < evRange[0])
                    evRange[0] = start;
                else if (typeof evRange[1] != 'number' || start > evRange[1])
                    evRange[1] = start;
                if (start + count > evRange[1])
                    evRange[1] = start + count;
            };
            for (let i = 0, len = params.length; i < len; i++) {
                if (params[i].dayStart) {
                    onlySched = false;
                    expandRange(params[i].dayStart, params[i].dayCount);
                }
                if (typeof params[i].schedDay === 'number' && schedList.indexOf(params[i].schedDay) === -1) {
                    schedList.push(params[i].schedDay);
                    expandRange(params[i].schedDay);
                }
            }
            if (!evRange.length)
                return false;
            let day = new Date();
            day.setHours(0, 0, 0, 0);
            let nowDay = day.getDate();
            let range;
            if (!evRange[1] && onlySched)
                range = IDBKeyRange.only(day.setDate(nowDay + evRange[0]));
            else
                range = IDBKeyRange.bound(day.setDate(nowDay + evRange[0]), (evRange[1] ? day.setDate(nowDay + evRange[1] + 1) : day.setDate(nowDay + 1)) - 1);
            return new Promise((resolve, reject) => {
                let evRet = {};
                let req = this.db.transaction([this.dbInfo[DBInfoEnum.cal].storeName], "readonly").objectStore(this.dbInfo[DBInfoEnum.cal].storeName).index('startTime').openCursor(range);
                req.onerror = reject;
                req.onsuccess = (event) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (!onlySched || cursor.value.schedule) {
                            if (!evRet[cursor.value.startTime])
                                evRet[cursor.value.startTime] = [cursor.value];
                            else
                                evRet[cursor.value.startTime].push(cursor.value);
                        }
                        cursor.continue();
                    }
                    else
                        return resolve(evRet);
                };
            }).then((ret) => {
                if (!schedList.length)
                    Promise.resolve({ events: ret });
                else
                    return Promise.all(schedList.map((schedNum) => {
                        let find;
                        if (!ret[day.setDate(nowDay + schedNum)] || !(find = ret[day.setDate(nowDay + schedNum)].find((ev) => { return ev.schedule; })))
                            return false;
                        return new Promise((resolve, reject) => {
                            let tx = this.db.transaction([this.dbInfo[DBInfoEnum.sched].storeName, this.dbInfo[DBInfoEnum.time].storeName], "readonly");
                            let req = tx.objectStore(this.dbInfo[DBInfoEnum.sched].storeName).get(find.title);
                            req.onsuccess = (evt) => {
                                if (!evt.target.result)
                                    return resolve(false);
                                let req2 = tx.objectStore(this.dbInfo[DBInfoEnum.time].storeName).get(evt.target.result.timeName);
                                req2.onsuccess = (evt1) => {
                                    if (!evt1.target.result)
                                        return resolve(false);
                                    resolve([find.startTime, new ScheduleUtil.Schedule(evt.target.result, evt1.target.result)]);
                                };
                                req2.onerror = reject;
                            };
                            req.onerror = reject;
                        });
                    })).then((scheds) => {
                        let schedRet = {};
                        for (let i = 0, len = scheds.length; i < len; i++)
                            if (scheds[i] && scheds[i][1])
                                schedRet[scheds[i][0]] = scheds[i][1];
                        return { events: ret, scheds: schedRet };
                    });
            });
        }
    }
    return CalDataManage;
});
//# sourceMappingURL=CalDataManage.js.map