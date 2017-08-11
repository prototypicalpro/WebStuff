/* 
 * API for storing and parsing the Calendar Data in a database
 * so that it actually performs well
 * By default will use an indexedDB, but if not will fallback to serializing things
 * with localforage
 */

//TODO: update gscript to handle event cancellations
//also idk if any of this works yet, so test

import DataInterface = require('./DataInterface');
import EventInterface = require('./EventInterface');
import { CAL_DB_NAME } from './CacheKeys';
import EventData = require('./EventData');

//special consant for a special situation
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'title', 'schedule'];

class CalDataManage implements DataInterface {
    dataKey: string = 'calSyncData';

    private db: IDBDatabase;

    init(): Promise<any> {
        //init indexedDB, but wrapped up the arse with promises
        return new Promise((resolve, reject) => {
            //TODO: Uh Oh
            if (!window.indexedDB) return reject(false);
            let req = window.indexedDB.open(CAL_DB_NAME);
            //we win!
            req.onsuccess = resolve;
            //we lose!
            req.onerror = reject;
            //we build!
            req.onupgradeneeded = (evt: any) => {
                console.log("Cal DB upgrading");
                //create the event storage
                let store: IDBObjectStore = evt.currentTarget.result.createObjectStore(CAL_DB_NAME, { keyPath: 'id' });

                //and create all the searchable stuffums
                //IMPORTANT: update EVENT_KEYS everytime you change the EventInterface, otherwise
                //it won't store the extra data
                for (let i = 0, len = EVENT_KEYS.length; i < len; i++) store.createIndex(EVENT_KEYS[i], EVENT_KEYS[i]);
            };
        }).then((evt: any) => {
            console.log("Opened Cal DB!");
            this.db = evt.target.result;
        });
    }

    updataData(data: any): void {
        //if it's indexedDB, this should be pretty easy
        data = data as Array<EventInterface>;
        let objectStore = this.db.transaction([CAL_DB_NAME], "readwrite").objectStore(CAL_DB_NAME);
        //moar promises!
        let thing: Promise<any> = new Promise((resolve, reject) => {
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
        }); 
    }

    overwriteData(data: any): void {
        //cast
        data = data as Array<EventInterface>;
        let objectStore: IDBObjectStore = this.db.transaction([CAL_DB_NAME], "readwrite").objectStore(CAL_DB_NAME);
        //promises! yay!
        let thing: Promise<any> = new Promise((resolve, reject) => {
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

    //get the object which handles event parsing and such, and send it off to the superclass
    getData(): EventData { return new EventData(this.db); }
}

export = CalDataManage;