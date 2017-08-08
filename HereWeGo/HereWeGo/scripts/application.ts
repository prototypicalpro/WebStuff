// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import localForage = require("localforage");
import * as moment from 'moment';
import { LOCALFORAGE_NAME } from './WHSLib/CacheKeys'
import GetLib = require('./GetLib/GetLib');
import DataManage = require('./WHSLib/DataManage');
import SchedDataManage = require('./WHSLib/SchedDataManage');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import CalDataManage = require('./WHSLib/CalDataManage');
import EventInterface = require('./WHSLib/EventInterface');
import ScheduleGraphic = require('./UILib/ScheduleGraphic');
import EventGraphic = require('./UILib/EventGraphic');
import SlideTabUI = require('./UILib/SlideTabUI');
import HTMLMap = require('./HTMLMap');
import Page = require('./UILib/Page');

"use strict";

var data: DataManage;
var sched: SchedDataManage = new SchedDataManage();
var cal: CalDataManage = new CalDataManage();
var get: GetLib = new GetLib();

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    //configure localforage
    localForage.config({ name: LOCALFORAGE_NAME });
}

function constructTop(schedule: ScheduleUtil.Schedule): void {
    const index = schedule.getCurrentPeriodIndex();
    if (index === ScheduleUtil.PeriodType.BEFORE_START) {
        //before start code
        HTMLMap.bottomBarText.innerHTML = "School starts " + moment().to(schedule.getPeriod(0).getStart());
        HTMLMap.topLowText.innerHTML = "";
    }
    else if (index === ScheduleUtil.PeriodType.AFTER_END) {
        //after end code
        HTMLMap.bottomBarText.innerHTML = moment().format('LT');
        HTMLMap.topLowText.innerHTML = "";
    }
    else {
        //current period code
        const period = schedule.getPeriod(index);
        HTMLMap.bottomBarText.innerHTML = moment().to(period.getEnd(), true) + " remaining";
        HTMLMap.topLowText.innerHTML = "Period " + period.getName();
    }

    HTMLMap.topUpText.innerHTML = schedule.getName();
}

function onDeviceReady(): void {
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);

    // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.

    if (!get.initAPI()) console.log("HTTP failed!");
    data = new DataManage(get, [cal, sched]);
    // Register button
    /*
    document.querySelector('.fab').addEventListener('click', () => {
        console.log("click!");
        HTMLMap.deleteScheduleRows();
        data.refreshData().then(() => {
            console.log(sched.getScheduleFromKey('C'));
        });
    });
    */

    let start: number = performance.now();
    //grabby grabby
    data.loadData().then(() => {
        //start up the early data stuff
        //we're assuming that we only need a few importnant data when we initially launch the app,
        //so we build the rest after we get updated data from the interwebs
        return cal.getScheduleKey(new Date()).then((key: string) => {
            let schedule: ScheduleUtil.Schedule = sched.getScheduleFromKey(key);
            if (key === null) console.log("No school dumbo");
            else constructTop(schedule);
        });
    }).then(data.getNewData.bind(data)).catch(data.getNewData.bind(data)).then(() => {
        //do it again to make sure nothing has changed
        return cal.getScheduleKey(new Date()).then((key: string) => {
            //quicklaunch stuff
            let schedule: ScheduleUtil.Schedule = sched.getScheduleFromKey(key);
            if (key === null) console.log("No school dumbo");
            else constructTop(schedule);

            //event object, since iteration (sigh)
            let eventUI: EventGraphic = new EventGraphic(null);

            //get all the events in there
            return cal.getEvents(new Date(), eventUI.iterateEvent.bind(this)).then(() => {
                //construct the whole second page
                //ONE LINE WOOOOOOOO
                HTMLMap.setSliderHTML(new SlideTabUI([
                    new Page('Schedule', [
                        new ScheduleGraphic(schedule),
                        eventUI,
                    ])
                ]).getHTML());
                //beuty in abstracton my friends
                SlideTabUI.startSliderUI();
                //debug of course

                let end: number = performance.now();
                console.log("Init took " + (end - start));
            });
        });
    }, (err) => console.log(err));
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}