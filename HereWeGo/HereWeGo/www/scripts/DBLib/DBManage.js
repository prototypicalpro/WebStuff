define(["require", "exports"], function (require, exports) {
    "use strict";
    var DBManage;
    (function (DBManage) {
        const dbName = 'nope';
        const dbVersion = 3;
        DBManage.constructDB = (args) => {
            let isUpgraded;
            let dbs = args.concat.apply([], args).filter((dbInf) => { return dbInf; });
            return new Promise((resolve, reject) => {
                if (!window.indexedDB)
                    return reject(false);
                let req = window.indexedDB.open(dbName, dbVersion);
                req.onsuccess = resolve;
                req.onerror = reject;
                req.onupgradeneeded = (evt) => {
                    isUpgraded = true;
                    for (let i = 0, len = dbs.length; i < len; i++) {
                        try {
                            evt.currentTarget.result.deleteObjectStore(dbs[i].storeName);
                        }
                        catch (e) { }
                    }
                    for (let i = 0, len = dbs.length; i < len; i++) {
                        let store = evt.currentTarget.result.createObjectStore(dbs[i].storeName, { keyPath: dbs[i].keyPath });
                        for (let o = 0, len1 = dbs[i].keys.length; o < len1; o++)
                            store.createIndex(dbs[i].keys[o], dbs[i].keys[o]);
                    }
                };
            }).then((evt) => {
                if (isUpgraded)
                    return [evt.target.result, isUpgraded];
                return evt.target.result;
            });
        };
    })(DBManage || (DBManage = {}));
    return DBManage;
});
//# sourceMappingURL=DBManage.js.map