// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import * as moment from 'moment';
import DataManage = require('./WHSLib/DataManage');
import SchedDataManage = require('./WHSLib/SchedDataManage');
import ScheduleData = require('./WHSLib/ScheduleData');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import CalDataManage = require('./WHSLib/CalDataManage');
import EventData = require('./WHSLib/EventData');
import EventInterface = require('./WHSLib/EventInterface');
import ScheduleGraphic = require('./UILib/ScheduleGraphic');
//import EventGraphic = require('./UILib/EventGraphic');
import SlideTabUI = require('./UILib/SlideTabUI');
import HTMLMap = require('./HTMLMap');
import Page = require('./UILib/Page');

"use strict";

var data: DataManage = new DataManage([new CalDataManage(), new SchedDataManage()]);

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    console.log("init func: " + performance.now());
}

function constructTop(schedule: ScheduleUtil.Schedule): void {
    const index = schedule.getCurrentPeriodIndex(Date.now());
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
    console.log("device ready: " + performance.now());
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);

    let start: number = performance.now();
    //grabby grabby
    data.initData().then(() => {
        //start up the early data stuff
        let calData: EventData = data.returnData(0);
        //grab the schedule key
        return calData.getScheduleKey(new Date());
    }).then((key: string) => {
        //check key, then get the schedule for it
        if (key === null) console.log('No School dumbo');
        else return (data.returnData(1) as ScheduleData).getSchedule(key);
    }).then((sched: ScheduleUtil.Schedule) => {
        //we're assuming that we only need a few importnant data when we initially launch the app,
        //so we build the rest after we get updated data from the interwebs
        constructTop(sched);
        let end = performance.now();
        console.log("Init took: " + (end - start));
        data.initHTTP();
        return data.getNewData();
        //after that ridiculous nonsense, we grab new data, and do it all over again
    }).catch((err) => console.log(err)).catch(data.getNewData.bind(data)).then(() => {
        start = performance.now();
        //start up the early data stuff
        let calData: EventData = data.returnData(0);
        //grab the schedule key
        return calData.getScheduleKey(new Date());
    }).then((key: string) => {
        //check key, then get the schedule for it
        if (key === null) console.log('No School dumbo');
        else return (data.returnData(1) as ScheduleData).getSchedule(key);
    }).then((sched: ScheduleUtil.Schedule) => {
        //reload!
        constructTop(sched);
        //and the moment you've all been wating for: the rest of the UI
        let dataObj = data.returnData();
        //return the contructed html
        return new SlideTabUI([
            new Page('Schedule', [
                new ScheduleGraphic(dataObj[1], dataObj[0])
            ])
        ]).getHTML();
    }).then((html: string) => {
        //aaand yay!
        HTMLMap.setSliderHTML(html);
        SlideTabUI.startSliderUI();
        let end = performance.now();
        console.log("Second init took: " + (end - start));
    }).catch((err) => console.log(err));
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}