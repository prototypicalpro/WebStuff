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
import HTMLMap = require('./HTMLMap');
import Page = require('./UILib/Page');

"use strict";

var data: DataManage = new DataManage([new CalDataManage(), new SchedDataManage()]);

var menu;

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    StatusBar.styleLightContent();
    console.log("init func: " + performance.now());
}

function constructTop(schedule: ScheduleUtil.Schedule): void {
    //TODO: REPLACE WITH REAL DATE
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
        switch (period.getType()) {
            case ScheduleUtil.PeriodType.CLASS:
                HTMLMap.topLowText.innerHTML = 'Period ' + period.getName();
                break;
            case ScheduleUtil.PeriodType.LUNCH:
                HTMLMap.topLowText.innerHTML = 'Lunch';
                break;
            case ScheduleUtil.PeriodType.PASSING:
                HTMLMap.topLowText.innerHTML = 'Passing';
                break;
        }
    }

    HTMLMap.topUpText.innerHTML = schedule.getName();
    //TODO: REMOVE
    //HTMLMap.topLowText.innerHTML = 'Period 4';
    //HTMLMap.bottomBarText.innerHTML = '25 minutes remaining';
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
        if (key === null) Promise.reject('No School dumbo');
        else return (data.returnData(1) as ScheduleData).getSchedule(key);
    }).then((sched: ScheduleUtil.Schedule) => {
        //we're assuming that we only need a few importnant data when we initially launch the app,
        //so we build the rest after we get updated data from the interwebs
        constructTop(sched);
        let end = performance.now();
        console.log("Init took: " + (end - start));

        //after that ridiculous nonsense, we grab new data, and do it all over again
    }).catch((err) => console.log(err)).then(() => {
        data.initHTTP();
        return data.getNewData();
    }).then(() => {
        start = performance.now();
        //start up the early data stuff
        let calData: EventData = data.returnData(0);
        //grab the schedule key
        //for today, tommorrow, and day after
        let today = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        let nextDay = new Date();
        nextDay.setDate(today.getDate() + 2);
        return Promise.all([calData.getScheduleKey(today), calData.getScheduleKey(tomorrow), calData.getScheduleKey(nextDay)]);
    }).then((keys: Array<string>) => {
        //check key, then get the schedule for it
        //TODO: Fix
        let schedData = data.returnData(1) as ScheduleData;
        return Promise.all([
            !keys[0] ? null : schedData.getSchedule(keys[0]),
            !keys[1] ? null : schedData.getSchedule(keys[1]),
            !keys[2] ? null : schedData.getSchedule(keys[2])
        ]);
    }).then((sched: Array<ScheduleUtil.Schedule | null>) => {
        //reload!
        constructTop(sched[0]);
        //and the moment you've all been wating for: the rest of the UI
        let dataObj = data.returnData();
        //return the contructed html
        //do date stuff to get start and end of today and tommorrow
        const msInDayMinusOne = 86399999;
        //get start of today
        let start: any = new Date();
        start.setHours(0, 0, 0, 0);
        start = start.getTime();
        //add rest of day to that number to get the end of the day
        let end = start + msInDayMinusOne;
        //then add one to push it over to the next day
        let start2 = end + 1;
        //repeat
        let end2 = start2 + msInDayMinusOne;
        let start3 = end2 + 1;
        let end3 = start3 + msInDayMinusOne;
        return new SlideTabUI([
            new Page('Schedule', [
                new ScheduleGraphic(sched[0]),
                new EventGraphic(dataObj[0], 'Today', start, end),
                new EventGraphic(dataObj[0], 'Tomorrow', start2, end2, !sched[1] ? [{
                    title: 'No School',
                    startTime: 0,
                    endTime: 0,
                    isAllDay: true,
                    id: '',
                    schedule: true,
                }] : [{
                    title: sched[1].getName() + ' Schedule',
                    startTime: 0,
                    endTime: 0,
                    isAllDay: true,
                    id: '',
                    schedule: true,
                }]),
                new EventGraphic(dataObj[0], moment(start3).format('dddd'), start3, end3, !sched[2] ? [{
                    title: 'No School',
                    startTime: 0,
                    endTime: 0,
                    isAllDay: true,
                    id: '',
                    schedule: true,
                }] : [{
                    title: sched[2].getName() + ' Schedule',
                    startTime: 0,
                    endTime: 0,
                    isAllDay: true,
                    id: '',
                    schedule: true,
                }])
            ])
        ]).getHTML();
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
    }).catch((err) => console.log(err));
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}