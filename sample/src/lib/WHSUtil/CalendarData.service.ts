/*
 * Library which grabs, parses, and returns events, class schedule,
 * and other useful items from the Wilson High School Calendar
 * 
 * Based on asynchronous promises, and will cache calendar readings
 * to improve performance
 */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http'
import { WHSSched } from '../../lib/WHSUtil/WHSSched.ts';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

//because library is written for the Wilson Calender, calender credentials will be
//static
const CAL_ID: string = 'o2tur235ud7inbdm3je330pl4c@group.calendar.google.com';
//const CAL_ID: string = 'anythingupgrade@gmail.com'
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
    private cache: Storage;
    private http: Http;

    private nextSyncToken: string;
    private eventList: Object;
    private lastStored: Date;
    private cachedTodayEvents: Array<any>;

    private storageReady: boolean = false;
    private constructed: boolean = false;

    constructor(http: Http, cache: Storage) {
        //init cache service
        this.cache = cache;
        //init http
        this.http = http;
        //trigger contructed flag
        this.constructed = true;
    }

    /*
     * Misc utils, function to completly wipe calendar as well
     */

    private getNewCalendar(): Promise<any> {
        //today, and some days from now
        let today = new Date();
        today.setHours(0, 0, 0); 
        let sometime = new Date(today);
        sometime.setDate(sometime.getDate() + CAL_CACHE_DAYS);

        //cache the forward date object so we can determine how far forward in the calendar we cached
        this.cache.set(LASTDAY_CACHE_KEY, sometime.toISOString());
        this.lastStored = sometime;

        //grab stuff, split, parse, and save
        let request = this.http.get(this.formatRequest(['timeMin', today.toISOString()], ['timeMax', sometime.toISOString()])).map(res => res.json()).toPromise().then((data) => {
            //clear event cache
            this.cachedTodayEvents = undefined;

            //store sync token for later use
            this.nextSyncToken = data.nextSyncToken;
            this.cache.set(SYNC_CACHE_KEY, data.nextSyncToken);
            
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
            this.cache.set(EVENT_CACHE_KEY, JSON.stringify(evList));

            //should I return things? naw
        });

        //errors will be handled in application so I can show toasts without including UI in service
        return request;
    }

    private formatRequest(...args): string{
        let ret = URL;
        let n = args.length;
        for(let i = 0; i < n; i++){
            ret += '&' + args[i][0] + '=';
            ret += args[i][1];
        }
        return ret;
    }

    private cacheTodaysEvents() : void {
        //please call syncCalender() before calling this function, I would rather not have it automatically call it b/c its kinda inconsistent for this API
        //init array
        this.cachedTodayEvents = [];

        //iterate through event list, looking for events today
        for(let event in this.eventList){
            //saftey check
            if(this.eventList.hasOwnProperty(event)){
                //if the event is on the day we last checked the calendar, store it in the cache array thing
                let betterEvent : Event = Event.fromCachable(this.eventList[event]);
                if(betterEvent.getTime().toDateString() == new Date().toDateString()) this.cachedTodayEvents.push(betterEvent);
            }
        }
    }

    private cacheTodaysEventsPromise() : Promise<any> {
        return new Promise((resolve) => {
            this.cacheTodaysEvents();
            return resolve();
        })
    }

    /*
     * Stupid promise chaining functions
     */

    //function which checks the date stored in the calendar
    private dayCheckFunc() : Promise<any> {
        return new Promise((resolve, reject) => {
             //if we have the stored date, check it
            if(this.lastStored != undefined){
                //if the last date retrieved is greater than the current date
                if(this.lastStored.getTime() > new Date().setHours(0,0,0,0)) return resolve();
                else return reject("Cache out of date");
            }
            //check if stored calendar has today
            let checkSyncDate = this.cache.get(LASTDAY_CACHE_KEY).then((lastDate) => {
                //if last date retrieved is less than current date or lastDate retrieved is junk
                let date = new Date(lastDate);
                if(lastDate == 0) return reject("No last date stored");
                if(date.getTime() < new Date().setHours(0,0,0,0)) return reject("Cache out of date");
                //else cache date and return true
                this.lastStored = new Date(date);
                return resolve();
            }, () => { return reject("No last date stored"); });
            //guess we gotta wait on that one
            return checkSyncDate;
        });
    }

    //function which checks if calendar hasn't already been loaded into memory
    private cacheLoadCheckFunc() : Promise<any> {
        return new Promise((resolve, reject) => {
            if(this.eventList != undefined) return resolve();
            //load it from cache
            let cacheLoad = this.cache.get(EVENT_CACHE_KEY).then((events) => {
                this.eventList = JSON.parse(events);
                return resolve();
            }, () => { return reject("No event cache"); });
            return cacheLoad;
        });
    }

    //function which checks the sync token
    private syncTokenCheckFunc() : Promise<any> {
        return new Promise((resolve, reject) => {
            //if we already have a sync token, get to syncing already
            if(this.nextSyncToken != undefined) return resolve();
            //load stored syncToken
            let syncLoad = this.cache.get(SYNC_CACHE_KEY).then((token) => {
                //sir, we got a token
                this.nextSyncToken = token;
                return resolve();
            }).catch(() => { return reject("No stored sync token "); });
            return syncLoad;
        });
    }

    private syncFunc() : Promise<any> {
         let request = this.http.get(this.formatRequest(['syncToken', this.nextSyncToken])).map(res => res.json()).toPromise().then((syncData) => {
            //clear event cache
            this.cachedTodayEvents = undefined;
            //refresh syncToken
            this.nextSyncToken = syncData.nextSyncToken;
            this.cache.set(SYNC_CACHE_KEY, syncData.nextSyncToken);
            //check if anything to sync
            if(syncData.items.length == 0) return;
            //iterate through synced events, updating the cached events
            let n = syncData.items.length;
            for(let i = 0; i < n; i++){
                //delete existing event
                delete this.eventList[syncData.items[i].id];
                //if it's not a cancellation, add updated event back to list
                if(syncData.items[i].status != 'cancelled') {
                    let betterEvent = Event.fromGCAL(syncData.items[i]);
                    this.eventList[betterEvent.getID()] = betterEvent.returnCachable(); 
                }
            }
            //and finnally cache dat shizzle
            this.cache.set(EVENT_CACHE_KEY, JSON.stringify(this.eventList));
            return;
        }).catch((err) => {
            //catch only error 410
            if(err.status == 410) return this.getNewCalendar();
            else return err;
        });

        //errors will be handled in application so I can show toasts without including UI in service
        return request;
    }

    /* 
     * Actual exposed functions
     * probably easy to tell what they do
     * or at least I hope so, because this comment sure isn't helpful
     */

    whenReady() : Promise<any> {
        return new Promise((resolve, reject) => {
            while(this.constructed == false);
            console.log(this);
            return resolve();
        });
    }

    initCalendar() : Promise<any> {
        //wooo javascript
        //alright, lets do this chaining
        //set cache ready and load up the calendar
        return this.cache.ready().then(() => {
            return this.dayCheckFunc();
        }).then(() => {
            return this.cacheLoadCheckFunc();  
        }).then(() => {
            return this.syncTokenCheckFunc();  
        }).then(() => {
            return this.syncFunc();
        }).catch((error) => {
            console.log(error);
            return this.getNewCalendar();
        }).then(() => {
            return this.cacheTodaysEventsPromise();
        }).then(() => this.storageReady = true);
    }

    syncCalendar() : Promise<any> {
        //note: when using sync tokens, googles API docs specify that the API will sometimes refuse the token
        //in this case, the error will be 410 GONE
        //for now I'll just catch the error and request a new calendar
        if(this.storageReady == false) throw("Storage not ready!");

        //mega chaining ahead
        //check day -> check cache -> check sync token -> sync -> cache events
        return this.dayCheckFunc().then(() => {
            return this.syncFunc();
        }).catch(() => {
            return this.getNewCalendar();  
        }).then(() => {
            return this.cacheTodaysEventsPromise();
        });
    }

    getCachedTodayEvents() : Array<Event> { return this.cachedTodayEvents; }

    clearCache() { return this.cache.clear(); }
}