/**
 * Utility class to ease database acess for events
 */

import EventInterface = require('./EventInterface');

class EventData {
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
    getScheduleKey(day: Date): Promise<string> {
        //make the day midnight of the start day
        day.setHours(0, 0, 0, 0);
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.objName], "readonly").objectStore(this.objName).index('startTime').openCursor(IDBKeyRange.only(day.getTime()));
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (cursor.value.schedule === true) resolve(cursor.value.title);
                    else cursor.continue();
                }
                else resolve(null);
            };
            req.onerror = reject;
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
}

export = EventData;