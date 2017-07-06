/*
 * Non-Native HTTP Client Implementation
 */

import CalendarInterface = require('./CalendarInterface');
import CalendarConstants = require('./CalendarContants');

class FetchCalendar implements CalendarInterface {
    static checkAPI(): boolean { return typeof fetch !== undefined; }

    getCalendar(extraParams: Object): Promise<Object> {
        //parse parameters
        let params = Object.assign(extraParams, CalendarConstants.parameters);
        //parse parsed parameters into URL
        let keys = Object.keys(params);
        let URL = CalendarConstants.URL + '?';
        for (let i = 0, len = keys.length; i < len; i++) {
            URL += '&' + keys[i] + '=' + params[keys[i]];
        }
        //fire away
        return fetch(URL).then((response: Response) => {
            return response.json();
        });
    }
}

export = FetchCalendar;