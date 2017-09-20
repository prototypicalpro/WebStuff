/*
 * API for storing a quote of the day using indexedDB
 * fairly simple
 */

import DataInterface = require('./DataInterface');
import QuoteDataInterface = require('./QuoteDataInterface');
import QuoteData = require('./QuoteData');
import DBManage = require('../DBLib/DBManage');

class QuoteDataManage implements DataInterface {
    //data key for recieved data
    readonly dataKey: string = 'quoteData';
    //database info
    readonly dbInfo: DBManage.DBInfoInterface = {
        storeName: 'quote',
        keyPath: 'key',
        keys: ['quote', 'author'],
    }
    //single data key, cuz we only need one
    private readonly key: number = 0;

    //data array is presumed to only have one entry
    overwriteData(db: IDBDatabase, data: any): Promise<any> {
        //add the key object to the data
        data.key = this.key;
        //overwrite the entire database with the data
        let objectStore = db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
        return new Promise((resolve, reject) => {
            //replace the whole database with what we recieved
            let req = objectStore.put(data);
            req.onsuccess = resolve;
            req.onerror = reject;
        });
    }

    //update data does same thing cuz I was lazy in the backend
    updataData(db: IDBDatabase, data: any): Promise<boolean> | false {
        if (!Array.isArray(data)) return this.overwriteData(db, data).then(() => { return true; });
        return false; //I LOVE JAVASCRIPT
    }

    //get data returns the quoteData obj
    getData(db: IDBDatabase): any {
        return new QuoteData(db, this.dbInfo.storeName, this.key);
    }
}

export = QuoteDataManage;