// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
import HTMLMap = require('./HTMLMap');
import TimeFormatUtil = require('./TimeFormatUtil');
import DataManage = require('./DataManage');
import GetLib = require('./GetLib/GetLib');
import ScheduleUtil = require('./WHSLib/ScheduleUtil');
import ErrorUtil = require('./ErrorUtil');
import UIUtil = require('./UILib/UIUtil');
import TopUI = require('./UILib/TopUI');
import ToastUI = require('./UILib/ToastUI');
import ImageDataManage = require('./WHSLib/ImageDataManage');
import CalDataManage = require('./WHSLib/CalDataManage');
import QuoteDataManage = require('./WHSLib/QuoteDataManage');
import QuoteUI = require('./UILib/QuoteUI');
import ScheduleGraphic = require('./UILib/ScheduleGraphic');
import EventGraphic = require('./UILib/EventGraphic');
import SlideTabUI = require('./UILib/SlideTabUI');
import MenuUI = require('./UILib/MenuUI');
import ButtonUI = require('./UILib/ButtonUI');

"use strict";

var http: GetLib = new GetLib();
var data: DataManage = new DataManage([new CalDataManage(), new QuoteDataManage(), new ImageDataManage(http, 7)], http);
var toast: ToastUI = new ToastUI(HTMLMap.toastBox);

var timeCallbackID;
var browserTabWorks: boolean;

//frontpage graphic
var top: TopUI = new TopUI();
//sidemenu
var menu: MenuUI;
//slider thingy
var slide: SlideTabUI;
//cached height for status bar css
var windowHeight;

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    //StatusBar.styleLightContent();
    console.log("init func: " + performance.now());
}

function onDeviceReady(): void {
    console.log("device ready: " + performance.now());
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);

    //inappbrowser
    if ((<any>cordova).InAppBrowser) window.open = (<any>cordova).InAppBrowser.open;

    //browsertab
    (<any>cordova).plugins.browsertab.isAvailable((result) => browserTabWorks = result);

    //statusbar?
    windowHeight = window.innerHeight;
    if(cordova.platformId != "ios") window.addEventListener("resize", resizeStatusBar);
    //oh ios, how you hurt me so
    else setTimeout(resizeStatusBar, 100);
    StatusBar.overlaysWebView(true);

    let start: number = performance.now();
    //start up http
    if (!http.initAPI()) {
        console.log("http failed");
        throw ErrorUtil.code.HTTP_FAIL;
    }
    const today = new Date();
    //grabby grabby
    data.initData().then(earlyInit).then(buildUI).then(() => {
        let end: number = performance.now();

        console.log("Init took: " + (end - start));
    }).catch((err) => {
        console.log(err);
        if (err === ErrorUtil.code.NO_STORED) return true;
        if (err === ErrorUtil.code.NO_IMAGE) return true;
        else throw err;
    }).then((getNewDataVar: any): any => {
        //grab them datums
        if (getNewDataVar) return data.getNewData().then(buildUI);
        return data.refreshData().then(() => data.refreshData.bind(data)).catch(() => { return data.getNewData().then(buildUI); });
    }).catch((err: any) => {
        console.log(err);
        if (err === ErrorUtil.code.HTTP_FAIL) setTimeout(toastError, 1000, "This phone is unsupported!");
        else if (err === ErrorUtil.code.NO_INTERNET || err === ErrorUtil.code.BAD_RESPONSE) setTimeout(toastError, 1000, "No Internet available!");
        else throw err;
    }).then(() => {
        //also start callback for every min to update time
        updateTime();
        let end = performance.now();
        console.log("Second init took: " + (end - start));
    }).catch((err) => {
        console.log(ErrorUtil.code[err]);
        console.log(err);
        throw err;
    });
}

function resizeStatusBar() {
    console.log("resize");
    //get the window height, and if it's different, unbind
    let height = window.innerHeight;
    if(height != windowHeight) {
        //query the top bar element, and increase it's element size accordingly
        //8.7vh is the default height, and we add the px as the statusbar increases the viewport size
        if(height > windowHeight && windowHeight - height < 50) HTMLMap.topBar.style.height = 'calc(8.7vh + ' + (height - windowHeight) + 'px)';
        //else reset
        else HTMLMap.topBar.style.height = '8.7vh';
        //recache
        windowHeight = height;
    }
    //if on ios, reset timeout if nothing changed
    else if (cordova.platformId == "ios") setTimeout(resizeStatusBar, 50);
}

function earlyInit(): Promise<any> {
    data.setUIObjs([top]);
    return data.initUI();
}

function buildUI(): Promise<any> {
    //contruct menu
    menu = new MenuUI(
        //top menu section buttons
        ButtonUI.Factory('SMItem', 'SMItemText', [
            {
                text: 'Map',
                icon: 'map.png',
                callback: urlCallback('https://docs.google.com/viewerng/viewer?url=https://www.pps.net//cms/lib/OR01913224/Centricity/Domain/760/Wilson_Building_Map.pdf'),
            },
            {
                text: 'Student VUE',
                icon: 'grade.png',
                callback: urlCallback('https://parent-portland.cascadetech.org/portland/Login_Student_PXP.aspx'),
            },
            {
                text: 'Daily Bulletin',
                icon: 'list.png',
                callback: urlCallback('https://script.google.com/a/koontzs.com/macros/s/AKfycbxyS4utDJEJ3bE2spSE4SIRlwj10M2Owbe7_XWrOFSobfniQjve/exec?bul="glorified bookmark"'),
            },
            {
                text: 'Naviance',
                icon: 'university.png',
                callback: urlCallback('https://connection.naviance.com/family-connection/auth/login/?hsid=wilsonor'),
            },
            {
                text: 'Website',
                icon: 'share.png',
                callback: urlCallback('https://www.pps.net/Domain/162'),
            }
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
    //and slider tab thingy
    slide = new SlideTabUI([
        //first page 
        [
            new ScheduleGraphic(0),
            new EventGraphic('Today', 0, false),
            new EventGraphic('Tomorrow', 1, true),
            new EventGraphic(TimeFormatUtil.asFullDayText(new Date().getDay() + 2), 2, true),
        ]
        //second page?
        //naw
    ], ['Home', 'Schedule', 'Credit']);
    //start up the early data stuff
    //give the top all the data it needs
    data.setUIObjs([top, slide, menu]);
    //init
    return data.initUI()//.then(navigator.splashscreen.hide);
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
    //TODO: Updating with a reasonalbe CPU impact
    //triggered!
    //uiThing.trigger([UIUtil.TRIGGERED.TIME_UPDATE]);
    //reset callback
    let time = new Date();
    time.setHours(time.getHours(), time.getMinutes() + 1, 0, 0);
    timeCallbackID = setTimeout(updateTime, time.getTime() - Date.now() + 10);
}

function urlCallback(url: string): () => void {
    return () => {
        menu.closeMenu();
        if (browserTabWorks) (<any>cordova).plugins.browsertab.openUrl(url);
        else window.open(url, '_blank', 'location=yes');
    };
}

function toastError(msg: string): void {
    toast.showToast(msg);
}
