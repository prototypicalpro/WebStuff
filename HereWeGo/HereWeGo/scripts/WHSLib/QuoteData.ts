/**
 * Quote data getter class
 */

import UIUtil = require('../UILib/UIUtil');

class QuoteData implements UIUtil.QuoteHandle {
    //storage db
    private readonly db: IDBDatabase;
    //storage name
    private readonly name: string;
    //storage key
    private readonly key: number;
    //constructor
    constructor(db: IDBDatabase, name: string, key: number) {
        this.db = db;
        this.name = name;
        this.key = key;
    }
    //and UI magic!
    getQuote(objs: Array<UIUtil.QuoteParams>): Promise<any> {
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(this.key);
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then((data: any) => {
            //fill all the thangs with quotes
            for (let i = 0, len = objs.length; i < len; i++) objs[i].storeQuote(data.target.result);
        }).catch((err) => {
            console.log(err);
        });
    }
}

export = QuoteData;