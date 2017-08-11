/*
 * Class and function which simplify management of schedule objects
 * and creation from the cloud data
 */

import DataInterface = require("./DataInterface");
import { SCHED_DB_NAME } from './CacheKeys';
import StoreSchedUtil = require('./StoreSchedUtil');
import ScheduleData = require('./ScheduleData');

//class which takes all that raw nonsense and turns it into abstraction
class SchedDataManage implements DataInterface {
    dataKey: string = 'schedSyncData';

    //database!
    private db: IDBDatabase;

    init(): Promise<any> {
        //init indexedDB, but wrapped up the arse with promises
        return new Promise((resolve, reject) => {
            //TODO: Uh Oh
            if (!window.indexedDB) return reject(false);
            let req = window.indexedDB.open(SCHED_DB_NAME);
            //we win!
            req.onsuccess = resolve;
            //we lose!
            req.onerror = reject;
            //we build!
            req.onupgradeneeded = (evt: any) => {
                console.log("Sched DB upgrading");
                //create the event storage
                let store: IDBObjectStore = evt.currentTarget.result.createObjectStore(SCHED_DB_NAME, { keyPath: 'key' });

                //and create all the searchable stuffums
                //IMPORTANT: update SCHED_KEYS everytime you change the EventInterface, otherwise
                //it won't store the extra data
                for (let i = 0, len = StoreSchedUtil.SCHED_KEYS.length; i < len; i++) store.createIndex(StoreSchedUtil.SCHED_KEYS[i], StoreSchedUtil.SCHED_KEYS[i]);
            };
        }).then((evt: any) => {
            console.log("Sched Opened DB!");
            this.db = evt.target.result;
        });
    }

    //this update function is simple: if we got data, overwrite
    updataData(data: any): void {
        //cast
        data = data as Array<StoreSchedUtil.StoreSchedule>;
        //do marginal checking
        if (data.length > 0) this.overwriteData(data);
    }

    //same as update, but we don't do any checking
    overwriteData(data: any): void {
        //cast
        data = data as Array<StoreSchedUtil.StoreSchedule>;
        let objectStore = this.db.transaction([SCHED_DB_NAME], "readwrite").objectStore(SCHED_DB_NAME);
        let thing: Promise<any> = new Promise((resolve, reject) => {
            //delete the whole database
            let req = objectStore.clear();
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then(() => {
            //fill our object store with the new schedule
            let ray: Array<Promise<any>> = [];
            for (let i = 0, len = data.length; i < len; i++) {
                ray.push(new Promise((resolve, reject) => {
                    let req = objectStore.add(data[i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
            }
            return Promise.all(ray);
        });
    }

    //get the utility class and send it to the super class
    getData(): ScheduleData {
        return new ScheduleData(this.db);
    }
}

export = SchedDataManage;