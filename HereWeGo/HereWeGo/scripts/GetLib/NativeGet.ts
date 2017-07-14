/*
 * Native HTTP Client implementation
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');

class NativeGet implements GetInterface {
    //check to see whether cordova exists
    static initAPI(): boolean { return 'cordovaHTTP' in window; }

    //do the magic
    get(URL: string): Promise<Object> {
        //fire away
        return new Promise((resolve, reject) => {
            //bwahaha spot the typescript hack
            window['cordovaHTTP'].get(URL, {}, {}, resolve, reject);
        }).then((data: any) => {
            return JSON.parse(data.data);
        });
    }
}

export = NativeGet;