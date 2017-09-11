/**
 * Namespace to enumerate all dependency injection constants
 * Allows UI classes to tell the super class which data they need
 * Might be a little messy
 */

import EventInterface = require('./WHSLib/EventInterface');
import EventData = require('./WHSLib/EventData');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import UIUtil = require('./UILib/UIUtil');

namespace UIArgs {
    //enumeration to specify which triggers the element would like to be refreshed in
    export const enum TRIGGERED {
        //called after the time needs updating
        TIME_UPDATE,
        //called after a new event has changed the event cache
        EVENT_UPDATE,
        //called after a new type of schedule has changed the schedule cache
        SCHEDULE_UPDATE
        //TODO: Interactivity
    }
    //enumeration for the type of recvParam
    export const enum RecvType {
        SCHEDULE,
        DAY,
        EVENTS,
    }
    //base interface for an object which specifys how to inject
    export interface RecvParams {
        type: RecvType;
    }
    //interfaces enumerating the properties each object must have in order to recieve the data
    //only present due to weird database efficiency stuff
    export interface EventParams extends RecvParams {
        //which days we want events for
        //use a number, 0 being today, 1 being the next day, and so on
        eventDay: number;
        //whether or not to display schedule
        displaySched?: boolean;
        //database runs this function for every event, so this should store all the data you need 
        //to do the thing
        storeEvent(event: EventInterface): void;
    }

    export interface SchedParams extends RecvParams {
        //need to specify the day we want the schedule on
        //use a number, 0 being today, 1 being the next day, and so on
        //also can request an array of multiple schedules
        schedDay: number;
        //isolated property or array of properties to only store about schedule (if we only need title or something)
        schedProps?: Array<string>;
    }

    export interface DayParams extends RecvParams {
        //huh
    }

    //interfaces to describe handlers for the different things that need to be injected
    //event data handler
    export interface EventHandle {
        //the injection method, which a thing will pass a buncha subclasses
        getEvents(objs: Array<EventParams>): Promise<void>;
        //also this bonus method b/c schedule getting is hard
        getScheduleKey(start: number): Promise<any>;
    }

    //schedule
    export interface SchedHandle {
        getSched(objs: Array<SchedParams>, Event: UIArgs.EventHandle): Promise<Array<any>>;
    }

    //day
    export interface DayHandle {
        getDay(obj: Array<DayParams>): Promise<Array<any>> | any;
    }

    //IDK where to put this, but a utility function to dedupe days is here
    //this has a buncha confusing optimization stuff and is pretty much unreadable, but assume it
    //would otherwise reside in one of the ___Data files
    //returns an object in {(small day number (0, 1, 2, etc.)): (Array of indexes in object array argument)} format
    export const deDupeDays = (key: string, objs: Array<Object>): Object => {
        let days: Object = {};
        for (let i = 0, len = objs.length; i < len; i++) {
            //convert the date(s) into a number so we can compare it
            //if it's an array, do every date
            let dayRay = objs[i][key] as Array<number>;
            if (Array.isArray(dayRay)) {
                //for every item
                for (let o = 0, len1 = dayRay.length; o < len1; o++) {
                    //if the days object does not have the property of the time we want to push, add the index of the element
                    if (!days[dayRay[o]]) days[dayRay[o]] = [i];
                    //else push it to the existing array
                    else days[dayRay[o]].push(i);
                }
            }
            //else if it's a single item, add it if it's not a dupe
            else {
                //if the days object does not have the property of the time we want to push, add the index of the element
                if (!days[<number>dayRay]) days[<number>dayRay] = [i];
                //else push it to the existing array
                else days[<number>dayRay].push(i);
            }
        }
        return days;
    }
}

export = UIArgs;