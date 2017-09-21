// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import TimeFormatUtil = require('./TimeFormatUtil');
import lory = require('./lory');
import DataManage = require('./WHSLib/DataManage');
import SchedDataManage = require('./WHSLib/SchedDataManage');
import ScheduleData = require('./WHSLib/ScheduleData');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import CalDataManage = require('./WHSLib/CalDataManage');
import QuoteDataManage = require('./WHSLib/QuoteDataManage');
import QuoteData = require('./WHSLib/QuoteData');
import QuoteUI = require('./UILib/QuoteUI');
import EventData = require('./WHSLib/EventData');
import EventInterface = require('./WHSLib/EventInterface');
import ScheduleGraphic = require('./UILib/ScheduleGraphic');
import EventGraphic = require('./UILib/EventGraphic');
import SlideTabUI = require('./UILib/SlideTabUI');
import UIUtil = require('./UILib/UIUtil');
import MenuUI = require('./UILib/MenuUI');
import ButtonUI = require('./UILib/ButtonUI');
import HTMLMap = require('./HTMLMap');
import ErrorUtil = require('./ErrorUtil');
import ToastUI = require('./UILib/ToastUI');
import UIData = require('./UIData');
import TopUI = require('./UILib/TopUI');
import DayHandler = require('./DayHandler');
import ImageDataManage = require('./WHSLib/ImageDataManage');
import GetLib = require('./GetLib/GetLib');

"use strict";

const enum DataIndex {
    EVENTS = 0,
    SCHED,
    QUOTE,
    IMAGE,
};

var http: GetLib = new GetLib();
var data: DataManage = new DataManage([new CalDataManage(), new SchedDataManage(), new QuoteDataManage(), new ImageDataManage(http)], http);
var toast: ToastUI = new ToastUI(HTMLMap.toastBox);
var uiThing: UIData;

var timeCallbackID;

//UI!
//frontpage graphic
var top: TopUI = new TopUI();
//sidemenu
var menu: MenuUI = new MenuUI(
    //top menu section buttons
    ButtonUI.Factory('SMItem', 'SMItemText', [
        {
            text: 'Map',
            icon: 'map.png',
            callback: urlCallback('https://xkcd.com'),
        },
        {
            text: 'Student VUE',
            icon: 'grade.png',
            callback: urlCallback('https://parent-portland.cascadetech.org/portland/Login_Student_PXP.aspx'),
        },
    ]),
    (<Array<UIUtil.UIItem>>[new QuoteUI('quote', 36)]).concat(
        ButtonUI.Factory('SMItem', 'SMItemText', [
            {
                text: 'Settings',
                icon: 'gear.png',
                callback: urlCallback('http://niceme.me/'),
            },
        ])
    ),
);
var slide: SlideTabUI = new SlideTabUI([
    //first page 
    [
        new ScheduleGraphic(0),
        new EventGraphic('Today', 0, false),
        new EventGraphic('Tomorrow', 1, true),
        new EventGraphic(TimeFormatUtil.asFullDayText(new Date().getDay() + 2), 2, true),
    ]
    //second page?
    //naw
]);

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
    data.initData().then(buildUI.bind(this)).then(() => {
        let end: number = performance.now();
        console.log("Init took: " + (end - start));
    }).catch((err) => {
        console.log(err);
        if (err === ErrorUtil.code.NO_STORED) return true;
        else throw err;
    }).then((getNewDataVar: any): any => {
        //start up http
        if (!http.initAPI()) {
            console.log("http failed");
            throw ErrorUtil.code.HTTP_FAIL;
        }
        //grab them datums
        if (getNewDataVar) return data.getNewData().then(buildUI.bind(this));
        return data.refreshData();
    }).catch((err: any) => {
        if (err === ErrorUtil.code.HTTP_FAIL) setTimeout(toastError, 1000, "This phone is unsupported!");
        else if (err === ErrorUtil.code.NO_INTERNET || err === ErrorUtil.code.BAD_RESPONSE) setTimeout(toastError, 1000, "No Internet available!");
        else throw err;
    }).then((newData: any) => {
        //refresh all cuz might as well
        return uiThing.trigger([UIUtil.TRIGGERED.UPDATE_ALL_DATA]);
    }).then(() => {
        //also start callback for every min to update time
        updateTime();
        let end = performance.now();
        console.log("Second init took: " + (end - start));
    }).catch((err) => {
        console.log(ErrorUtil.code[err]);
        console.log(err);
    });
}

function buildUI(): Promise<any> {
    //start up the early data stuff
    const calData: EventData = data.returnData(DataIndex.EVENTS);
    const schedData: ScheduleData = data.returnData(DataIndex.SCHED);
    const quoteData: QuoteData = data.returnData(DataIndex.QUOTE);
    const myData: any = data.returnData(DataIndex.IMAGE);
    //give the top all the data it needs
    uiThing = new UIData(schedData, calData, new DayHandler(), quoteData, myData, [top, slide, menu]);
    return uiThing.initInject().then(() => {
        //set HTML
        HTMLMap.setSliderHTML(slide.getHTML());
        HTMLMap.setSideMenuHTML(menu.getHTML());
        //then tell it to go!
        uiThing.initRun();
    });
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
    //kill updateTime
    clearTimeout(timeCallbackID);
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
    //restart updateTime
    updateTime();
}

//sixty second timeupdate callback
function updateTime(): void {
    //triggered!
    uiThing.trigger([UIUtil.TRIGGERED.TIME_UPDATE]);
    //reset callback
    let time = new Date();
    time.setHours(time.getHours(), time.getMinutes() + 1, 0, 0);
    timeCallbackID = setTimeout(updateTime, time.getTime() - Date.now() + 10);
}

function urlCallback(url: string): () => void {
    return () => {
        menu.closeMenu();
        window.open(url, '_blank');
    };
}

function toastError(msg: string): void {
    toast.showToast(msg);
}
