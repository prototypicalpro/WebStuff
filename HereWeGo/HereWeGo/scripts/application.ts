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

"use strict";

var data: DataManage;
var sched: SchedDataManage = new SchedDataManage();
var cal: CalDataManage = new CalDataManage();
var get: GetLib = new GetLib();
var slider: SlideTabUI;

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
            slider = new SlideTabUI('very unique id');

            let schedule: ScheduleUtil.Schedule = sched.getScheduleFromKey(key);
            if (key === null) console.log("No school dumbo");
            else {
                constructTop(schedule);
                //but with moar everthing else because we know our data now
                //construct schedule graphic
                let tempGraphic = new ScheduleGraphic('unique id');

                let currentPeriod = schedule.getCurrentPeriodIndex();
                //line color based on some math I never plan on writing
                let periodInc = 0;
                const lineColors: Array<string> = ['#90ee90', '#73d26f', '#55b54e', '#359a2d', '#008000'];
                for (let i = 0; i < schedule.getNumPeriods(); i++) {
                    //cache period for less keyboard strain
                    let period = schedule.getPeriod(i);
                    if (period.getType() !== ScheduleUtil.PeriodType.PASSING) {
                        //background color based on current period
                        tempGraphic.pushBackRow(
                            period.getStart().format('h:mma'), period.getEnd().format('h:mma'),
                            lineColors[periodInc],
                            period.getName(),
                            3 === i ? 'lightgreen' : undefined,
                        );
                        periodInc++;
                    }
                }
                slider.pushBackItem(tempGraphic.getHTML());
            }

            //are you ready for this hawt event construction
            //its gonna have so many callbacks I'm gonna die
            let tempEvent = new EventGraphic('unique id 2');
            return cal.getEvents(new Date(), (event: EventInterface) => {
                tempEvent.pushBackEvent(moment(event.startTime).format('h:mma'), event.title);
            }).then(() => {
                slider.pushBackItem(tempEvent.getHTML());
                //and the final touch
                HTMLMap.topLowText.innerHTML = "Period 3";
                HTMLMap.bottomBarText.innerHTML = "45 Minutes Remaining"

                HTMLMap.appendSliderHTML(slider.getHTML());
                slider.startSliderUI();
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