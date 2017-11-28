define(["require", "exports", "../UILib/UIUtil"], function (require, exports, UIUtil) {
    "use strict";
    class QuoteDataManage {
        constructor() {
            this.dataType = 1;
            this.dataKey = 'quoteData';
            this.dbInfo = {
                storeName: 'quote',
                keyPath: 'key',
                keys: ['quote', 'author'],
            };
            this.key = 0;
        }
        setDB(db) { this.db = db; }
        overwriteData(data) {
            data.key = this.key;
            let objectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
            return new Promise((resolve, reject) => {
                let req = objectStore.put(data);
                req.onsuccess = resolve;
                req.onerror = reject;
            });
        }
        updateData(data) {
            if (!Array.isArray(data))
                return this.overwriteData(data).then(() => { return true; });
            return false;
        }
        getData() {
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([this.dbInfo.storeName], 'readonly').objectStore(this.dbInfo.storeName).get(this.key);
                req.onsuccess = (evt) => { resolve(evt.target.result); };
                req.onerror = reject;
            });
        }
    }
    return QuoteDataManage;
});
//# sourceMappingURL=QuoteDataManage.js.map