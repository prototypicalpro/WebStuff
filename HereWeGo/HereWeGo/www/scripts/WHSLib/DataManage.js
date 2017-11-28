define(["require", "exports", "../DBLib/DBManage", "../ErrorUtil"], function (require, exports, DBManage, ErrorUtil) {
    "use strict";
    const URL = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';
    class DataManage {
        getData() { return this.getS(URL + '?syncTime=' + this.lastSyncTime); }
        getNewDataFunc() { return this.getS(URL); }
        getS(URL) {
            return this.http.get(URL).then((data) => {
                this.lastSyncTime = Date.now();
                localStorage.setItem("1", this.lastSyncTime.toString());
                return data;
            });
        }
        updateData(data) {
            let ret = [];
            for (let i = 0, len = this.dataObj.length; i < len; i++)
                ret.push(this.dataObj[i].updateData(data[this.dataObj[i].dataKey]));
            return Promise.all(ret);
        }
        overwriteData(data) {
            let ret = [];
            for (let i = 0, len = this.dataObj.length; i < len; i++)
                ret.push(this.dataObj[i].overwriteData(data[this.dataObj[i].dataKey]));
            return Promise.all(ret);
        }
        constructor(dataThings, http) {
            this.dataObj = dataThings;
            this.http = http;
        }
        initData() {
            let ray = [
                new Promise((resolve, reject) => {
                    let lastSync = localStorage.getItem('1');
                    if (!lastSync)
                        throw ErrorUtil.code.NO_STORED;
                    this.lastSyncTime = parseInt(lastSync);
                    return resolve();
                }),
                DBManage.constructDB(this.dataObj.map((data) => { return data.dbInfo; })).then((dbThings) => {
                    let db;
                    if (Array.isArray(dbThings))
                        db = dbThings[0];
                    else
                        db = dbThings;
                    for (let i = 0, len = this.dataObj.length; i < len; i++)
                        this.dataObj[i].setDB(db);
                    if (Array.isArray(dbThings) && dbThings[1])
                        throw ErrorUtil.code.NO_STORED;
                })
            ];
            return Promise.all(ray);
        }
        getNewData() {
            return this.getNewDataFunc().then(this.overwriteData.bind(this));
        }
        refreshData() {
            return this.getData().then(this.updateData.bind(this));
        }
    }
    return DataManage;
});
//# sourceMappingURL=DataManage.js.map