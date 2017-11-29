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

const URL: string = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';

class DataManage {
    private http: GetLib;
    private dataObj: Array<DataInterface>;
    private lastSyncTime: number;
    //storage UI parameter objects
    private uiItemStore: Array<UIUtil.UIItem>;
    private paramStore: Array<Array<UIUtil.RecvParams>>;

    /*
     * Stupid promise chaining functions
     */

    private getData(): Promise<any> { return this.getS(URL + '?syncTime=' + this.lastSyncTime); }

    private getNewDataFunc(): Promise<any> { return this.getS(URL); }

    /*
     * Other utility functions
     */

    private getS(URL: string): Promise<Object> {
        return this.http.get(URL).then((data) => {
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
            new Promise((resolve, reject) => {
                //load last sync time from storage
                let lastSync = localStorage.getItem('1');
                if (!lastSync) throw ErrorUtil.code.NO_STORED;
                this.lastSyncTime = parseInt(lastSync);
                return resolve();
            }),
            DBManage.constructDB(this.dataObj.map((data) => { return data.dbInfo; })).then((dbThings: IDBDatabase | Array<IDBDatabase | boolean>) => {
                let db: IDBDatabase;
                if (Array.isArray(dbThings)) db = <IDBDatabase>dbThings[0];
                else db = <IDBDatabase>dbThings;
                for (let i = 0, len = this.dataObj.length; i < len; i++) this.dataObj[i].setDB(db);
                //check for no stored
                if (Array.isArray(dbThings) && dbThings[1]) throw ErrorUtil.code.NO_STORED;
            })
        ];
        return Promise.all(ray);
    }

    //gets new data and overwrited any old data
    getNewData(): Promise<any> {
        return this.getNewDataFunc().then(this.overwriteData.bind(this));
    }

    refreshData(): Promise<Array<boolean>> {
        return this.getData().then(this.updateData.bind(this));
    }

    /**
     * UI Updating functions
     * Take the data we have and serve it to the UI Objects
     * Some fnagling b/c it's easier to build the first page first
     * but no more than usual
     */

    setUIObjs(obj: Array<UIUtil.UIItem>) {
        //store items
        this.uiItemStore = obj;
        //create array of arrays
        this.paramStore = new Array(UIUtil.RecvType.length).fill([]);
        //create cached array of recv parameters
        for (let i = 0, len = obj.length; i < len; i++) if (obj[i].recvParams) for (let o = 0, len1 = obj[i].recvParams.length; o < len1; o++) this.paramStore[obj[i].recvParams[o].type].push(obj[i].recvParams[o]);
    }

    initUI(): Promise<any> {
        return Promise.all(this.dataObj.map((obj, index) => { return obj.getData(this.paramStore[index]); })).then((dataRay: Array<any>) => { for (let i = 0, len = this.uiItemStore.length; i < len; i++) { this.uiItemStore[i].onInit(dataRay); this.uiItemStore[i].buildJS(); }});
    }

    refreshUI(): Promise<any> {
        //single line: for every data object, get the data, then for every ui item, update the data
        return Promise.all(this.dataObj.map((obj, index) => { return obj.getData(this.paramStore[index]); })).then((dataRay: Array<any>) => { for (let i = 0, len = this.uiItemStore.length; i < len; i++) this.uiItemStore[i].onUpdate(dataRay); });
    }
}

export = DataManage