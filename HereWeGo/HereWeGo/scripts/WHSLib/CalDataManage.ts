/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB, but if not will fallback to serializing things
 * with localforage
 */

//TODO: update gscript to handle event cancellations
//also idk if any of this works yet, so test

import localforage = require('localforage');
import DataInterface = require('./DataInterface');
import EventInterface = require('./EventInterface');
import { CAL_DB_NAME, CAL_CACHE_KEY } from './CacheKeys';

//special consant for a special situation
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'name'];

class CalDataManage implements DataInterface {
    dataKey: string = 'calSyncData';
    private usingDB: boolean;

    private crappyEvents: Array<EventInterface>;
    private db: IDBDatabase;

    loadData(): Promise<any> {
        //init indexedDB, but wrapped up the arse with promises
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(false);
            this.usingDB = true;

            let req = window.indexedDB.open(CAL_DB_NAME);
            //we win!
            req.onsuccess = (evt) => {
                console.log("Opened DB!");
                resolve(req.result);
            };
            //we lose!
            req.onerror = (err: any) => {
                console.error("OpenDB error:", err.target.errorCode);
                reject(false);
            };
            //we build!
            req.onupgradeneeded = (evt: any) => {
                console.log("DB upgrading");
                //create the event storage
                let store: IDBObjectStore = evt.currentTarget.result.createObjectStore(CAL_DB_NAME, { keyPath: 'id' });

                //and create all the searchable stuffums
                //IMPORTANT: update EVENT_KEYS everytime you change the EventInterface, otherwise
                //it won't store the extra data
                for (let i = 0, len = EVENT_KEYS.length; i < len; i++) store.createIndex(EVENT_KEYS[i], EVENT_KEYS[i]);

                //reject the promise because no more calendar data
                reject("No stored calendar!");
            };
        }).catch((err) => {
            //catch only indexedDB errors, not missing calendar errors
            if (err === false) {
                //guess we're not using indexedDB then
                console.log("Using localforage for calendar!");
                this.usingDB = false;
                //start up localforage, we're doing it the crappy way
                return localforage.getItem(CAL_CACHE_KEY).then((data: any) => {
                    if (data === null) return Promise.reject("No stored calendar!");
                    this.crappyEvents = data;
                });
            }
            console.log(err);
            Promise.reject(err);
        });
    }

    updataData(data: any): void {
        //if it's indexedDB, this should be pretty easy
        //if not, oh well
        data = data as Array<EventInterface>;
        if (this.usingDB) {
            let objectStore = this.db.transaction([CAL_DB_NAME], "readwrite").objectStore(CAL_DB_NAME);
            //iterate through all elements, removing the ones before today
            let nowDay: Date = new Date();
            nowDay.setHours(0, 0, 0, 0);
            let nowTime: number = nowDay.getTime();
            objectStore.openCursor().onsuccess = (event: any) => {
                let cursor = event.target.result as IDBCursorWithValue;
                if (cursor) {
                    //remove if old
                    if (cursor.value.startTime.getTime() < nowTime) cursor.delete();
                    cursor.continue();
                }
            }
            //then do a buncha quuuueirereis to update the database entries
            for (let i = 0, len = data.length; i < len; i++) {
                if ('cancelled' in data[i]) objectStore.delete(data[i].id);
                else objectStore.put(data[i]);
            }
        }
    }

    overwriteData(data: any): void {
        throw new Error('Method not implemented.');
    }
}

export = CalDataManage;