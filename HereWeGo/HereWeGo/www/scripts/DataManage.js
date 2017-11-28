define(["require", "exports", "./DBLib/DBManage", "./ErrorUtil", "./UILib/UIUtil"], function (require, exports, DBManage, ErrorUtil, UIUtil) {
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
            let ray = new Array(3);
            for (let i = 0, len = dataThings.length; i < len; i++)
                ray[dataThings[i].dataType] = dataThings[i];
            this.dataObj = ray;
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
        setUIObjs(obj) {
            this.uiItemStore = obj;
            this.paramStore = new Array(3).fill([]);
            for (let i = 0, len = obj.length; i < len; i++)
                if (obj[i].recvParams)
                    for (let o = 0, len1 = obj[i].recvParams.length; o < len1; o++)
                        this.paramStore[obj[i].recvParams[o].type].push(obj[i].recvParams[o]);
        }
        initUI() {
            return Promise.all(this.dataObj.map((obj, index) => { return obj.getData(this.paramStore[index]); })).then((dataRay) => { for (let i = 0, len = this.uiItemStore.length; i < len; i++) {
                this.uiItemStore[i].onInit(dataRay);
                this.uiItemStore[i].buildJS();
            } });
        }
        refreshUI() {
            return Promise.all(this.dataObj.map((obj, index) => { return obj.getData(this.paramStore[index]); })).then((dataRay) => { for (let i = 0, len = this.uiItemStore.length; i < len; i++)
                this.uiItemStore[i].onUpdate(dataRay); });
        }
    }
    return DataManage;
});
//# sourceMappingURL=DataManage.js.map