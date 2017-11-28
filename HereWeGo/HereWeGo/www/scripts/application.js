define(["require", "exports", "./TimeFormatUtil", "./DataManage", "./WHSLib/CalDataManage", "./WHSLib/QuoteDataManage", "./UILib/QuoteUI", "./UILib/ScheduleGraphic", "./UILib/EventGraphic", "./UILib/SlideTabUI", "./UILib/MenuUI", "./UILib/ButtonUI", "./HTMLMap", "./ErrorUtil", "./UILib/ToastUI", "./UILib/TopUI", "./WHSLib/ImageDataManage", "./GetLib/GetLib"], function (require, exports, TimeFormatUtil, DataManage, CalDataManage, QuoteDataManage, QuoteUI, ScheduleGraphic, EventGraphic, SlideTabUI, MenuUI, ButtonUI, HTMLMap, ErrorUtil, ToastUI, TopUI, ImageDataManage, GetLib) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    "use strict";
    var http = new GetLib();
    var data = new DataManage([new CalDataManage(), new QuoteDataManage(), new ImageDataManage(http, 7)], http);
    var toast = new ToastUI(HTMLMap.toastBox);
    var timeCallbackID;
    var browserTabWorks;
    var top = new TopUI();
    var menu;
    var slide;
    function initialize() {
        document.addEventListener('deviceready', onDeviceReady, false);
        console.log("init func: " + performance.now());
    }
    exports.initialize = initialize;
    function onDeviceReady() {
        console.log("device ready: " + performance.now());
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        if (cordova.InAppBrowser)
            window.open = cordova.InAppBrowser.open;
        cordova.plugins.browsertab.isAvailable((result) => browserTabWorks = result);
        let start = performance.now();
        if (!http.initAPI()) {
            console.log("http failed");
            throw ErrorUtil.code.HTTP_FAIL;
        }
        const today = new Date();
        data.initData().then(earlyInit).then(buildUI).then(() => {
            let end = performance.now();
            console.log("Init took: " + (end - start));
        }).catch((err) => {
            console.log(err);
            if (err === ErrorUtil.code.NO_STORED)
                return true;
            if (err === ErrorUtil.code.NO_IMAGE)
                return true;
            else
                throw err;
        }).then((getNewDataVar) => {
            if (getNewDataVar)
                return data.getNewData().then(buildUI);
            return data.refreshData().then(() => data.refreshData.bind(data)).catch(() => { return data.getNewData().then(buildUI); });
        }).catch((err) => {
            console.log(err);
            if (err === ErrorUtil.code.HTTP_FAIL)
                setTimeout(toastError, 1000, "This phone is unsupported!");
            else if (err === ErrorUtil.code.NO_INTERNET || err === ErrorUtil.code.BAD_RESPONSE)
                setTimeout(toastError, 1000, "No Internet available!");
            else
                throw err;
        }).then(() => {
            updateTime();
            let end = performance.now();
            console.log("Second init took: " + (end - start));
        }).catch((err) => {
            console.log(ErrorUtil.code[err]);
            console.log(err);
            throw err;
        });
    }
    function earlyInit() {
        data.setUIObjs([top]);
        return data.initUI();
    }
    function buildUI() {
        menu = new MenuUI(ButtonUI.Factory('SMItem', 'SMItemText', [
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
        ]), [new QuoteUI('quote', 36)].concat(ButtonUI.Factory('SMItem', 'SMItemText', [
            {
                text: 'Settings',
                icon: 'gear.png',
                callback: urlCallback('http://niceme.me/'),
            },
        ])));
        slide = new SlideTabUI([
            [
                new ScheduleGraphic(1),
                new EventGraphic('Today', 0, false),
                new EventGraphic('Tomorrow', 1, true),
                new EventGraphic(TimeFormatUtil.asFullDayText(new Date().getDay() + 2), 2, true),
            ]
        ], ['Home', 'Schedule', 'Credit']);
        data.setUIObjs([top, slide, menu]);
        return data.initUI();
    }
    function onPause() {
        clearTimeout(timeCallbackID);
    }
    function onResume() {
        updateTime();
    }
    function updateTime() {
        let time = new Date();
        time.setHours(time.getHours(), time.getMinutes() + 1, 0, 0);
        timeCallbackID = setTimeout(updateTime, time.getTime() - Date.now() + 10);
    }
    function urlCallback(url) {
        return () => {
            menu.closeMenu();
            if (browserTabWorks)
                cordova.plugins.browsertab.openUrl(url);
            else
                window.open(url, '_blank', 'location=yes');
        };
    }
    function toastError(msg) {
        toast.showToast(msg);
    }
});
//# sourceMappingURL=application.js.map