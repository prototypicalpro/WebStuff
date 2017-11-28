/*
 * Event class structure thingy, designed to make storing, parseing, and reading google calendar stuff
 * that much easier
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    //event class, designed to make parsing and storing a google calender JSON event list easier
    class Event {
        constructor(isAllDay, startTime, name, id) {
            this.isAllDay = isAllDay;
            this.startTime = startTime;
            this.name = name;
            this.id = id;
        }
        getName() { return this.name; }
        getIsAllDay() { return this.isAllDay; }
        getTime() { return this.startTime; }
        getID() { return this.id; }
    }
    return Event;
});
//# sourceMappingURL=Event.js.map