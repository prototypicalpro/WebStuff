/*
 * Library which grabs, parses, and returns events, class schedule,
 * and other useful items from the Wilson High School Calendar
 * 
 * Based on asynchronous promises, and will cache calendar readings
 * to improve performance
 */
import Event = require('./Event');
import CalendarInterface = require('../CalGetLib/CalendarInterface');
import localForage = require("localforage");

//some settings, which I will put somewhere sometime
const CAL_CACHE_DAYS: number = 5; //days of calendar to cache ahead of time
const EVENT_CACHE_KEY: string = '0'; //arbitrary cache keys, b/c I made my own key system. this cache key is for the array of parsed events
const SYNC_CACHE_KEY: string = '1'; //this key is for a sync token from the calendar API 
const LASTDAY_CACHE_KEY: string = '2'; //this key stores the last day the API cached, so as to know when to refresh it's sync and cache stuff

class CalendarData {
    private http: CalendarInterface;

    private nextSyncToken: string;
    private eventList: Object;
    private lastStored: Date;

    private initPromise: Promise<any>;

    constructor(http: CalendarInterface) {
        //init http
        this.http = http;
    }

    /*
     * Misc utils, function to completly wipe calendar as well
     */

    private getNewCalendar(): Promise<any> {
        console.log("Getting new Calendar!");
        //today, and some days from now
        let today = new Date();
        today.setHours(0, 0, 0); 
        let sometime = new Date(today);
        sometime.setDate(sometime.getDate() + CAL_CACHE_DAYS);

        //cache the forward date object so we can determine how far forward in the calendar we cached
        localForage.setItem(LASTDAY_CACHE_KEY, sometime.toISOString());
        this.lastStored = sometime;

        return this.http.getCalendar({ timeMin: today.toISOString(), timeMax: sometime.toISOString() }).then((data: any) => {
            //store sync token for later use
            this.nextSyncToken = data.nextSyncToken;
            localForage.setItem(SYNC_CACHE_KEY, data.nextSyncToken);
            
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
            localForage.setItem(EVENT_CACHE_KEY, JSON.stringify(evList));

            //should I return things? naw
        });
    }

    /*
     * Stupid promise chaining functions
     */

    //function which checks the date stored in the calendar
    private dayCheckFunc() : Promise<any> {
        //if we have the stored date, check it
        if(this.lastStored != undefined){
            //if the last date retrieved is greater than the current date
            if(this.lastStored.getTime() > new Date().setHours(0,0,0,0)) return Promise.resolve();
            else return Promise.reject("Cached date out of date");
        }
        //check if stored calendar has today
        return localForage.getItem(LASTDAY_CACHE_KEY).then((lastDate) => {
            //if last date retrieved is less than current date or lastDate retrieved is junk
            if(lastDate == null) return Promise.reject("No last date stored");
            let date = new Date(lastDate);
            if(date.getTime() < new Date().setHours(0,0,0,0)) return Promise.reject("Cache out of date");
            //else cache date and return true
            this.lastStored = new Date(date);
            return Promise.resolve();
        }, () => { return Promise.reject("No last date stored"); });
    }

    //function which checks if calendar hasn't already been loaded into memory
    private cacheLoadCheckFunc() : Promise<any> {
        if(this.eventList != undefined) return Promise.resolve();
        //load it from cache
        return localForage.getItem(EVENT_CACHE_KEY).then((events: string) => {
            if(events == null) return Promise.reject("No event cache");
            this.eventList = JSON.parse(events);
            return Promise.resolve();
        }, () => { return Promise.reject("No event cache"); });
    }

    //function which checks the sync token
    private syncTokenCheckFunc() : Promise<any> {
        //if we already have a sync token, get to syncing already
        if(this.nextSyncToken != undefined) return Promise.resolve();
        //load stored syncToken
        return localForage.getItem(SYNC_CACHE_KEY).then((token: string) => {
            if(token == null) return Promise.reject("No stored sync token");
            //sir, we got a token
            this.nextSyncToken = token;
            return Promise.resolve();
        }).catch(() => { return Promise.reject("No stored sync token"); });
    }

    private syncFunc(): Promise<any> {
        return this.http.getCalendar({ syncToken: this.nextSyncToken }).then((syncData: any) => {
            //refresh syncToken
            this.nextSyncToken = syncData.nextSyncToken;
            localForage.setItem(SYNC_CACHE_KEY, syncData.nextSyncToken);
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
            localForage.setItem(EVENT_CACHE_KEY, JSON.stringify(this.eventList));
            return;
        }).catch((err) => {
            //catch only error 410
            if(err.status == 410) return this.getNewCalendar();
            else return err;
        });
    }

    /* 
     * Actual exposed functions
     * probably easy to tell what they do
     * or at least I hope so, because this comment sure isn't helpful
     */

    initCalendar() : Promise<any> {
        //wooo javascript
        //alright, lets do this chaining
        //set cache ready and load up the calendar
        //let start, dayCheck, cacheCheck, syncCheck, sync, newCal, cacheToday, errorTime;
        this.initPromise = localForage.ready().then(() => {
            return Promise.all([this.dayCheckFunc(), this.cacheLoadCheckFunc(), this.syncTokenCheckFunc()]);
        }).then(this.syncFunc.bind(this), this.getNewCalendar.bind(this));
        return this.initPromise;
    }

    syncCalendar() : Promise<any> {
        //note: when using sync tokens, googles API docs specify that the API will sometimes refuse the token
        //in this case, the error will be 410 GONE
        //for now I'll just catch the error and request a new calendar

        return Promise.all([this.dayCheckFunc(), this.syncTokenCheckFunc()]).then(this.syncFunc.bind(this), this.getNewCalendar.bind(this));
    }

    onInitFinish() : Promise<any> { return this.initPromise; }

    getTodaysEvents() : Array<Event> {
        let retEvent: Array<Event> = [];
        //iterate through event list, looking for events today
        for(let event in this.eventList){
            //saftey check
            if(this.eventList.hasOwnProperty(event)){
                //if the event is on the day we last checked the calendar, store it in the cache array thing
                let betterEvent : Event = Event.fromCachable(this.eventList[event]);
                if(betterEvent.getTime().toDateString() === new Date().toDateString()) retEvent.push(betterEvent);
            }
        }
        return retEvent;
    }

    clearCache(): Promise<any> { return localForage.clear(); }
}

export = CalendarData;