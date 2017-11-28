/**
 * This class should provide all the functions for database acess and
 * various manipulations to the event database
 * It made more sense to but all this stuff in it's own class, even though
 * it is the same stuff as CalDataManage
 */
define(["require", "exports", "./CacheKeys"], function (require, exports, CacheKeys_1) {
    "use strict";
    class EventData {
        //constructor where we init the database pointer
        //we assume database is already initialized
        constructor(db) {
            this.db = db;
        }
        //gets the schedule key for today, the lazy way of course
        getScheduleKey(day) {
            //make the day midnight of the start day
            day.setHours(0, 0, 0, 0);
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([CacheKeys_1.CAL_DB_NAME], "readonly").objectStore(CacheKeys_1.CAL_DB_NAME).index('startTime').openCursor(IDBKeyRange.only(day.getTime()));
                req.onsuccess = (event) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value.schedule === true)
                            resolve(cursor.value.title);
                        else
                            cursor.continue();
                    }
                    else
                        resolve(null);
                };
                req.onerror = reject;
            });
        }
        //start and end are Date.getTime() numbers
        getEvents(start, end, cursorFunc) {
            //this is where the db should pay off
            return new Promise((resolve) => {
                let req = this.db.transaction([CacheKeys_1.CAL_DB_NAME], "readonly").objectStore(CacheKeys_1.CAL_DB_NAME).index('startTime').openCursor(IDBKeyRange.bound(start, end));
                req.onsuccess = (event) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (!cursor.value.schedule)
                            cursorFunc(cursor.value);
                        cursor.continue();
                    }
                    else
                        return resolve();
                };
            });
        }
    }
    return EventData;
});
//# sourceMappingURL=EventDBUtil.js.map