/**
 * Utility class to ease database acess for events
 */

import EventInterface = require('./EventInterface');
import ErrorUtil = require('../ErrorUtil');
import UIArgs = require('../UIArgs');

class EventData implements UIArgs.EventHandle {
    //db pointer
    private readonly db: IDBDatabase;
    //object store name
    private readonly objName: string;
    //fill all them values
    constructor(db: IDBDatabase, name: string) {
        this.db = db;
        this.objName = name;
    }

    //other more interesting functions
    //gets the schedule key for today, the lazy way of course
    getScheduleKey(start: number): Promise<string> {
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('schedule').openCursor(IDBKeyRange.only(1));
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (cursor.value.startTime === start) return resolve(cursor.value.title);
                    else cursor.continue();
                }
                else resolve(null);
            };
            req.onerror = reject;
        }).then((result) => {
            if (!result) throw ErrorUtil.code.NO_SCHOOL;
            else return result;
        });
    }

    //start and end are Date.getTime() numbers
    getEvents(start: number, end: number, cursorFunc: (event: EventInterface) => void): Promise<any> {
        //this is where the db should pay off
        return new Promise((resolve) => {
            let req: IDBRequest = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (!cursor.value.schedule) cursorFunc(cursor.value);
                    cursor.continue();
                }
                else return resolve();
            };
        });
    }

    //UI handler interface madness!
    injectEvent(objs: Array<UIArgs.EventRecv>): Promise<any> {
        //step one: figure out the quiries to make
        //code moved to UIArgs file for (questionable) portability
        let days: Object = UIArgs.deDupeDays('schedDay', objs);
        //run the quiries!
        //first get all the days, then map them to promises with database info, inside of which we run the functions!
        return Promise.all(Object.keys(days).map((dayKey: string) => {
            console.log(dayKey)
            //date stuff
            let start = new Date().setHours(0, 0, 0, 0) + parseInt(dayKey) * 86400000;
            //add one day minus one millisecond
            let end = start + 86399999;
            //db stuff!
            return new Promise((resolve) => {
                let req: IDBRequest = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
                req.onsuccess = (event: any) => {
                    let cursor: IDBCursorWithValue = event.target.result;
                    if (cursor) {
                        if (!cursor.value.schedule) {
                            let indexRay: Array<number> = days[start];
                            for (let i = 0, len = indexRay.length; i < len; i++) objs[indexRay[i]].storeEvent(cursor.value);
                        }
                        cursor.continue();
                    }
                    else return resolve();
                };
            });
        }));
        //it's now occurring to me how I should just iterate through the events instead of doing database stuff in parrellel,
        //but I think it's a little late for that now
    }
}

export = EventData;