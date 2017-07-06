/*
 * Event class structure thingy, designed to make storing, parseing, and reading google calendar stuff
 * that much easier
 */

//moment to simplify stupid formatting
import * as moment from 'moment';

//event class, designed to make parsing and storing a google calender JSON event list easier
class Event {
    isAllDay: boolean;
    startTime: Date;
    name: string;
    id: string;

    constructor(isAllDay: boolean, startTime: Date, name: string, id: string) {
        this.isAllDay = isAllDay;
        this.startTime = startTime;
        this.name = name;
        this.id = id;
    }

    getName(): string { return this.name; }

    getIsAllDay(): boolean { return this.isAllDay; }

    getTime(): Date { return this.startTime; }

    getID(): string { return this.id; }

    //cachable, returns and/or parses an array so you don't have to store the entire object
    //idk why it's so important to me to save a few bytes, but whatever
    returnCachable(): Array<any> { return [this.isAllDay, this.startTime.toISOString(), this.name, this.id]; }
    
    //alternate constructor from a cachable event object
    static fromCachable(cached: Array<any>): Event { return new Event(cached[0], new Date(cached[1]), cached[2], cached[3]); }

    //alternate constructor from a google calender JSON event
    static fromGCAL(gcalJSONEvent: any): Event {
        let allDay: boolean = false;
        let start: Date;
        //check for all day events
        if(gcalJSONEvent.start.hasOwnProperty('date')){
            allDay = true;
            /* I decided I want to move this to a different file
            //check for schedule key
            if(WHSSched.CAL_KEYS.findIndex(element => {
                return gcalJSONEvent.summary == element;
            }) != undefined) schedInd = true;
            */ //TODO: Move code
            start = moment(gcalJSONEvent.start.date, "YYYY-MM-DD").toDate();
        }
        //else grab the stuff where it should be
        else start = new Date(gcalJSONEvent.start.dateTime);

        //and throw everything else into the contructor
        return new Event(allDay, start, gcalJSONEvent.summary, gcalJSONEvent.id);
    }
}

export = Event;