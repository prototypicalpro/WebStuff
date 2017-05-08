/*
 * Library which grabs, parses, and returns events, class schedule,
 * and other useful items from the Wilson High School Calendar
 * 
 * Based on asynchronous promises, and will cache calendar readings
 * to improve performance
 */
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';
import { Http } from '@angular/http'
import { WHSSched } from '../../lib/WHSUtil/WHSSched.ts';

import 'rxjs/add/operator/toPromise';
import * as moment from 'moment';

//because library is written for the Wilson Calender, calender credentials will be
//static
//const CAL_ID: string = 'o2tur235ud7inbdm3je330pl4c@group.calendar.google.com';
const CAL_ID: string = 'anythingupgrade@gmail.com'
const API_KEY: string = 'AIzaSyB0FJRVrer63aO-U_4JFi-6XCo0bS6Y6yk';
const URL: string = 'https://www.googleapis.com/calendar/v3/calendars/' + CAL_ID + '/events?singleEvents=true&key=' + API_KEY;

//some settings, which I will put somewhere sometime
const CAL_CACHE_DAYS: number = 5; //days of calendar to cache ahead of time
const EVENT_CACHE_KEY: string = '0'; //arbitrary cache keys, b/c I made my own key system. this cache key is for the array of parsed events
const SYNC_CACHE_KEY: string = '1'; //this key is for a sync token from the calendar API 
const LASTDAY_CACHE_KEY: string = '2'; //this key stores the last day the API cached, so as to know when to refresh it's sync and cache stuff

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

@Injectable()
export class CalendarData {
    private cache: CacheService;
    private http: Http;

    private nextSyncToken: string;
    private eventList: Object;
    private lastUpdated: Date;
    private lastStored: Date;
    private cachedTodayEvents: Array<any>;

    constructor(http: Http, cache: CacheService) {
        //init cache service
        this.cache = cache;
        //init http
        this.http = http;
        
    }

    private getNewCalender(): Promise<any> {
        //today, and some days from now
        let today = new Date();
        today.setHours(0, 0, 0); 
        let sometime = new Date(today);
        sometime.setDate(sometime.getDate() + CAL_CACHE_DAYS);

        //cache the forward date object so we can determine how far forward in the calendar we cached
        this.cache.saveItem(LASTDAY_CACHE_KEY, sometime.toISOString());
        this.lastStored = sometime;

        console.log(this.formatRequest(['timeMin', today.toISOString()], ['timeMax', sometime.toISOString()]));

        //grab stuff, split, parse, and save
        let request = this.http.get(this.formatRequest(['timeMin', today.toISOString()], ['timeMax', sometime.toISOString()])).map(res => res.json()).toPromise().then((data) => {
            console.log(data);
            //and while were at it, store the lastUpdated value
            this.lastUpdated = new Date();
            //clear event cache
            this.cachedTodayEvents = undefined;

            //store sync token for later use
            this.nextSyncToken = data.nextSyncToken;
            this.cache.saveItem(SYNC_CACHE_KEY, data.nextSyncToken);
            
            //sort events by ID
            //by sort I mean create a dict and let javascript do the heavy lifting
            let evList: Object = {};

            let n = data.items.length;
            for(let i = 0; i < n; i++){
                let betterEvent: Event = Event.fromGCAL(data.items[i]);
                //store event
                evList[betterEvent.getID()] = betterEvent.returnCachable();
            }

            //pop data into class members
            this.eventList = evList;
            //and finnally cache dat shizzle
            this.cache.saveItem(EVENT_CACHE_KEY, evList);

            //but I almost forgot:
            console.log(evList);

            //should I return things? naw
        });

        //errors will be handled in application so I can show toasts without including UI in service
        return request;
    }

    syncCalendar(): Promise<any> {
        //note: when using sync tokens, googles API docs specify that the API will sometimes refuse the token
        //in this case, the error will be 410 GONE
        //for now I'll just catch the error and request a new calendar

        //error handler for the numerous faliure points
        let cacheErrorHandler = (error: string) => {
            console.log(error);
            return this.getNewCalender();
        }

        //mega chaining ahead
        //in short: load from cache->day check->(new calendar, sync token check->(new calendar, sync calendar))

        //function which checks if calendar hasn't already been loaded into memory
        let cacheLoadCheckFunc = () : Promise<any> => {
            if(this.eventList != undefined) return dayCheckFunc();
            //load it from cache
            let cacheLoad = this.cache.getItem(EVENT_CACHE_KEY).then((events) => {
                this.eventList = events;
                return dayCheckFunc();
            }).catch(cacheErrorHandler);
            return cacheLoad;
        }

        //function which checks the date stored in the calendar, and returns a promise to check the sync token
        let dayCheckFunc = () : Promise<any> => {
            //if we have the stored date, check it
            if(this.lastStored != undefined){
                //if the last date retrieved is greater than the current date
                if(this.lastStored.getTime() > new Date().setHours(0,0,0,0)) return syncTokenCheckFunc();
                else return cacheErrorHandler("Cache out of date");
            }
            //check if stored calendar has today
            let checkSyncDate = this.cache.getItem(LASTDAY_CACHE_KEY).then((lastDate) => {
                //if last date retrieved is less than current date or lastDate retrieved is junk
                if(typeof lastDate != "string" || new Date(lastDate).getTime() < new Date().setHours(0,0,0,0)) return cacheErrorHandler("Cache out of date");
                //else sync existing one
                return syncTokenCheckFunc();
            }).catch(() => { return cacheErrorHandler("No stored last day") });
            return checkSyncDate;
        }

        //function which checks the sync token, then returns a promise to get an updated calender
        let syncTokenCheckFunc = () : Promise<any> => {
            //if we already have a sync token, get to syncing already
            if(this.nextSyncToken != undefined) return syncFunc();
            //load stored syncToken, and sync/load calender
            let syncLoad = this.cache.getItem(SYNC_CACHE_KEY).then((token) => {
                if(typeof token == "string") {
                    //sir, we got a token
                    this.nextSyncToken = token;
                    return syncFunc();
                }
                //please enjoy this staircase, brought to you by javascript
                else return cacheErrorHandler("No stored sync token");
            }).catch(() => { return cacheErrorHandler("No stored sync token") });
            return syncLoad;
        }

        let syncFunc = () : Promise<any> => {
             let request = this.http.get(this.formatRequest(['syncToken', this.nextSyncToken])).map(res => res.json()).toPromise().then((syncData) => {
                 //store last updated
                this.lastUpdated = new Date();
                //clear event cache
                this.cachedTodayEvents = undefined;
                //refresh syncToken
                this.nextSyncToken = syncData.nextSyncToken;
                this.cache.saveItem(SYNC_CACHE_KEY, syncData.nextSyncToken);
                //log sync data
                console.log(syncData);
                //check if anything to sync
                if(syncData.items.length == 0) {
                    console.log("Sync empty!");
                    return;
                }
                //iterate through synced events, updating the cached events
                let n = syncData.items.length;
                for(let i = 0; i < n; i++){
                    //delete existing event
                    delete this.eventList[syncData.items[i].id];
                    //if it's not a cancellation, add updated event back to list
                    if(syncData.items[i].status != 'cancelled') {
                        let betterEvent = Event.fromGCAL(syncData.items[i]);
                        this.eventList[betterEvent.getID()] = betterEvent.returnCachable(); 
                        console.log("Synced event: "); 
                        console.log(betterEvent.returnCachable()); 
                    }
                    //log
                    else {
                        console.log("Deleted event:");
                        console.log(syncData.items[i].id);
                    }
                }
                //loggy mclogface
                console.log(this.eventList);
                //and finnally cache dat shizzle
                this.cache.saveItem(EVENT_CACHE_KEY, this.eventList);
                return;
            }).catch((err) => {
                //catch only error 410
                if(err.status == 410) return this.getNewCalender();
                else return err;
            });

            //errors will be handled in application so I can show toasts without including UI in service
            return request;
        }

        //alright, lets do this chaining
        return cacheLoadCheckFunc();
    }

    private cacheTodaysEvents() : void {
        //please call syncCalender() before calling this function, I would rather not have it automatically call it b/c its kinda inconsistent for this API
        //init array
        this.cachedTodayEvents = [];

        //iterate through event list, looking for events today
        console.log(this.eventList);
        for(let event in this.eventList){
            //saftey check
            if(this.eventList.hasOwnProperty(event)){
                //if the event is on the day we last checked the calendar, store it in the cache array thing
                let betterEvent : Event = Event.fromCachable(this.eventList[event]);
                console.log(betterEvent);
                if(betterEvent.getTime().toDateString() == this.lastUpdated.toDateString()) this.cachedTodayEvents.push(betterEvent);
            }
        }
    }

    getCachedTodayEvents() : Array<Event> {
        //if undefined, construct it
        if(this.cachedTodayEvents == undefined) this.cacheTodaysEvents();
        return this.cachedTodayEvents;
    }

    clearCache() { return this.cache.clearAll(); }

    private formatRequest(...args): string{
        let ret = URL;
        let n = args.length;
        for(let i = 0; i < n; i++){
            ret += '&' + args[i][0] + '=';
            ret += args[i][1];
        }
        return ret;
    }
}