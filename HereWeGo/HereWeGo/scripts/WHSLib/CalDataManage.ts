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
const EVENT_KEYS = ['isAllDay', 'startTime', 'endTime', 'dayString', 'name'];

class CalDataManage implements DataInterface {
    dataKey: string = 'calSyncData';
    private usingDB: boolean;

    private crappyEvents: Array<EventInterface>;
    private db: IDBDatabase;

    init(): Promise<any> {
        //init indexedDB, but wrapped up the arse with promises
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(false);
            //if (window.indexedDB) return reject(false);
            this.usingDB = true;

            let req = window.indexedDB.open(CAL_DB_NAME);
            //we win!
            req.onsuccess = resolve;
            //we lose!
            req.onerror = reject;
            //we build!
            req.onupgradeneeded = (evt: any) => {
                console.log("DB upgrading");
                //create the event storage
                let store: IDBObjectStore = evt.currentTarget.result.createObjectStore(CAL_DB_NAME, { keyPath: 'id' });

                //and create all the searchable stuffums
                //IMPORTANT: update EVENT_KEYS everytime you change the EventInterface, otherwise
                //it won't store the extra data
                for (let i = 0, len = EVENT_KEYS.length; i < len; i++) store.createIndex(EVENT_KEYS[i], EVENT_KEYS[i]);
            };
        }).then((evt: any) => {
            console.log("Opened DB!");
            this.db = evt.target.result;
        }, (err) => {
            //guess we're not using indexedDB then
            console.log("Using localforage for calendar!");
            console.log(err);
            this.usingDB = false;
            this.crappyEvents = [];
        });
    }

    loadData(): Promise<any> {
        //if using DB, we can assume that the calendar database is already fine
        if (this.usingDB) return new Promise((resolve) => { return resolve(); });
        //but if not, better check localforage
        else {
            return localforage.getItem(CAL_CACHE_KEY).then((data: Array<EventInterface>) => {
                if (data === null) return Promise.reject("No stored calendar!");
                this.crappyEvents = data;
            });
        }
    }

    updataData(data: any): void {
        //if it's indexedDB, this should be pretty easy
        //if not, oh well
        data = data as Array<EventInterface>;
        //add a column for the daystring, because I'm sick of searching with new Date()
        data.map((event: EventInterface) => {
            event.dayString = new Date(event.startTime).toDateString();
            return data;
        });
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
                        if (new Date(cursor.value.startTime).getTime() < nowTime) cursor.delete();
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
                        let event: EventInterface = data[i];
                        event.dayString = new Date(event.startTime).toDateString();
                        let req = objectStore.put(event);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
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
            for (let i = this.crappyEvents.length - 1; i >= 0 ; i--) {
                if (new Date(this.crappyEvents[i].startTime).getTime() < nowTime) this.crappyEvents.splice(i, 1);
                //gawd this is terrible
            }
            //then nest a bunch of for loops to update every event
            //for every updated event
            for (let i = data.length - 1; i >= 0; i--) {
                //check against every stored event for an id match
                for (let j = this.crappyEvents.length - 1; j >= 0; j--) {
                    if (data[i].id === this.crappyEvents[j].id) {
                        //if cancelled, delete, else update
                        if ('cancelled' in data[i]) this.crappyEvents.splice(j, 1);
                        else {
                            this.crappyEvents[j] = data[i];
                            this.crappyEvents[j].dayString = new Date(this.crappyEvents[j].startTime).toDateString();
                        }
                        data.splice(i, 1);
                        break;
                    }
                }
            }
            //drop every other element leftover into crappyEvents
            for (let i = 0, len = data.length; i < len; i++) {
                data[i].dayString = new Date(data[i].startTime).toDateString();
                this.crappyEvents.push(data[i]);
            }
            //store everything we just did
            localforage.setItem(CAL_CACHE_KEY, this.crappyEvents);
        }
    }

    overwriteData(data: any): void {
        //cast
        data = data as Array<EventInterface>;
        //crappy nonsense
        data.map((event: EventInterface) => {
            event.dayString = new Date(event.startTime).toDateString();
            return data;
        });
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
            let req: IDBRequest = this.db.transaction([CAL_DB_NAME], "readonly").objectStore(CAL_DB_NAME).index('dayString').openCursor(IDBKeyRange.only(day.toDateString()));
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    cursorFunc(cursor.value);
                    cursor.continue();
                }
                else return;
            };
        }
        //or maybe not, that's kinda complicated
        else {
            let thing: Promise<any> = new Promise(() => {
                let dateString: string = day.toDateString();
                for (let i = 0, len = this.crappyEvents.length; i < len; i++) {
                    if (this.crappyEvents[i].dayString === dateString) cursorFunc(this.crappyEvents[i]);
                }
            });
        }
    }
}

export = CalDataManage;