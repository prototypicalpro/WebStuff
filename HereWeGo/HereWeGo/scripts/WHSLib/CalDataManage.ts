/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB
 */

//TODO: update gscript to handle event cancellations
//also idk if any of this works yet, so test

import DataInterface = require('./DataInterface');
import EventInterface = require('./EventInterface');
import EventData = require('./EventData');
import DBManage = require('../DBLib/DBManage');

//special consant for a special situation
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'title', 'schedule'];

class CalDataManage implements DataInterface {
    readonly dataKey: string = 'calSyncData';
    //database info
    readonly dbInfo: DBManage.DBInfoInterface = {
        storeName: 'cal',
        keyPath: 'id',
        keys: EVENT_KEYS
    }
    //database
    private db: IDBDatabase;
    //setDB func
    setDB(db: IDBDatabase) { this.db = db; }
    //yeah
    updataData(cloud: any): Promise<boolean> | false {
        //if it's indexedDB, this should be pretty easy
        let data: Array<EventInterface> = this.inflateEventData(cloud);
        let objectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
        //moar promises!
        return new Promise((resolve, reject) => {
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
                else resolve();
            };
        }).then(() => {
            //then do a buncha quuuueirereis to update the database entries
            //but put it all in promises just to be sure
            let ray: Array<Promise<any>> = [];
            for (let i = 0, len = data.length; i < len; i++) {
                if ('cancelled' in data[i]) ray.push(new Promise((resolve, reject) => {
                    let req = objectStore.delete(data[i].id);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
                else ray.push(new Promise((resolve, reject) => {
                    let req = objectStore.put(data[i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
            }
            return Promise.all(ray);
        }).then(() => { return data.length > 0; }); 
        //return if we got a data array
    }

    overwriteData(cloud: any): Promise<any> {
        //cast
        let data: Array<EventInterface> = this.inflateEventData(cloud);
        let objectStore: IDBObjectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
        //promises! yay!
        return new Promise((resolve, reject) => {
            //clear object store
            let req: IDBRequest = objectStore.clear();
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then(() => {
            //fill it with the new datums
            let ray: Array<Promise<any>> = [];
            for (let i = 0, len = data.length; i < len; i++) {
                ray.push(new Promise((resolve, reject) => {
                    let req = objectStore.add(data[i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
            }
            //and run them all
            return Promise.all(ray);
        });
    }

    //return that database thingymajigger
    getData() { return new EventData(this.db, this.dbInfo.storeName); }

    //private utility function to uncompress data from the cloud
    private inflateEventData(data: Array<Array<any>>): Array<EventInterface> {
        return data.map((ray) => {
            return {
                id: ray[0],
                schedule: ray[1],
                title: ray[2],
                startTime: ray[3],
                endTime: ray[4],
                isAllDay: ray[5],
            };
        });
    }
}

export = CalDataManage;
