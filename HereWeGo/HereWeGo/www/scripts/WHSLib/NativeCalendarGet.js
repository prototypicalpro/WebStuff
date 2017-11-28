/*
 * Native HTTP Client implementation
 */
define(["require", "exports", "./CalendarContants"], function (require, exports, CalendarConstants) {
    "use strict";
    class NativeCalendar {
        //check to see whether cordova exists
        init() { return 'cordovaHTTP' in window; }
        //do the magic
        getCalendar(extraParams) {
            //parse parameters
            let params = Object.assign(extraParams, CalendarConstants.parameters);
            //fire away
            return new Promise((resolve, reject) => {
                //bwahaha spot the typescript hack
                window['cordovaHTTP'].get(CalendarConstants.URL, {}, params, resolve, reject);
            }).then((data) => {
                return JSON.parse(data);
            });
        }
    }
    return NativeCalendar;
});
//# sourceMappingURL=NativeCalendarGet.js.map