import GetLib = require('./GetLib/GetLib');
import DataInterface = require('./WHSLib/Interfaces/DataInterface');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import DBManage = require('./DBLib/DBManage');
import ErrorUtil = require('./ErrorUtil');
import UIUtil = require('./UILib/UIUtil');

/**
 * There are a few stages required to making any sort of data from the interet useful to a user: fetch,
 * store, parse, route, and display. This class controls all of those stages accept display, which is 
 * handled by the {@link UIUtil} system, and fetch, which is handled by the {@link GetLib} system.
 * 
 * Data is fetched from a Google Apps Script running {@link DataManage.URL here}, which controls all
 * data except images. This cloud script is hosted through the wilsoncomputerscience@gmail.com google account.
 * Data from this script has been absctracted into components (such as calendar, images), and each component
 * has been written it's own class to parse, store, and return the data. This class simply fetches data
 * from the internet, and runs the individual class code on it. These classes implement the interface
 * {@link DataInterface}.
 * 
 * For peace of mind, this class also ensures the database is initialized and built using {@link DBManage}.
 * A pointer to the database is passed to the class during contruction.
 */

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

    /**
     * Store objects
     * @param dataThings classes to parse and deliver data
     * @param http instance of {@link GetLib} for HTTP stuff
     */
    constructor(dataThings: Array<DataInterface>, http: GetLib) {
        //reindex the dataThings array by thier type
        //just in case
        let ray = new Array(UIUtil.RecvType.length);
        for (let i = 0, len = dataThings.length; i < len; i++) ray[dataThings[i].dataType] = dataThings[i];
        this.dataObj = ray;
        this.http = http;
    }

    /**
     * Initialize database, check when we last synchronized, throw an error if the database needed to be reset
     */
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

    /**
     * Fetch data then overwrite anything we have stored.
     */
    getNewData(): Promise<any> {
        return this.getNewDataFunc().then(this.overwriteData.bind(this));
    }

    /**
     * Fetch data then update anything we have stored
     */
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