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
import PopupUI = require('./UILib/PopupUI');
import CreditUI = require('./UILib/CreditUI');
import { NoSchool } from './WHSLib/ScheduleUtil';

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
//popup thingy
var popup: PopupUI;
//cached height for status bar css
var windowHeight;

var getNewData = false;

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
    console.log("init func: " + performance.now());
}

function onDeviceReady(): void {
    console.log("device ready: " + performance.now());

    //inappbrowser
    if ((<any>cordova).InAppBrowser) window.open = (<any>cordova).InAppBrowser.open;

    //browsertab
    (<any>cordova).plugins.browsertab.isAvailable((result) => browserTabWorks = result);

    //statusbar?
    windowHeight = window.innerHeight;
    if(cordova.platformId != "ios") window.addEventListener("resize", resizeStatusBar);
    //oh ios, how you hurt me so
    else resizeStatusBar();

    StatusBar.overlaysWebView(true);

    let start: number = performance.now();
    //grabby grabby
    http.initAPI().then(data.initData.bind(data)).then(buildUI).catch((err) => {
        console.log(err.message || err.name || err);
        if (err === ErrorUtil.code.NO_STORED) return getNewData = true;
        if (err === ErrorUtil.code.NO_IMAGE) return getNewData = true;
        throw err;
    }).then((): any => {
        //grab them datums
        if (getNewData) {
            //setup splashcreen loading animation
            HTMLMap.startLoad();
            return data.getNewData().then(buildUI);
        } 
        return data.refreshDataAndUI().catch((err) => { console.log(err); HTMLMap.startLoad(); return data.getNewData().then(buildUI); });
    }).catch((err: any) => {
        console.log(err.message || err.name || err);
        if (err === ErrorUtil.code.HTTP_FAIL || err === ErrorUtil.code.FS_FAIL) setTimeout(toastError, 1000, "This phone is unsupported!");
        else if (err === ErrorUtil.code.NO_INTERNET || err === ErrorUtil.code.BAD_RESPONSE) setTimeout(toastError, 1000, "No Internet available!");
        else throw err;
    }).then(() => { return top.thumbPromise; }).then(() => {
        //hide splascreen if it's still there
        HTMLMap.endLoad();
        navigator.splashscreen.hide();
        //add kits flickr link
        //document.querySelector("#flk").addEventListener("click", urlCallback("https://www.flickr.com/photos/kitrickmiller/"));
        //also start callback for every min to update time
        setTimeout(updateTime, 60010);
        let end = performance.now();
        console.log("Second init took: " + (end - start));
    }).catch((err) => {
        console.log(ErrorUtil.code[err]);
        console.log(err.message || err.name || err);
        throw err;
    });

    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
}

function resizeStatusBar() {
    //get the window height, and if it's different, unbind
    let height = window.innerHeight;
    if(height != windowHeight) {
        //hide splash (after resize paint)
        if((<any>window).quickLoad) {
            let fn = () => { HTMLMap.topPos.removeEventListener("transitionend", fn); navigator.splashscreen.hide(); }
            HTMLMap.topPos.addEventListener("transitionend", fn);
        }
        //query the top bar element, and increase it's element size accordingly
        //8.7vh is the default height, and we add the px as the statusbar increases the viewport size
        if(height > windowHeight && windowHeight - height < 50) {
            let list =  document.querySelectorAll('.topH');
            for(let i = 0, len = list.length; i < len; i++) (list.item(i) as HTMLElement).style.height = 'calc(8.7vh + ' + (height - windowHeight) + 'px)';
        }
        //recache
        windowHeight = height;
    }
    //if on ios, reset timeout if nothing changed
    else if (cordova.platformId === "ios") setTimeout(resizeStatusBar, 50);
}

function buildUI(): Promise<any> {
    //create popup
    popup = new PopupUI({"Credits" : new CreditUI()});
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
                    text: 'Credits',
                    icon: 'heart.png',
                    callback: () => {
                        menu.closeMenu();
                        popup.showPage("Credits");
                    },
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
        ]
        //second page?
        //naw
    ], ['Home', 'Schedule']);
    //start up the early data stuff
    //give the top all the data it needs
    data.setUIObjs([top, slide, menu, popup]);
    //init
    return data.initUI();
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
    //kill updateTime
    clearTimeout(timeCallbackID);
    timeCallbackID = 0;
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
    //restart updateTime
    if(!timeCallbackID) updateTime();
}

var lastUpdateTime: Date;

//sixty second timeupdate callback
function updateTime(): void {
    //triggered!
    data.timeUpdateUI();
    //if date has changed
    let day = new Date();
    //get the time to the next min
    let time = new Date(day).setHours(day.getHours(), day.getMinutes() + 1) + 10;
    if(lastUpdateTime && lastUpdateTime.getDate() != day.getDate()) data.refreshDataAndUI().then(() => timeCallbackID = setTimeout(updateTime, time - day.getTime()));
    //reset callback
    else timeCallbackID = setTimeout(updateTime, time - day.getTime());
    //reset day
    lastUpdateTime = day;
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
