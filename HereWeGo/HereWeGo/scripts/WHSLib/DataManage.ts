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
import ScheduleUtil = require('./ScheduleUtil');


//some settings, which I will put somewhere sometime
const TIME_CACHE_KEY: string = '1';
const SCHED_CACHE_KEY: string = '2';
const CAL_CACHE_KEY: string = '3';

const URL: string = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';

class DataManage {
    private http: GetLib;
    private lastSyncTime: Date;

    private rawCalData: Object;
    private rawSchedData: Array<Object>;

    /*
     * Stupid promise chaining functions
     */

    private getStored(key: string, err: string): Promise<any> {
        return localForage.getItem(key).then((data) => {
            console.log("key: " + key + " data: " + JSON.stringify(data));
            if (data == null) return Promise.reject(err);
            else return data;
        });
    }

    private getData(): Promise<Object> { return this.getS(URL + '?syncTime=' + this.lastSyncTime.getTime()); }

    private getNewData(): Promise<Object> { return this.getS(URL); }

    /*
     * Other utility functions
     */

    private getS(URL: string): Promise<Object> {
        return this.http.get(URL).then((data) => {
            //update sync time
            this.lastSyncTime = new Date();
            localForage.setItem(TIME_CACHE_KEY, this.lastSyncTime);
            return data;
        });
    }

    //parsing function, takes stored data and refreshes it with the sync data
    private parseCalendarData(data: Object, syncData: Object): Object {
        let start = performance.now();

        console.log(JSON.stringify(data));
        console.log(JSON.stringify(syncData))

        let keys = Object.keys(syncData);
        for (let i = 0, len = keys.length; i < len; i++) {
            //if the day doesn't exist, copy it and be done
            if (!(keys[i] in data)) data[keys[i]] = syncData[keys[i]];
            //if it does, prune each element for changed data
            if ('schedule' in syncData[keys[i]]) data[keys[i]].schedule = syncData[keys[i]].schedule;
            if ('events' in syncData[keys[i]]) {
                //ho boy
                //TODO: Make more efficient
                for (let o = 0, len2 = syncData[keys[i]].events.length; o < len2; o++) {
                    for (let p = 0, len3 = data[keys[i]].events.length; p < len3; p++) {
                        //compare ids, if match then swap
                        if (syncData[keys[i]].events[o].id === data[keys[i]].events[p].id) data[keys[i]].events[p] = syncData[keys[i]].events[o];
                        break;
                    }
                    
                }
            }
        }
        let end = performance.now();
        console.log("Stupid for loops took: " + (end - start));
        return data;
    }

    private parseScheduleData(data: Array<Object>, syncData: Array<Object>) {
        if (syncData.length > 0) {
            console.log("Took synced schedule data");
            return syncData;
        }
        else {
            console.log("Took stored schedule data");
            return data;
        }
    }

    //remove any events that are before the date passed
    private pruneCalendarData(data: Object, date: Date): Object {
        let keys: Array<string> = Object.keys(data);
        let time: number = date.getTime();
        for (let i = 0, len = keys.length; i < len; i++) {
            if (new Date(keys[i]).getTime() < time) delete data[keys[i]];
        }
        return data;
    }

    /*
     * Actual exposed functions
     */

    constructor(http: GetLib) {
        this.http = http;
    }

    initData(): Promise<void> {
        //load lastSyncTime from storage
        return this.getStored(TIME_CACHE_KEY, "No stored sync time!").then((token: Date) => {
            //cache sync token
            this.lastSyncTime = token;
            //fetch, load calendar, and load schedule
            return Promise.all([this.getData(), this.getStored(CAL_CACHE_KEY, "No stored calendar").then((calData) => {
                //also prune the calendar
                let nowDay = new Date();
                nowDay.setHours(0, 0, 0, 0);
                return this.pruneCalendarData(calData, nowDay);
            }), this.getStored(SCHED_CACHE_KEY, "No stored schedule")]).then((data: Array<any>) => {
                //parse, store, call it good
                this.rawCalData = this.parseCalendarData(data[1], data[0].calSyncData);
                this.rawSchedData = this.parseScheduleData(data[2], data[0].schedSyncData);
                localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
                localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
            });
        }, (err) => {
            console.log(err);
            return this.getNewData().then((data: any) => {
                this.rawCalData = data.calSyncData;
                this.rawSchedData = data.schedSyncData;
                localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
                localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
            });
        });
    }

    refreshData(): Promise<void> {
        return this.getData().then((data: any) => {
            this.rawCalData = this.parseCalendarData(this.rawCalData, data.calSyncData);
            this.rawSchedData = this.parseScheduleData(this.rawSchedData, data.schedSyncData);
            localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
            localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
        })
    }

    getSchedule(day: Date): ScheduleUtil.Schedule {
        //temporary hack
        let arg2 = null;
        if (day.toDateString() in this.rawCalData) arg2 = this.rawCalData[day.toDateString()];
        return ScheduleUtil.getSchedule(this.rawSchedData as ScheduleUtil.StoreSchedule[], arg2);
    }
}

export = DataManage

//TODO: FINISH