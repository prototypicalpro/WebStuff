define(["require", "exports"], function (require, exports) {
    "use strict";
    class SyncableCache {
        setDB(db) { this.db = db; }
        updateData(data) {
            if (this.inflateCloudData)
                data = this.inflateCloudData(data);
            let objectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
            let nextFunc = () => {
                let ray = [];
                for (let i = 0, len = data.length; i < len; i++) {
                    if ('cancelled' in data[i])
                        ray.push(new Promise((resolve, reject) => {
                            let req = objectStore.delete(data[i][this.dbInfo.keyPath]);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }));
                    else
                        ray.push(new Promise((resolve, reject) => {
                            let req = objectStore.put(data[i]);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }));
                }
                return Promise.all(ray).then(() => { return data.length > 0; });
            };
            if (this.prune)
                return this.prune(objectStore).then(nextFunc);
            else
                return nextFunc();
        }
        overwriteData(data) {
            if (this.inflateCloudData)
                data = this.inflateCloudData(data);
            let objectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
            return new Promise((resolve, reject) => {
                let req = objectStore.clear();
                req.onsuccess = resolve;
                req.onerror = reject;
            }).then(() => {
                let ray = [];
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
    }
    return SyncableCache;
});
//# sourceMappingURL=SyncableCache.js.map