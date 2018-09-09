import EventData = require('./Interfaces/EventData');
import ScheduleData = require('./Interfaces/ScheduleData');
import ScheduleUtil = require('./ScheduleUtil');
import DataInterface = require('./Interfaces/DataInterface');
import DBManage = require('../DBLib/DBManage');
import UIUtil = require('../UILib/UIUtil');
import { EventInterface } from './Interfaces/EventData';
import { RecvType, CalParams } from '../UILib/UIUtil';
import GetLib = require('../GetLib/GetLib');
import DataManage = require('../DataManage');

//special enum for crappy code
enum DBInfoEnum {
    cal,
    sched,
    time,
};

/** Interface roughly decribing the data returned from this class, for documentation purposes */
interface EventDataRet {
    /** events, indexed by the start time of the event (will not include events asociated with a schedule) */
    events: {
        [startTime: number]: EventData.EventInterface,
    };
    /** schedules, indexed by start time (begining of day) */
    scheds: {
        [startTime: number]: ScheduleUtil.Schedule,
    };
}

/**
 * Class which parses and stores calendar events and school schedules.
 * 
 * This is almost certainly the most complicated peice of code in this project. I built it that way
 * because I learned early on that the fewer database operations you do, the faster your storage mechanism
 * will run. As such, parameters from individual {@link UIUtil.UIItem} classes are first combined and then
 * the database is queried, which results in a lot of date and time math and hinky booleans to cut a few
 * operations here and there. Data from the cloud is "compressed" into an array instead of an object, and
 * will need to be decoded before it can be used with the {@link CalDataManage.inflateCalCloudData} function.
 * I also split schedules into two parts (times and period names), which means
 * in order to determine the schedule you need to query the events, then the period names, then the time
 * associated with that. In hindsight, this was very dumb and there should at least be some sort of caching
 * involved, but I'll let you figure that out.
 * 
 * Data returned from this class is structured as shown in the interface {@link EventDataRet}.
 */
class CalDataManage implements DataInterface {
    readonly dataType: UIUtil.RecvType = UIUtil.RecvType.CAL;
    //we can also do this
    protected db: IDBDatabase;
    setDB(db: IDBDatabase): void { this.db = db; }
    //db info
    readonly dataKey: string = 'calSyncData';
    //database info
    /** three databases: events, schedule names, schedule times */
    readonly dbInfo: Array<DBManage.DBInfoInterface> = [
        {
            storeName: DBInfoEnum[DBInfoEnum.cal],
            keyPath: 'id',
            keys: ['isAllDay', 'startTime', 'endTime', 'schedule'],
        },
        {
            storeName: DBInfoEnum[DBInfoEnum.sched],
            keyPath: 'name',
            keys: [],
        },
        {
            storeName: DBInfoEnum[DBInfoEnum.time],
            keyPath: 'name',
            keys: [],
        },
    ];
    //storage http
    private readonly http: GetLib;
    //constructor
    constructor(http: GetLib) {
        this.http = http;
    }
    /**
     * Delete any events that are cancelled, remove events that end before today, then add and replace events based on data.
     * @param data the data from the cloud
     * @returns if the data got updated or not
     */
    updateData(data: any): Promise<boolean> | false {
        //store our next steps
        const nextFunc = (args: [IDBObjectStore, DBManage.DBInfoInterface]): Promise<boolean> => {
            //then do a buncha quuuueirereis to update the database entries
            //but put it all in promises just to be sure
            let ray: Array<Promise<any>> = [];
            for (let i = 0, len = data[args[1].storeName].length; i < len; i++) {
                if ('cancelled' in data[args[1].storeName][i]) ray.push(new Promise((resolve, reject) => {
                    let req = args[0].delete(data[args[1].storeName][i][args[1].keyPath]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
                else ray.push(new Promise((resolve, reject) => {
                    let req = args[0].put(data[args[1].storeName][i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                }));
            }
            return Promise.all(ray).then(() => data.length > 0);
        };
        //do things in parrellel!
        let transactions: Array<IDBObjectStore> = this.dbInfo.map(dbInf => this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName));
        return Promise.all([
            new Promise((resolve, reject) => {
                //decompress the calendar data
                data[this.dbInfo[DBInfoEnum.cal].storeName] = this.inflateCalCloudData(data[this.dbInfo[DBInfoEnum.cal].storeName]);
                //iterate through all elements, removing the ones that end before today
                transactions[DBInfoEnum.cal].index('endTime').openCursor(IDBKeyRange.upperBound(new Date().setHours(0, 0, 0, 0), true)).onsuccess = (event: any) => {
                    let cursor = event.target.result as IDBCursorWithValue;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                    else resolve([transactions[DBInfoEnum.cal], this.dbInfo[DBInfoEnum.cal]]);
                };
            }).then(nextFunc),
            nextFunc([transactions[DBInfoEnum.sched], this.dbInfo[DBInfoEnum.sched]]),
            nextFunc([transactions[DBInfoEnum.time], this.dbInfo[DBInfoEnum.time]]),
        ]).then((datums: Array<boolean>) => datums.indexOf(true) !== -1);
    }

    overwriteData(data: any) {
        //inflate just calData
        data.cal = this.inflateCalCloudData(data.cal);
        //parellel!
        return Promise.all(this.dbInfo.map(((dbInf: DBManage.DBInfoInterface) => {
            //object store
            let objectStore: IDBObjectStore;
            //promises! yay!
            return new Promise((resolve, reject) => {
                objectStore = this.db.transaction([dbInf.storeName], "readwrite").objectStore(dbInf.storeName);
                //clear object store
                let req: IDBRequest = objectStore.clear();
                req.onsuccess = resolve;
                req.onerror = reject;
            }).then(() => {
                //fill it with the new datums
                let ray: Array<Promise<any>> = [];
                for (let i = 0, len = data[dbInf.storeName].length; i < len; i++) {
                    ray.push(new Promise((resolve, reject) => {
                        let req = objectStore.add(data[dbInf.storeName][i]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                }
                //and run them all
                return Promise.all(ray);
            });
        }).bind(this)));
    }

    /**
     * Take the data from the cloud and "decompress" it (convert it from an array to an object). Used to save a few characters
     * when sending the data over the internet.
     * @param data the compressed data arrays
     * @returns the event data objects
     */
    protected inflateCalCloudData(data: Array<Array<any>>): Array<EventData.CancelledEventInterface | EventData.EventInterface> {
        return data.map((item: Array<any>) => {
            if(!item[0]) return {
                cancelled: true,
                id: item[1],
            };
            return {
                id: item[EventData.CloudEventEnum.id],
                schedule: item[EventData.CloudEventEnum.schedule],
                title: item[EventData.CloudEventEnum.title],
                startTime: item[EventData.CloudEventEnum.startTime],
                endTime: item[EventData.CloudEventEnum.endTime],
                isAllDay: item[EventData.CloudEventEnum.isAllDay],
                desc: item[EventData.CloudEventEnum.desc],
            };
        });
    }

    /**
     * Data functions
     */

     /**
      * Read recv params, do a bunch of date math to get a time range of events to fetch,
      * then query the database for the events and schedules as necessar.
      * @returns the fetched data, or false if no data is availible or invalid parameters are revieved
      */
    getData(items: Array<UIUtil.UIItem>): Promise<EventDataRet> | false {
        //create a range of events to fetch, then an array of schedules to fetch
        let evRange = [null, null];
        let schedList: Array<number> = [];
        let schedExNormList: Array<boolean> = [];
        let onlySched = true;
        //utility function to expand range
        const expandRange = (start: number, count?: number): void => {
            //start of range
            if (typeof evRange[0] != 'number' || start < evRange[0]) evRange[0] = start;
            else if (typeof evRange[1] != 'number' || start > evRange[1]) evRange[1] = start;
            //end of range
            if (start + count > evRange[1]) evRange[1] = start + count;
        };
        //for every UI item
        for(let i = 0, len = items.length; i < len; i++) {
            //if items params are null or emptey, ignore it
            if(!items[i].recvParams || items[i].recvParams.length === 0) continue;
            let params = items[i].recvParams;
            //for every param
            for(let o = 0, len1 = params.length; o < len1; o++) {
                let parPoint = <CalParams>params[o];
                //if the param is not for calendar, ignore it
                if(parPoint.type !== RecvType.CAL) continue;
                //else figure out what days we want to get calendar data for
                if (parPoint.dayStart) {
                    onlySched = false;
                    expandRange(parPoint.dayStart, parPoint.dayCount);
                }
                if (typeof parPoint.schedDay === 'number' && schedList.indexOf(parPoint.schedDay) === -1) {
                    schedList.push(parPoint.schedDay);
                    schedExNormList.push(!!parPoint.excludeNormal);
                    expandRange(parPoint.schedDay);
                }
            }
        }
        //check if there's a reason to search
        if (!evRange.length) return false;
        //cache date
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        let nowDay = day.getDate();
        //create key range based on data above
        let range: IDBKeyRange;
        let lower: number;
        let upper: number;
        if (!evRange[1] && onlySched) {
            upper = lower =  day.setDate(nowDay + evRange[0]);
            range = IDBKeyRange.only(lower);
        } 
        else {
            lower = new Date(day).setDate(nowDay + evRange[0]);
            upper = new Date(day).setDate(nowDay + evRange[1] + 1) - 1;
            range = IDBKeyRange.upperBound(upper);
        } 
        const ONE_DAY = 86400000;
        //start running the query!
        return new Promise((resolve, reject) => {
            let evRet: any = {};
            let req: IDBRequest = this.db.transaction([this.dbInfo[DBInfoEnum.cal].storeName], "readonly").objectStore(this.dbInfo[DBInfoEnum.cal].storeName).index('startTime').openCursor(range);
            req.onerror = reject;
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    let event: EventInterface = cursor.value;
                    if ((!onlySched || event.schedule) && event.endTime >= lower) {
                        if(onlySched) {
                            if (!evRet[event.startTime]) evRet[event.startTime] = [event];
                            else evRet[event.startTime].push(event);
                        }
                        //add the event to every day it happens on
                        //if duration is greater than one day, we need to extend it across multiple days
                        else {
                            for(let day = lower; day < upper; day += ONE_DAY) {
                                let dayEnd = day + ONE_DAY;
                                if((event.startTime < dayEnd && event.startTime >= day)
                                    || (event.endTime < dayEnd && event.endTime > day)
                                    || (event.startTime < day && event.endTime > dayEnd)) {
                                    if (!evRet[day]) evRet[day] = [event];
                                    else evRet[day].push(event);
                                }
                            }
                        }
                    }
                    cursor.continue();
                }
                else return resolve(evRet);
            };
        }).then((ret: any) => {
            //the return object will be event objects indexed by start time
            //generate schedules for all the schedule days listed
            if (!schedList.length) Promise.resolve({ events: ret });
            //search events, matching each event to it's schedule, and storing it
            //query the schedule types and then the times
            //with a buncha on-off queries
            else return Promise.all(schedList.map((schedNum: number, index: number) => {
                //get the appropriete event
                let find: EventData.EventInterface;
                let searchDay = day.setDate(nowDay + schedNum);
                if (!ret[searchDay] || !(find = ret[searchDay].find(ev => ev.schedule))) return false;
                //and search the database for that key
                //double nested database search 
                return new Promise((resolve, reject) => {
                    let tx = this.db.transaction([this.dbInfo[DBInfoEnum.sched].storeName, this.dbInfo[DBInfoEnum.time].storeName], "readonly");
                    let req = tx.objectStore(this.dbInfo[DBInfoEnum.sched].storeName).get(find.title);
                    req.onsuccess = (evt: any) => {
                        //if we couldn't find a schedule, or we are excluding normal schedules and the schedule is normal
                        if (!evt.target.result || (schedExNormList[index] && !<ScheduleData.SchedCloudData>(evt.target.result).spec)) return resolve(false);
                        //else go looking for a matching time
                        let req2 = tx.objectStore(this.dbInfo[DBInfoEnum.time].storeName).get(evt.target.result.timeName.toLowerCase());
                        req2.onsuccess = (evt1: any) => {
                            if (!evt1.target.result) return resolve(false);
                            resolve([find.startTime, new ScheduleUtil.Schedule(evt.target.result, evt1.target.result)]);
                        };
                        req2.onerror = reject;
                    };
                    req.onerror = reject;
                    //yaaaaay caaaallbaaaacks
                });
            })).then((scheds: Array<[number, false | ScheduleUtil.Schedule]>) => {
                //index schedule based on start time
                let schedRet = {};
                for (let i = 0, len = scheds.length; i < len; i++) if (scheds[i] && scheds[i][1]) schedRet[scheds[i][0]] = scheds[i][1];
                return { events: ret, scheds: schedRet };
            });
        });
    }
}

export = CalDataManage;
