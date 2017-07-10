// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import localForage = require("localforage");
import Calendar = require('./WHSLib/CalendarData');
import WHSSched = require('./WHSLib/WHSSched');
import * as moment from 'moment';
import WHSEventParse = require('./WHSLib/WHSEventParse');
import Storage = require('./CalGetLib/CalendarInterface');
import Fetch = require('./CalGetLib/FetchCalendarGet');
import Native = require('./CalGetLib/NativeCalendarGet');
import HTMLMap = require('./HTMLMap');

"use strict";

var calendar: Calendar;
var eventList: WHSEventParse;

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    //configure localforage
    localForage.config({ name: 'CalendarCache' });
}

function updateTime(schedule: WHSSched.Schedule): void {
    const index = schedule.getCurrentPeriodIndex();
    if (index === WHSSched.PeriodType.BEFORE_START) {
        //before start code
        HTMLMap.bottomBarText.innerHTML = "School starts " + moment().to(schedule.getPeriod(0).getStart());
        HTMLMap.topLowText.innerHTML = "";
    }
    if (index === WHSSched.PeriodType.AFTER_END) {
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

    // Startup Storage and calendar
    // Check if native storage works
    //if (Native.checkAPI()) {
    //    console.log("Using native http!")
    //    calendar = new Calendar(new Native());
   // }
    //else {
        calendar = new Calendar(new Fetch());
    //}
    // Register button
    document.querySelector('.bottom.fab').addEventListener('click', () => {
        console.log("click!");
        HTMLMap.deleteScheduleRows();
        calendar.clearCache().then(calendar.syncCalendar.bind(calendar)).then(() => console.table(calendar.getTodaysEvents()));
    });

    //grabby grabby
    calendar.initCalendar().then(() => {
        //construct event list
        eventList = new WHSEventParse();
        eventList.filterEvents(calendar.getTodaysEvents());

        if (eventList.getSchoolToday()) {
            //there's school today!
            //do the thing! but, like, a whole bunch
            updateTime(eventList.getSchedule());
            setInterval(updateTime, 60000, eventList.getSchedule());
        }
        else {
            HTMLMap.topLowText.innerHTML = 'No School';
        }

        //testing stuff
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'red', rightText: 'Period 1', backgroundColor: 'lightgray' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'orange', rightText: 'Period 2', backgroundColor: 'lightgreen' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'yellow', rightText: 'Lunch', backgroundColor: '#EFEFEF' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'green', rightText: 'Period 3', backgroundColor: '#EFEFEF' });
        HTMLMap.pushBackScheduleRow({ leftText: ['9:15am', '10:45am'], lineColor: 'blue', rightText: 'Period 4', backgroundColor: '#EFEFEF' });

        HTMLMap.startAnimation();
    }, (err) => console.log(err));

    
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}