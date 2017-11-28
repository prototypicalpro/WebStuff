/*
 * Non-Native HTTP Client Implementation
 */
define(["require", "exports", "./CalendarContants"], function (require, exports, CalendarConstants) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FetchCalendar {
        init() { return typeof fetch !== undefined; }
        getCalendar(extraParams) {
            //parse parameters
            let params = Object.assign(extraParams, CalendarConstants.parameters);
            //parse parsed parameters into URL
            let keys = Object.keys(params);
            let URL = CalendarConstants.URL + '?';
            for (let i = 0, len = keys.length; i < len; i++) {
                URL += '&' + keys[i] + '=' + params[keys[i]];
                console.log(URL);
            }
            //fire away
            return fetch(URL).then((response) => {
                return response.json();
            });
        }
    }
    exports.FetchCalendar = FetchCalendar;
});
//# sourceMappingURL=FetchCalendarGet.js.map