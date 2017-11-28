define(["require", "exports"], function (require, exports) {
    "use strict";
    class QuoteData {
        constructor(db, name, key) {
            this.db = db;
            this.name = name;
            this.key = key;
        }
        getQuote(objs) {
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([this.name], 'readonly').objectStore(this.name).get(this.key);
                req.onsuccess = resolve;
                req.onerror = reject;
            }).then((data) => {
                for (let i = 0, len = objs.length; i < len; i++)
                    objs[i].storeQuote(data.target.result);
            }).catch((err) => {
                console.log(err);
            });
        }
    }
    return QuoteData;
});
//# sourceMappingURL=QuoteData.js.map