/*
 * Library which syncs local objects (Calendar, schedule, etc.) to the
 * cloud ones stored in a google script somewhere
 *
 * Also parses and formats data recieved to be computer readable and easier to
 * work with
 *
 * Based mostly on Promises because localforage
 */

import localForage = require("localforage");
import GetLib = require('../GetLib/GetLib');
import DataInterface = require('./DataInterface');
import ScheduleUtil = require('./ScheduleUtil');
import { TIME_CACHE_KEY, SCHED_CACHE_KEY, CAL_CACHE_KEY } from './CacheKeys';

const URL: string = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';

class DataManage {
    private http: GetLib;
    private dataObj: Array<DataInterface>;

    private lastSyncTime: number;

    /*
     * Stupid promise chaining functions
     */

    private getStored(key: string, err: string): Promise<Object> {
        return localForage.getItem(key).then((data) => {
            if (data === null) return Promise.reject(err);
            else return data;
        });
    }

    private getData(): Promise<Object> { return this.getS(URL + '?syncTime=' + this.lastSyncTime); }

    private getNewData(): Promise<Object> { return this.getS(URL); }

    /*
     * Other utility functions
     */

    private getS(URL: string): Promise<Object> {
        return this.http.get(URL).then((data) => {
            //update sync time
            this.lastSyncTime = Date.now();
            localForage.setItem(TIME_CACHE_KEY, this.lastSyncTime);
            return data;
        });
    }

    private updateData(data: Object): void {
        for (let i = 0, len = this.dataObj.length; i < len; i++) 
            if (this.dataObj[i].dataKey in data) this.dataObj[i].updataData(data[this.dataObj[i].dataKey]);
    }

    private overwriteData(data: Object): void {
        for (let i = 0, len = this.dataObj.length; i < len; i++)
            if (this.dataObj[i].dataKey in data) this.dataObj[i].overwriteData(data[this.dataObj[i].dataKey]);
    }

    /*
     * Actual exposed functions
     */

    constructor(http: GetLib, dataThings: Array<DataInterface>) {
        this.http = http;
        this.dataObj = dataThings
    }

    loadData(): Promise<any> {
        //init all the things
        let ray: Array<Promise<any>> = [];
        for (let i = 0, len = this.dataObj.length; i < len; i++) ray.push(this.dataObj[i].init());
        //load lastSyncTime from storage
        return Promise.all(ray);
    }

    initData(): Promise<any> {
        return this.getStored(TIME_CACHE_KEY, "No stored sync time!").then((token: number) => {
            //cache sync token
            this.lastSyncTime = token;
            //fetch and load all the things
            let ray: Array<Promise<any>> = [this.getData()];
            for (let i = 0, len = this.dataObj.length; i < len; i++) ray.push(this.dataObj[i].loadData());
            return Promise.all(ray).then((data) => {
                this.updateData(data[0]);
            }, (err) => Promise.reject(err));
        }).catch((err) => {
            console.log(err);
            return this.getNewData().then(this.overwriteData.bind(this));
        });
    }

    refreshData(): Promise<any> {
        return this.getData().then(this.updateData.bind(this));
    }
}

export = DataManage

//TODO: FINISH