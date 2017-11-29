/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB
 */

import EventData = require('./Interfaces/EventData');
import ScheduleData = require('./Interfaces/ScheduleData');
import ScheduleUtil = require('./ScheduleUtil');
import DataInterface = require('./Interfaces/DataInterface');
import DBManage = require('../DBLib/DBManage');
import UIUtil = require('../UILib/UIUtil');

//special enum for crappy code
enum DBInfoEnum {
    cal,
    sched,
    time,
};

class CalDataManage implements DataInterface {
    readonly dataType: UIUtil.RecvType = UIUtil.RecvType.CAL;
    //we can also do this
    protected db: IDBDatabase;
    setDB(db: IDBDatabase): void { this.db = db; }
    //db info
    readonly dataKey: string = 'calSyncData';
    //database info
    //three databi: calendar events, schedule types, and schedule times
    readonly dbInfo: Array<DBManage.DBInfoInterface> = [
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
    //functions that use the above data to manipulate the cache
    //update data: remove the old, replace the new
    updateData(data: any): Promise<boolean> | false {
        //store our next steps
        let nextFunc = (args: [IDBObjectStore, DBManage.DBInfoInterface]): Promise<boolean> => {
            //then do a buncha quuuueirereis to update the database entries
            //but put it all in promises just to be sure
            let ray: Array<Promise<any>> = [];
            for (let i = 0, len = data[args[1].storeName].length; i < len; i++) {
                if ('cancelled' in data[args[1].storeName][i]) ray.push(new Promise((resolve, reject) => {
                    let req = args[0].delete(data[args[1].storeName][i][args[1].keyPath]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
                else ray.push(new Promise((resolve, reject) => {
                    let req = args[0].put(data[i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
            }
            return Promise.all(ray).then(() => { return data.length > 0; });
        };
        //do things in parrellel!
        let transactions: Array<IDBObjectStore> = this.dbInfo.map((dbInf) => { return this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName); });
        return Promise.all([
            new Promise((resolve, reject) => {
                //moar promises!
                let objectStore = transactions[DBInfoEnum.cal];
                //decompress the calendar data
                data[this.dbInfo[DBInfoEnum.cal].storeName] = this.inflateCalCloudData(data[this.dbInfo[DBInfoEnum.cal].storeName]);
                //iterate through all elements, removing the ones before today
                let nowDay: Date = new Date();
                nowDay.setHours(0, 0, 0, 0);
                let nowTime: number = nowDay.getTime();
                //remove if old
                objectStore.openCursor(IDBKeyRange.upperBound(nowTime, true)).onsuccess = (event: any) => {
                    let cursor = event.target.result as IDBCursorWithValue;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                    else resolve([objectStore, this.dbInfo[DBInfoEnum.cal]]);
                };
            }).then(nextFunc),
            nextFunc([transactions[DBInfoEnum.sched], this.dbInfo[DBInfoEnum.sched]]),
            nextFunc([transactions[DBInfoEnum.time], this.dbInfo[DBInfoEnum.time]]),
        ]).then((datums: Array<boolean>) => { return datums.indexOf(true) != -1; });
    }
    //overwrite data: replace, database be damned
    overwriteData(data: any) {
        //inflate just calData
        data.cal = this.inflateCalCloudData(data.cal);
        //parellel!
        return Promise.all(this.dbInfo.map(((dbInf: DBManage.DBInfoInterface) => {
            //object store
            let objectStore: IDBObjectStore = this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName);
            //promises! yay!
            return new Promise((resolve, reject) => {
                //clear object store
                let req: IDBRequest = objectStore.clear();
                req.onsuccess = resolve;
                req.onerror = reject;
            }).then(() => {
                //fill it with the new datums
                let ray: Array<Promise<any>> = [];
                for (let i = 0, len = data[dbInf.storeName].length; i < len; i++) {
                    ray.push(new Promise((resolve, reject) => {
                        let req = objectStore.add(data[dbInf.storeName][i]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                }
                //and run them all
                return Promise.all(ray);
            });
        }).bind(this)));
    }

    //private utility function to uncompress data from the cloud
    protected inflateCalCloudData(data: Array<Array<any>>): Array<EventData.EventInterface> {
        return data.map((item: Array<any>) => {
            return {
                id: item[EventData.CloudEventEnum.id],
                schedule: item[EventData.CloudEventEnum.schedule],
                title: item[EventData.CloudEventEnum.title],
                startTime: item[EventData.CloudEventEnum.startTime],
                endTime: item[EventData.CloudEventEnum.endTime],
                isAllDay: item[EventData.CloudEventEnum.isAllDay],
            };
        });
    }

    /**
     * Data functions
     */

    //only one data function, takes the days needed and returns the events and schedules for each
    getData(params: Array<UIUtil.CalParams>): Promise<any> | false {
        //create a range of events to fetch, then an array of schedules to fetch
        let evRange = [];
        let schedList = [];
        let onlySched = true;
        //utility function to expand range
        const expandRange = (start: number, count?: number): void => {
            //start of range
            if (typeof evRange[0] != 'number' || start < evRange[0]) evRange[0] = start;
            else if (typeof evRange[1] != 'number' || start > evRange[1]) evRange[1] = start;
            //end of range
            if (start + count > evRange[1]) evRange[1] = start + count;
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
        //check if there's a reason to search
        if (!evRange.length) return false;
        //cache date
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        let nowDay = day.getDate();
        //create key range based on data above
        let range: IDBKeyRange;
        if (!evRange[1] && onlySched) range = IDBKeyRange.only(day.setDate(nowDay + evRange[0]));
        else range = IDBKeyRange.bound(new Date(day).setDate(nowDay + evRange[0]), (evRange[1] ? new Date(day).setDate(nowDay + evRange[1] + 1) : new Date(day).setDate(nowDay + 1)) - 1);
        //start running the query!
        return new Promise((resolve, reject) => {
            let evRet: any = {};
            let req: IDBRequest = this.db.transaction([this.dbInfo[DBInfoEnum.cal].storeName], "readonly").objectStore(this.dbInfo[DBInfoEnum.cal].storeName).index('startTime').openCursor(range);
            req.onerror = reject;
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (!onlySched || cursor.value.schedule) {
                        if (!evRet[cursor.value.startTime]) evRet[cursor.value.startTime] = [cursor.value];
                        else evRet[cursor.value.startTime].push(cursor.value);
                    }
                    cursor.continue();
                }
                else return resolve(evRet);
            };
        }).then((ret: any) => {
            //the return object will be event objects indexed by start time
            //generate schedules for all the schedule days listed
            if (!schedList.length) Promise.resolve({ events: ret });
            //search events, matching each event to it's schedule, and storing it
            //query the schedule types and then the times
            //with a buncha on-off queries
            else return Promise.all(schedList.map((schedNum: number) => {
                //get the appropriete event
                let find: EventData.EventInterface;
                if (!ret[new Date(day).setDate(nowDay + schedNum)] || !(find = ret[day.setDate(nowDay + schedNum)].find((ev) => { return ev.schedule; }))) return false;
                //and search the database for that key
                //double nested database search 
                return new Promise((resolve, reject) => {
                    let tx = this.db.transaction([this.dbInfo[DBInfoEnum.sched].storeName, this.dbInfo[DBInfoEnum.time].storeName], "readonly");
                    let req = tx.objectStore(this.dbInfo[DBInfoEnum.sched].storeName).get(find.title);
                    req.onsuccess = (evt: any) => {
                        if (!evt.target.result) return resolve(false);
                        let req2 = tx.objectStore(this.dbInfo[DBInfoEnum.time].storeName).get(evt.target.result.timeName);
                        req2.onsuccess = (evt1: any) => {
                            if (!evt1.target.result) return resolve(false);
                            resolve([find.startTime, new ScheduleUtil.Schedule(evt.target.result, evt1.target.result)]);
                        };
                        req2.onerror = reject;
                    };
                    req.onerror = reject;
                    //yaaaaay caaaalbaaaacks
                });
            })).then((scheds: Array<[number, false | ScheduleUtil.Schedule]>) => {
                //index schedule based on start time
                let schedRet = {};
                for (let i = 0, len = scheds.length; i < len; i++) if (scheds[i] && scheds[i][1]) schedRet[scheds[i][0]] = scheds[i][1];
                return { events: ret, scheds: schedRet };
            });
        });
    }
}

export = CalDataManage;
