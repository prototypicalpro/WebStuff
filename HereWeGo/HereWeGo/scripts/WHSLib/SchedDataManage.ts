/*
 * Class and function which simplify management of schedule objects
 * and creation from the cloud data
 */

import DataInterface = require("./DataInterface");
import DBManage = require('../DBLib/DBManage');
import { SCHED_DB_NAME } from './CacheKeys';
import StoreSchedUtil = require('./StoreSchedUtil');
import ScheduleData = require('./ScheduleData');

//class which takes all that raw nonsense and turns it into abstraction
class SchedDataManage implements DataInterface {
    //data key for Web API
    readonly dataKey: string = 'schedSyncData';
    //database info
    readonly dbInfo: DBManage.DBInfoInterface = {
        storeName: 'sched',
        keyPath: 'key',
        keys: StoreSchedUtil.SCHED_KEYS
    };

    //same as update, but we don't do any checking
    overwriteData(db: IDBDatabase, data: any): void {
        //cast
        data = data as Array<StoreSchedUtil.StoreSchedule>;
        let objectStore = db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
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

    //this update function is simple: if we got data, overwrite
    updataData(db: IDBDatabase, data: any): boolean {
        //cast
        data = data as Array<StoreSchedUtil.StoreSchedule>;
        //do marginal checking
        if (data.length > 0) {
            this.overwriteData(db, data);
            return true;
        }
        return false;
    }

    //get the utility class and send it to the super class
    getData(db: IDBDatabase): ScheduleData { return new ScheduleData(db, this.dbInfo.storeName); }
}

export = SchedDataManage;