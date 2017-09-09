// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import * as moment from 'moment';
import lory = require('./lory');
import DataManage = require('./WHSLib/DataManage');
import SchedDataManage = require('./WHSLib/SchedDataManage');
import ScheduleData = require('./WHSLib/ScheduleData');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import CalDataManage = require('./WHSLib/CalDataManage');
import EventData = require('./WHSLib/EventData');
import EventInterface = require('./WHSLib/EventInterface');
import ScheduleGraphic = require('./UILib/ScheduleGraphic');
import EventGraphic = require('./UILib/EventGraphic');
import SlideTabUI = require('./UILib/SlideTabUI');
import SyncUI = require('./UILib/SyncUI');
import UIUtil = require('./UILib/UIUtil');
import HTMLMap = require('./HTMLMap');
import ErrorUtil = require('./ErrorUtil');
import ToastUI = require('./UILib/ToastUI');

"use strict";

var data: DataManage = new DataManage([new CalDataManage(), new SchedDataManage()]);
var toast: ToastUI = new ToastUI(HTMLMap.toastBox);
var sync: SyncUI;

var menu;

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    //StatusBar.styleLightContent();
    console.log("init func: " + performance.now());
}

function onDeviceReady(): void {
    console.log("device ready: " + performance.now());
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);

    let start: number = performance.now();
    const today = new Date();
    //grabby grabby
    data.initData().then(() => {
        //start up the early data stuff
        const calData: EventData = data.returnData(0);
        const schedData: ScheduleData = data.returnData(1);
        //grab the schedule key
        return schedData.getSchedule(today, calData);
    }).catch((err) => {
        if (err === ErrorUtil.code.NO_SCHOOL) return null;
        else throw err;
    }).then((sched: ScheduleUtil.Schedule) => {
        //we're assuming that we only need a few importnant data when we initially launch the app,
        //so we build the rest after we get updated data from the interwebs
        constructTop(today, sched);
        let end = performance.now();
        console.log("Init took: " + (end - start));
            //after that ridiculous nonsense, we grab new data, and do it all over again
    }).catch((err) => {
        if (err === ErrorUtil.code.NO_STORED) return true;
        else throw err;
    }).then((getNewData: boolean | null) => {
        //start up http
        data.initHTTP();
        //grab them datums
        if (getNewData) return data.getNewData();
        return data.refreshData();
    }).catch((err) => {
        if (err === ErrorUtil.code.HTTP_FAIL) setTimeout(toastError, 1000, "This phone is unsupported!");
        else if (err === ErrorUtil.code.NO_INTERNET || err === ErrorUtil.code.BAD_RESPONSE) setTimeout(toastError, 1000, "No Internet available!");
        else throw err;
    }).then(() => {
        start = performance.now();
        //start up the early data stuff
        const calData: EventData = data.returnData(0);
        const schedData: ScheduleData = data.returnData(1);
        //set date constants
        //for today, tommorrow, and day after
        let tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        let nextDay = new Date();
        nextDay.setDate(today.getDate() + 2);
        //this is tricky
        //I think what I want to to do is create an array of UI element promises to construct
        //but it's gonna get messy (there's gonna be a lot of catch statments)
        return schedData.getSchedule(today, calData).catch((err) => {
            if (err === ErrorUtil.code.NO_SCHOOL) return null;
            throw err;
        }).then((sched) => {
            //construct top handles null, so we just hand is striaght over
            constructTop(today, sched);
            return Promise.all([
                !sched ? null : new ScheduleGraphic(sched),
                eventGraphicFromDay(calData, schedData, today, "Today", !sched),
                eventGraphicFromDay(calData, schedData, tomorrow, "Tomorrow", true),
                eventGraphicFromDay(calData, schedData, nextDay, moment(nextDay).format('dddd'), true),
            ]);
        });
    }).then((items: Array<any>) => {
        //check first element of array, if it's null, slice it
        if (!items[0]) items.splice(0, 1);
        return new SlideTabUI([items]).getHTML();
    }).then((html: string) => {
        //aaand yay!
        HTMLMap.setSliderHTML(html);
        SlideTabUI.startSliderUI();
        let end = performance.now();
        console.log("Second init took: " + (end - start));

        //DEBUG for side menu
        menu = lory.lory(document.querySelector('body'), {
            //different naming scheme
            classNameFrame: 'SMFrame',
            classNameSlideContainer: 'SMCont',
            //snappier scrolling
            slideSpeed: 300,
            snapBackSpeed: 200,
            ease: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
            //disable overflow scrolling
            overflowScroll: false,
            //set default index to when menu is hidden
            defaultIndex: 1,
            //and no touchy when it's hidden as well
            noTouchIndex: 1,
            //finally, black fade thingy
            indicators: [{
                element: document.querySelector('.SMShadow'),
                speedRatio: 0.002,
                style: 'opacity',
                reverse: true,
            }],
        });

        //menu button check
        document.querySelector('#sideButton').addEventListener('touchstart', (event) => {
            menu.slideTo(0);
        });

        //tap outside of menu to close check
        document.querySelector('.SMFrame').addEventListener('touchstart', (event) => {
            //MUST CHANGE TO REFLECT MENU SIZE
            if (event.changedTouches[0].clientX > 0.7 * screen.width) {
                event.preventDefault();
                menu.slideTo(1);
            }
        });
    }).catch((err) => {
        console.log(ErrorUtil.code[err]);
        console.log(err);
    });
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}

/**
 * UI Functions which I will probably move at some point
 * Control all appearance things about the app, 
 */

//this function constructs all the UI
//if you want to do things with the UI, probably a good idea to do them here
function constructAndInitFullUI(events: EventData, sched: ScheduleData, day: Date): Promise<void> {
    let start = performance.now();
    //set date constants
    //for today, tommorrow, and day after
    let tomorrow = new Date(day);
    tomorrow.setDate(day.getDate() + 1);
    let nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 2);
    //array for storing UIItems
    let itemRay: Array<UIUtil.UIItem> = [];
    //promises, they feel oh so wasted on myself
    return sched.getSchedule(day, events).catch((err) => {
        if (err === ErrorUtil.code.NO_SCHOOL) return null;
        throw err;
    }).then((schedule: ScheduleUtil.Schedule) => {
        //construct top handles null, so we just hand is striaght over
        constructTop(day, schedule);
        return Promise.all([
            !sched ? null : new ScheduleGraphic(schedule),
            eventGraphicFromDay(events, sched, day, "Today", !sched),
            eventGraphicFromDay(events, sched, tomorrow, "Tomorrow", true),
            eventGraphicFromDay(events, sched, nextDay, moment(nextDay).format('dddd'), true),
        ]);
    }).then((ray: Array<UIUtil.UIItem | null>) => {
        if (!ray[0]) ray.splice(0, 1);
        itemRay.push(new SlideTabUI([ray]));
        //add more UIItems here
        //do construction
        return Promise.all(itemRay.map((item) => { return item.getHTML(); }));
    }).then((htmls: Array<string>) => {

    })
}

//this function assumes dataObj is constant and global
function eventGraphicFromDay(events: EventData, sched: ScheduleData, day: Date, title: string, schedule?: boolean): Promise<EventGraphic> {
    if (!schedule) return new Promise((resolve) => {
        return resolve(new EventGraphic(events, title, day.setHours(0, 0, 0, 0), day.setHours(23, 59, 59, 999)));
    });
    else return sched.getSchedule(day, events).then((sched: ScheduleUtil.Schedule) => {
        return new EventGraphic(events, title, day.setHours(0, 0, 0, 0), day.setHours(23, 59, 59, 999), [ScheduleData.eventFromSchedule(sched)]);
    }).catch((err) => {
        const noSchoolEvent: EventInterface = {
            title: 'No School',
            startTime: 0,
            endTime: 0,
            isAllDay: true,
            id: '',
            schedule: true,
        }
        if (err === ErrorUtil.code.NO_SCHOOL) return new EventGraphic(events, title, day.setHours(0, 0, 0, 0), day.setHours(23, 59, 59, 999), [noSchoolEvent]);
        throw err;
    });
}

function constructTop(day: Date, schedule?: ScheduleUtil.Schedule) {
    if (!schedule) {
        HTMLMap.timeText.innerHTML = moment(day).format('LT');
        HTMLMap.backText.innerHTML = "";
        HTMLMap.periodText.innerHTML = "No School";
    }
    else {
        //get current period
        const index = schedule.getCurrentPeriodIndex(day.getTime());
        if (index === ScheduleUtil.PeriodType.BEFORE_START) {
            //before start code
            HTMLMap.timeText.innerHTML = "School starts " + moment().to(schedule.getPeriod(0).getStart());
            HTMLMap.periodText.innerHTML = "";
        }
        else if (index === ScheduleUtil.PeriodType.AFTER_END) {
            //after end code
            HTMLMap.timeText.innerHTML = moment().format('LT');
            HTMLMap.periodText.innerHTML = "";
        }
        else {
            //current period code
            const period = schedule.getPeriod(index);
            HTMLMap.timeText.innerHTML = moment().to(period.getEnd(), true) + " remaining";
            switch (period.getType()) {
                case ScheduleUtil.PeriodType.CLASS:
                    HTMLMap.periodText.innerHTML = 'Period ' + period.getName();
                    break;
                case ScheduleUtil.PeriodType.LUNCH:
                    HTMLMap.periodText.innerHTML = 'Lunch';
                    break;
                case ScheduleUtil.PeriodType.PASSING:
                    HTMLMap.periodText.innerHTML = 'Passing';
                    break;
            }
        }

        HTMLMap.backText.innerHTML = schedule.getName()[0];
    }
}

function toastError(msg: string): void {
    toast.showToast(msg);
}
