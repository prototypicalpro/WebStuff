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
import HTMLMap = require('./HTMLMap');

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

function updateTime(schedule: ScheduleUtil.Schedule): void {
    const index = schedule.getCurrentPeriodIndex();
    if (index === ScheduleUtil.PeriodType.BEFORE_START) {
        //before start code
        HTMLMap.bottomBarText.innerHTML = "School starts " + moment().to(schedule.getPeriod(0).getStart());
        HTMLMap.topLowText.innerHTML = "";
    }
    if (index === ScheduleUtil.PeriodType.AFTER_END) {
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
    data = new DataManage(get, [cal]);
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
        let end: number = performance.now();
        console.log("Init took " + (end - start));
        //loggy loggy
        //console.log(sched.getScheduleFromKey('C'));
        cal.getEvents(new Date(), (event: EventInterface) => {
            console.log(JSON.stringify(event));
        });

        //testing stuff
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'red', rightText: 'Period 1', backgroundColor: '#EFEFEF', fontWeight: '200', fontColor: 'black' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'orange', rightText: 'Period 2', backgroundColor: 'lightgreen', fontWeight: '200', fontColor: 'black' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'yellow', rightText: 'Lunch', backgroundColor: '#EFEFEF', fontWeight: '200', fontColor: 'black'  });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'green', rightText: 'Period 3', backgroundColor: '#EFEFEF', fontWeight: '200', fontColor: 'black'  });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'blue', rightText: 'Period 4', backgroundColor: '#EFEFEF', fontWeight: '200', fontColor: 'black'  });

        HTMLMap.topUpText.innerHTML = 'A';
        HTMLMap.topLowText.innerHTML = 'Period 2';

        HTMLMap.bottomBarText.innerHTML = '45 Minutes Remaining';

        HTMLMap.startAnimation();
    }).then(data.initData.bind(data), (err) => console.log(err)).catch(data.initData.bind(data)).then(() => {
        
    }, (err) => console.log(err));
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}