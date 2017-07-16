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
            //moar promises!
            let thing: Promise<any> = new Promise((resolve, reject) => {
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
                        let req = objectStore.put(data[i].id);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));;
                }
                return Promise.all(ray);
            }); 
        }
        //the crappy workaround part
        else {
            //we just put everything in memory, and for loop the crap out of it
            //iterate through all elements, removing ones before today
            let nowDay: Date = new Date();
            nowDay.setHours(0, 0, 0, 0);
            let nowTime: number = nowDay.getTime();
            for (let i = 0, len = this.crappyEvents.length; i < len; i++) {
                if (this.crappyEvents[i].startTime.getTime() < nowTime) {
                    delete this.crappyEvents[i];
                    //gawd this is terrible
                    //we remove a spot from the array, so we have to do this as well
                    i--;
                    len--;
                }
            }
            //then nest a bunch of for loops to update every event
            //for every updated event
            for (let i = 0, len = data.length; i < len; i++) {
                //check against every stored event for an id match
                for (let j = 0, len2 = this.crappyEvents.length; j < len2; j++) {
                    if (data[i].id === this.crappyEvents[j].id) {
                        //if cancelled, delete, else update
                        if ('cancelled' in data[i]) delete this.crappyEvents[j];
                        else this.crappyEvents[j] = data[i];
                        break;
                    }
                }
            }
            //store everything we just did
            localforage.setItem(CAL_CACHE_KEY, this.crappyEvents);
        }
    }

    overwriteData(data: any): void {
        //cast
        data = data as Array<EventInterface>;
        //check the storage mediums
        if (this.usingDB) {
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
        //else memory it again
        else {
            this.crappyEvents = data;
            localforage.setItem(CAL_CACHE_KEY, this.crappyEvents);
        }
    }

    //other more interesting functions
    getEvents(day: Date, cursorFunc: (event: EventInterface) => void): void{
        //this is where the db should pay off
        if (this.usingDB) {
            let thing: Promise<any> = new Promise((resolve, reject) => {
                //only cursor through items with correct day
                let req: IDBRequest = this.db.transaction([CAL_DB_NAME], "readonly").objectStore(CAL_DB_NAME).index('startTime').openCursor(IDBKeyRange.only(day.toDateString()));
                req.onsuccess = (event: any) => {
                    let cursor: IDBCursorWithValue = event.target.result;
                    if (cursor) {
                        cursorFunc(cursor.value);
                        cursor.continue();
                    }
                    else resolve();
                }
                req.onerror = reject;
            });
        }
        //or maybe not, that's kinda complicated
        else {
            let thing: Promise<any> = new Promise(() => {
                let dateString: string = day.toDateString();
                for (let i = 0, len = this.crappyEvents.length; i < len; i++) 
                    if (this.crappyEvents[i].startTime.toDateString() === dateString) cursorFunc(this.crappyEvents[i]);
            });
        }
    }
}

export = CalDataManage;