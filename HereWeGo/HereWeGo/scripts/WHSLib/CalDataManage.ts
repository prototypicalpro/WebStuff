/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB
 */

//TODO: update gscript to handle event cancellations
//also idk if any of this works yet, so test

import EventData = require('./Interfaces/EventData');
import DBManage = require('../DBLib/DBManage');
import SyncableCache = require('./SyncableCache');
import UIUtil = require('../UILib/UIUtil');

//special consant for a special situation
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'title', 'schedule'];

class CalDataManage extends SyncableCache {
    readonly dataKey: string = 'calSyncData';
    //database info
    readonly dbInfo: DBManage.DBInfoInterface = {
        storeName: 'cal',
        keyPath: 'id',
        keys: EVENT_KEYS
    }

    //private utility function to uncompress data from the cloud
    protected inflateCloudData(data: Array<Array<any>>): Array<EventData.EventInterface> {
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

    //and the pruning function, to remove any events which are before today
    protected prune(store: IDBObjectStore): Promise<any> {
        return new Promise((resolve, reject) => {
            //iterate through all elements, removing the ones before today
            let nowDay: Date = new Date();
            nowDay.setHours(0, 0, 0, 0);
            let nowTime: number = nowDay.getTime();
            //remove if old
            store.openCursor(IDBKeyRange.upperBound(nowTime, true)).onsuccess = (event: any) => {
                let cursor = event.target.result as IDBCursorWithValue;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
                else resolve();
            };
        });
    }

    /**
     * Data functions
     */

    //other more interesting functions
    //gets the schedule key for today, the lazy way of course
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
                let req: IDBRequest = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
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
