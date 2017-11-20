/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB
 */

import EventData = require('./Interfaces/EventData');
import DataInterface = require('./Interfaces/DataInterface');
import DBManage = require('../DBLib/DBManage');
import UIUtil = require('../UILib/UIUtil');

//special consant for a special situation
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'title', 'schedule'];

//special enum for crappy code
enum DBInfoEnum {
    cal,
    sched,
    time,
};

class CalDataManage implements DataInterface {
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
            keys: EVENT_KEYS
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
                schedule: !!item[EventData.CloudEventEnum.schedule],
                title: item[EventData.CloudEventEnum.title],
                startTime: item[EventData.CloudEventEnum.startTime],
                endTime: item[EventData.CloudEventEnum.endTime],
                isAllDay: !!item[EventData.CloudEventEnum.isAllDay],
            };
        });
    }

    /**
     * Data functions
     */

    //other more interesting functions
    //get and inject the schedule for today
    getScheduleKey(start: number): Promise<string> {
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).index('schedule').openCursor(IDBKeyRange.only(1));
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (cursor.value.startTime === start) return resolve(cursor.value.title);
                    else cursor.continue();
                }
                else resolve(null);
            };
            req.onerror = reject;
        }).then((result) => {
            if (!result) return null;
            else return result;
        });
    }

    //UI handler interface madness!
    getEvents(objs: Array<UIUtil.EventParams>): Promise<any> {
        //step one: figure out the quiries to make
        //sigh
        interface dayObj {
            day: number;
            objs: Array<UIUtil.EventParams>;
        }
        //create an object with all the data we need to get and run the thigs
        let days: Array<dayObj> = [];
        for (let i = 0, len = objs.length; i < len; i++) {
            let index = days.findIndex((day) => { return day.day === objs[i].day; })
            if (index === -1) {
                days.push({
                    day: objs[i].day,
                    objs: [objs[i]],
                });
            }
            else days[index].objs.push(objs[i]);
        }
        //run the quiries!
        //first get all the days, then map them to promises with database info, inside of which we run the functions!
        return Promise.all(days.map((day: dayObj) => {
            //date stuff
            //today plus whatever specified by object
            let tempDay = new Date();
            tempDay.setHours(0, 0, 0, 0);
            let start = tempDay.setDate(tempDay.getDate() + day.day);
            //add one day minus one millisecond
            let end = tempDay.setDate(tempDay.getDate() + 1) - 1;
            //db stuff!
            return new Promise((resolve) => {
                let req: IDBRequest = this.db.transaction([this.dbInfo[DBInfoEnum.cal].storeName], "readonly").objectStore(this.dbInfo[DBInfoEnum.cal].storeName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
                req.onsuccess = (event: any) => {
                    let cursor: IDBCursorWithValue = event.target.result;
                    if (cursor) {
                        if (!cursor.value.schedule) {
                            //run it bby
                            for (let i = 0, len = day.objs.length; i < len; i++) day.objs[i].storeEvent(cursor.value);
                        }
                        cursor.continue();
                    }
                    else return resolve();
                };
            });
        }));
        //it's now occurring to me how I should just iterate through the events instead of doing database stuff in parrellel,
        //but I think it's a little late for that now
    }
}

export = CalDataManage;
