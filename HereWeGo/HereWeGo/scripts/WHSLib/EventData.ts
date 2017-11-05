/**
 * Utility class to ease database acess for events
 */

import EventInterface = require('./EventInterface');
import ErrorUtil = require('../ErrorUtil');
import UIUtil = require('../UILib/UIUtil');

class EventData implements UIUtil.EventHandle {
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
            if (!result) return null;
            else return result;
        });
    }

    /*
    //start and end are Date.getTime() numbers
    getEventsLeg(start: number, end: number, cursorFunc: (event: EventInterface) => void): Promise<any> {
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
    */
    //UI handler interface madness!
    getEvents(objs: Array<UIUtil.EventParams>): Promise<any> {
        //step one: figure out the quiries to make
        //sigh
        interface dayObj {
            day: number;
            objs: Array<UIUtil.EventParams>;
        }
        //create an object with all the data we need to get and run the thigs
        let days: Array<dayObj> = [];
        for (let i = 0, len = objs.length; i < len; i++) {
            let index = days.findIndex((day) => { return day.day === objs[i].day; })
            if (index === -1) {
                days.push({
                    day: objs[i].day,
                    objs: [objs[i]],
                });
            }
            else days[index].objs.push(objs[i]);
        }
        //run the quiries!
        //first get all the days, then map them to promises with database info, inside of which we run the functions!
        return Promise.all(days.map((day: dayObj) => {
            //date stuff
            //today plus whatever specified by object
            let tempDay = new Date();
            tempDay.setHours(0, 0, 0, 0);
            let start = tempDay.setDate(tempDay.getDate() + day.day);
            //add one day minus one millisecond
            let end = tempDay.setDate(tempDay.getDate() + 1) - 1;
            //db stuff!
            return new Promise((resolve) => {
                let req: IDBRequest = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('startTime').openCursor(IDBKeyRange.bound(start, end));
                req.onsuccess = (event: any) => {
                    let cursor: IDBCursorWithValue = event.target.result;
                    if (cursor) {
                        if (!cursor.value.schedule) {
                            //run it bby
                            for (let i = 0, len = day.objs.length; i < len; i++) day.objs[i].storeEvent(cursor.value);
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