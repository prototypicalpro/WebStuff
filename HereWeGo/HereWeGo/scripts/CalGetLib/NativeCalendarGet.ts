/*
 * Native HTTP Client implementation
 */

import CalendarInterface = require('./CalendarInterface');
import CalendarConstants = require('./CalendarContants');

class NativeCalendar implements CalendarInterface {
    //check to see whether cordova exists
    static checkAPI(): boolean { return 'cordovaHTTP' in window; }

    //do the magic
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
        return new Promise((resolve, reject) => {
            //bwahaha spot the typescript hack
            window['cordovaHTTP'].get(URL, {}, {}, resolve, reject);
        }).then((data: any) => {
            return JSON.parse(data.data);
        });
    }
}

export = NativeCalendar;