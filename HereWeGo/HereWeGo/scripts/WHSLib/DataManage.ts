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

import GetLib = require('../GetLib/GetLib');
import DataInterface = require('./DataInterface');
import ScheduleUtil = require('./ScheduleUtil');
import DBManage = require('../DBLib/DBManage');
import ErrorUtil = require('../ErrorUtil');
import { TIME_CACHE_KEY } from './CacheKeys';

const URL: string = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';

class DataManage {
    private http: GetLib;
    private dataObj: Array<DataInterface>;
    private db: IDBDatabase;
    private lastSyncTime: number;
    /*
     * Stupid promise chaining functions
     */

    private getData(): Promise<Object> { return this.getS(URL + '?syncTime=' + this.lastSyncTime); }

    private getNewDataFunc(): Promise<Object> { return this.getS(URL); }

    /*
     * Other utility functions
     */

    private getS(URL: string): Promise<Object> {
        return this.http.get(URL).then((data) => {
            //update sync time
            this.lastSyncTime = Date.now();
            localStorage.setItem(TIME_CACHE_KEY, this.lastSyncTime.toString());
            return data;
        });
    }

    private updateData(data: Object): Promise<Array<boolean>> {
        let ret: Array<Promise<boolean> | false> = [];
        for (let i = 0, len = this.dataObj.length; i < len; i++)
            if (this.dataObj[i].dataKey in data) ret.push(this.dataObj[i].updataData(this.db, data[this.dataObj[i].dataKey]));
        return Promise.all(ret);
    }

    private overwriteData(data: Object): Promise<Array<any>> {
        let ret: Array<Promise<any>> = [];
        for (let i = 0, len = this.dataObj.length; i < len; i++)
            if (this.dataObj[i].dataKey in data) ret.push(this.dataObj[i].overwriteData(this.db, data[this.dataObj[i].dataKey]));
        return Promise.all(ret);
    }

    /*
     * Actual exposed functions
     */

    constructor(dataThings: Array<DataInterface>) {
        this.dataObj = dataThings
    }

    //attempts to load cached data, throw exception if any data is missing
    initData(): Promise<any> {
        //init all the things
        let ray: Array<Promise<any>> = [
            new Promise((resolve, reject) => {
                //load last sync time from storage
                let lastSync = localStorage.getItem(TIME_CACHE_KEY);
                if (!lastSync) throw ErrorUtil.code.NO_STORED;
                this.lastSyncTime = parseInt(lastSync);
                return resolve();
            }),
            DBManage.constructDB(this.dataObj.map((data) => { return data.dbInfo; })).then((db: IDBDatabase) => { this.db = db })
        ];
        return Promise.all(ray);
    }

    //starts up HTTP, in a seperate function so I can do stuff without cordova first
    //MUST CALL BEFORE ANY INTERNET STUFF
    initHTTP(): void {
        this.http = new GetLib();
        if (!this.http.initAPI()) {
            console.log("http failed");
            throw ErrorUtil.code.HTTP_FAIL;
        }
    }

    //gets new data and overwrited any old data
    getNewData(): Promise<any> {
        return this.getNewDataFunc().then(this.overwriteData.bind(this));
    }

    refreshData(): Promise<Array<boolean>> {
        return this.getData().then(this.updateData.bind(this));
    }

    //returns the subclasses defined by each module, where the application can then acess the data
    returnData(index: number = -1): Array<any> | any {
        if (index === -1) return this.dataObj.map((sub) => { return sub.getData(this.db) });
        else return this.dataObj[index].getData(this.db);
    }
}

export = DataManage