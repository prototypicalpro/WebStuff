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
        //called at start
        INIT,
        //called after the time needs updating
        UPDATE,
        //called after the user requests a refresh, or the app comes into focus
        USER_REFRESH,
        //TODO: Interactivity
    }
    //enumeration to specify which properties can be injected
    //kinda sad for now but hopefully expandable
    export const enum ARGS {
        SCHEDULE,
        EVENTS,
        DAY,
    }
    //the master interface, which holds the enumeration constants the master injector reads
    //all other sub interfaces will implement this interface
    export interface Recv extends UIUtil.UIItem {
        //the enum array or item
        recv: ARGS | Array<ARGS>;
        //the enum array of the times to let the thing know to update
        triggers: TRIGGERED | Array<TRIGGERED>;
        //run every time the app state is changed(e.g. the time changes and we need to update the front)
        onUpdate?(): void;
        //run immediatly after the HTML is built
        onInit?(): void;
        //run only when the user triggers a refresh (includes the app coming in and out of focus)
        onUserRefresh?(): void;
    }
    //interfaces enumerating the properties each object must have in order to recieve the data
    //only present due to weird database efficiency stuff
    export interface EventRecv extends Recv {
        //which days we want events for
        //use a number, 0 being today, 1 being the next day, and so on
        eventDay: number | Array<number>;
        //database runs this function for every event, so this should store all the data you need 
        //to do the thing
        storeEvent(event: EventInterface): void;
    }

    export interface SchedRecv extends Recv {
        //need to specify the day we want the schedule on
        //use a number, 0 being today, 1 being the next day, and so on
        //also can request an array of multiple schedules
        readonly schedDay: number | Array<number>;
        //isolated property or array of properties to only store about schedule (if we only need title or something)
        readonly schedProps?: string | Array<string>;
        //the thing to put the data into, type depends on data asked for
        schedule: ScheduleUtil.Schedule | Array<ScheduleUtil.Schedule> | any | Array<any>;
    }

    export interface DayRecv extends Recv {
        //gets the current time
        //uh, yeah
        time: Date;
    }

    //interfaces to describe handlers for the different things that need to be injected
    //event data handler
    export interface EventHandle extends Recv {
        //the injection method, which a thing will pass a buncha subclasses
        injectEvent(objs: Array<EventRecv>): Promise<void>;
        //also this bonus method b/c schedule getting is hard
        getScheduleKey(start: number): Promise<any>;
    }

    //schedule
    export interface SchedHandle {
        injectSched(objs: Array<SchedRecv>, Event: UIArgs.EventHandle): Promise<void>;
    }

    //day
    export interface DayHandle {
        injectDay(obj: Array<DayRecv>): Promise<void>;
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