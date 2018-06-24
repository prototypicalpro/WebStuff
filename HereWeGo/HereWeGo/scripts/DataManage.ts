/*
 * Library which syncs local objects (Calendar, schedule, etc.) to the
 * cloud ones stored in a google script somewhere
 *
 * Also parses and formats data recieved to be computer readable and easier to
 * work with
 *
 * Based mostly on Promises
 * Also this is the only place where localstorage is acceptable
 */

import GetLib = require('./GetLib/GetLib');
import DataInterface = require('./WHSLib/Interfaces/DataInterface');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import DBManage = require('./DBLib/DBManage');
import ErrorUtil = require('./ErrorUtil');
import UIUtil = require('./UILib/UIUtil');

class DataManage {
    //url
    public static readonly URL: string = 'https://script.google.com/macros/s/AKfycbz6fvkMDcKzdOdHuXzJucC-gsI4F_c0Y_DfuMaXuKzfKavGQBve/exec';
    //private members
    private http: GetLib;
    private dataObj: Array<DataInterface>;
    private lastSyncTime: number;

    /*
     * Stupid promise chaining functions
     */

    private getData(): Promise<any> { return this.getS(DataManage.URL, { syncTime: this.lastSyncTime, }); }

    private getNewDataFunc(): Promise<any> { return this.getS(DataManage.URL, {}); }

    /*
     * Other utility functions
     */

    private getS(URL: string, params: any): Promise<Object> {
        return this.http.get(URL, params).then((data) => {
            //update sync time
            this.lastSyncTime = Date.now();
            localStorage.setItem("1", this.lastSyncTime.toString());
            return data;
        });
    }

    private updateData(data: Object): Promise<Array<boolean>> {
        let ret: Array<Promise<boolean> | false> = [];
        for (let i = 0, len = this.dataObj.length; i < len; i++)
            ret.push(this.dataObj[i].updateData(data[this.dataObj[i].dataKey]));
        return Promise.all(ret);
    }

    private overwriteData(data: Object): Promise<Array<any>> {
        let ret: Array<Promise<any>> = [];
        for (let i = 0, len = this.dataObj.length; i < len; i++)
            ret.push(this.dataObj[i].overwriteData(data[this.dataObj[i].dataKey]));
        return Promise.all(ret);
    }

    /*
     * Actual exposed functions
     */

    constructor(dataThings: Array<DataInterface>, http: GetLib) {
        //reindex the dataThings array by thier type
        //just in case
        let ray = new Array(UIUtil.RecvType.length);
        for (let i = 0, len = dataThings.length; i < len; i++) ray[dataThings[i].dataType] = dataThings[i];
        this.dataObj = ray;
        this.http = http;
    }

    //attempts to load cached data, throw exception if any data is missing
    initData(): Promise<any> {
        //init all the things
        let ray: Array<Promise<any>> = [
            new Promise(resolve => {
                //load last sync time from storage
                let lastSync = localStorage.getItem('1');
                if (!lastSync) return resolve(true);
                this.lastSyncTime = parseInt(lastSync);
                return resolve();
            }),
            DBManage.constructDB(this.dataObj.map(data => data.dbInfo)).then((dbThings: IDBDatabase | Array<IDBDatabase | boolean>) => {
                let db: IDBDatabase;
                if (Array.isArray(dbThings)) db = <IDBDatabase>dbThings[0];
                else db = <IDBDatabase>dbThings;
                for (let i = 0, len = this.dataObj.length; i < len; i++) if(this.dataObj[i]) this.dataObj[i].setDB(db);
                //check for no stored
                if (Array.isArray(dbThings) && dbThings[1]) return true;
            })
        ];
        return Promise.all(ray).then((noStored: Array<boolean | false>) => { if(noStored[0] || noStored[1]) throw ErrorUtil.code.NO_STORED; });
    }

    //gets new data and overwrited any old data
    getNewData(): Promise<any> {
        console.log("New data");
        return this.getNewDataFunc().then(this.overwriteData.bind(this));
    }

    refreshData(): Promise<Array<boolean>> {
        return this.getData().then(this.updateData.bind(this));
    }

    /**
     * Generate data needed by UI objects (specified in recv params) then
     * return it to be used by main code
     * Call this anytime you want to change what the UI is displaying
     */

    generateData(items: Array<UIUtil.UIItem>): Promise<Array<any>> {
        return Promise.all(this.dataObj.map(obj => obj.getData(items)));
    }

    //TODO: Apply data to specific item so we don't have to figure it out at launch
}

export = DataManage