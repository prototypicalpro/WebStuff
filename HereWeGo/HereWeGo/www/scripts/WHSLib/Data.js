/*
 * Library which syncs local objects (Calendar, schedule, etc.) to the
 * cloud ones stored in a google script somewhere
 *
 * Also parses and formats data recieved to be computer readable and easier to
 * work with
 *
 * Based mostly on Promises because localforage
 */
define(["require", "exports", "localforage", "./ScheduleUtil"], function (require, exports, localForage, ScheduleUtil) {
    "use strict";
    //some settings, which I will put somewhere sometime
    const TIME_CACHE_KEY = '1';
    const SCHED_CACHE_KEY = '2';
    const CAL_CACHE_KEY = '3';
    const URL = 'https://script.google.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec';
    class DataManage {
        /*
         * Stupid promise chaining functions
         */
        getStored(key, err) {
            return localForage.getItem(key).then((data) => {
                if (data == null)
                    return Promise.reject(err);
                else
                    return data;
            });
        }
        getData() { return this.getS(URL + '?syncTime=' + this.lastSyncTime.getTime()); }
        getNewData() { return this.getS(URL); }
        /*
         * Other utility functions
         */
        getS(URL) {
            return this.http.get(URL).then((data) => {
                //update sync time
                this.lastSyncTime = new Date();
                localForage.setItem(TIME_CACHE_KEY, this.lastSyncTime);
                return data;
            });
        }
        //parsing function, takes stored data and refreshes it with the sync data
        parseCalendarData(data, syncData) {
            //hehe 1simple2me
            return Object.assign(data, syncData);
        }
        parseScheduleData(data, syncData) {
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
        pruneCalendarData(data, date) {
            let keys = Object.keys(data);
            let time = date.getTime();
            for (let i = 0, len = keys.length; i < len; i++) {
                if (new Date(keys[i]).getTime() < time)
                    delete data[keys[i]];
            }
            return data;
        }
        /*
         * Actual exposed functions
         */
        constructor(http) {
            this.http = http;
        }
        initData() {
            //load lastSyncTime from storage
            return this.getStored(TIME_CACHE_KEY, "No stored sync time!").then((token) => {
                //cache sync token
                this.lastSyncTime = token;
                //fetch, load calendar, and load schedule
                Promise.all([this.getData(), this.getStored(CAL_CACHE_KEY, "No stored calendar").then((calData) => {
                        //also prune the calendar
                        let nowDay = new Date();
                        nowDay.setHours(0, 0, 0, 0);
                        return this.pruneCalendarData(calData, nowDay);
                    }), this.getStored(SCHED_CACHE_KEY, "No stored schedule")]).then((data) => {
                    //parse, store, call it good
                    this.rawCalData = this.parseCalendarData(data[1], data[0].calSyncData);
                    this.rawSchedData = this.parseScheduleData(data[2], data[0].schedSyncData);
                    localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
                    localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
                });
            }, (err) => {
                console.log(err);
                return this.getNewData().then((data) => {
                    this.rawCalData = data.calSyncData;
                    this.rawSchedData = data.schedSyncData;
                    localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
                    localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
                });
            });
        }
        refreshData() {
            return this.getData().then((data) => {
                this.rawCalData = this.parseCalendarData(this.rawCalData, data.calSyncData);
                this.rawSchedData = this.parseScheduleData(this.rawSchedData, data.schedSyncData);
                localForage.setItem(CAL_CACHE_KEY, this.rawCalData);
                localForage.setItem(SCHED_CACHE_KEY, this.rawSchedData);
            });
        }
        getSchedule(day) {
            //temporary hack
            return ScheduleUtil.getSchedule(this.rawSchedData, this.rawCalData[day.toDateString()]);
        }
    }
    return DataManage;
});
//TODO: FINISH 
//# sourceMappingURL=Data.js.map