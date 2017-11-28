define(["require", "exports", "./StoreSchedUtil", "./ScheduleData"], function (require, exports, StoreSchedUtil, ScheduleData) {
    "use strict";
    class SchedDataManage {
        constructor() {
            this.dataKey = 'schedSyncData';
            this.dbInfo = {
                storeName: 'sched',
                keyPath: 'key',
                keys: StoreSchedUtil.SCHED_KEYS
            };
        }
        setDB(db) { this.db = db; }
        overwriteData(data) {
            data = data;
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
        updataData(data) {
            data = data;
            if (data.length > 0)
                return this.overwriteData(data).then(() => { return true; });
            return false;
        }
        getData() { return new ScheduleData(this.db, this.dbInfo.storeName); }
    }
    return SchedDataManage;
});
//# sourceMappingURL=SchedDataManage.js.map