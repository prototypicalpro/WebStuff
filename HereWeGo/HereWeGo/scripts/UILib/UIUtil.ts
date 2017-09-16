/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML
 *
 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */

import EventInterface = require('../WHSLib/EventInterface');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import QuoteDataInterface = require('../WHSLib/QuoteDataInterface');

namespace UIUtil {
    //enumeration to specify which triggers the element would like to be refreshed in
    export enum TRIGGERED {
        //called after the time needs updating
        onTimeUpdate,
        //called after a new event has changed the event cache
        onEventUpdate,
        //called after a new type of schedule has changed the schedule cache
        onScheduleUpdate,
        //trigger both schedule and event update
        UPDATE_ALL_DATA,
        //TODO: Interactivity
    }
    //enumeration for the type of recvParam
    export const enum RecvType {
        SCHEDULE,
        DAY,
        EVENTS,
        QUOTE,
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
        day: number;
        //database runs this function for every event, so this should store all the data you need 
        //to do the thing
        storeEvent(event: EventInterface): void;
    }
    export interface SchedParams extends RecvParams {
        //need to specify the day we want the schedule on
        //use a number, 0 being today, 1 being the next day, and so on
        //also can request an array of multiple schedules
        day: number;
        //isolated property or array of properties to only store about schedule (if we only need title or something)
        schedProps?: Array<string>;
        //callback fn
        storeSchedule(sched: ScheduleUtil.Schedule | Array<string>);
    }
    export interface DayParams extends RecvParams {
        //callback fn
        storeDay(day: Date);
    }
    export interface QuoteParams extends RecvParams {
        //just a callback
        storeQuote(quote: QuoteDataInterface);
    }
    //interfaces to describe handlers for the different things that need to be injected
    //event data handler
    export interface EventHandle {
        //the injection method, which a thing will pass a buncha subclasses
        getEvents(objs: Array<EventParams>): Promise<any>;
        //also this bonus method b/c schedule getting is hard
        getScheduleKey(start: number): Promise<any>;
    }
    //schedule
    export interface SchedHandle {
        getSched(objs: Array<SchedParams>, Event: UIUtil.EventHandle): Promise<any>;
    }
    //day
    export interface DayHandle {
        getDay(obj: Array<DayParams>): Promise<any> | void;
    }
    //quote
    export interface QuoteHandle {
        getQuote(obj: Array<QuoteParams>): Promise<any>;
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
    //Varibles to put in template, in form of { name: value }
    //searches for strings in double curly beackets and replaces them (e.g. {{thing}})
    //no spaces in there please
    //this function will search every member of values, and fill the template
    export const templateEngine = (template: string, values: Object): string => {
        //get all teh keys, and map them to a RegEx for optimization
        let re = new RegExp(Object.keys(values)
            //give the strings the template syntax
            .map((str) => { return '{{' + str + '}}'; })
            //join them with the or operator
            .join('|'), 'g');
        //then in the replace, match the things to the things (filtering out the {{}} first)
        return template.replace(re, function (matched) { return values[matched.replace(new RegExp(/{|}/, 'g'), '')]; });
    };
    //utility function to search an array of UIItem for base children and return the flat array
    export const findChildren = (ray: Array<UIItem>): Array<UIItem> => {
        //iterate through every item making sure to find it's children, adding things on the end to check as we go
        for(let i = 0; i < ray.length; i++){
            if(ray[i].getChildren){
                ray.push.apply(ray, ray[i].getChildren());
            }
        }
        return ray;
    };
    //unique ID utility function, will just increment a number to ensure nothing is duplicated
    var idCount: number = 0;
    export const getUniqueId = (): number => {
        return idCount++;
    }
    //Interface to universalize UI Items (such as graphics)
    //should be implemented by anything that returns a string of HTML
    export abstract class UIItem {
        //automated unique ID generation
        readonly id: string;
        constructor() {
            this.id = 'i' + getUniqueId();
        }
        //get all the child UIItems (or if it is at the bottom, don't implement this function)
        getChildren?(): Array<UIItem>;
        //the enum array or item for the onInit
        abstract onInitRecv: Array<UIUtil.RecvParams>;
        //build html
        //thingys are always filled before calling this
        abstract getHTML(): string;
        //build javascript over html
        onInit?(): void;
        //run every time the app state is changed(e.g. the time changes and we need to update the front)
        //the enum array or item for the onTimeUpdate
        onTimeUpdateRecv?: Array<UIUtil.RecvParams>;
        //out of date comment
        onTimeUpdate?(): void;
        //the enum array or item for the onUpdate
        onEventUpdateRecv?: Array<UIUtil.RecvParams>;
        //wohoo
        onEventUpdate?(): void;
        //the enum array or item for the onUserRefresh
        onScheduleUpdateRecv?: UIUtil.RecvParams | Array<UIUtil.RecvParams>;
        //run only when the user triggers a refresh (includes the app coming in and out of focus)
        onScheduleUpdateRefresh?(): void;
    }
    //didn't have a better place to put this :(
    export interface ButtonParam {
        text: string,
        callback: () => void;
        longPressCallback?: () => void;
        icon?: string,
    }
}

export = UIUtil;