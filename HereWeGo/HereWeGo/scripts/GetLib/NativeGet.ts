/*
 * Native HTTP Client implementation
 * TODO: Add Error handling
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');
import ErrorUtil = require('../ErrorUtil');

class NativeGet implements GetInterface {
    //check to see whether cordova exists
    static initAPI(): boolean { return typeof cordovaFetch != 'undefined'; }

    //do the magic
    get(URL: string): Promise<Object> {
        //fire away
        return cordovaFetch(URL).then((response: Response) => {
            return JSON.parse(response.statusText);
        });
    }

    getAsBlob(URL: string): Promise<Blob> {
        return cordovaFetch(URL).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: Response) => {
            if (!response.ok) {
                console.log("Fetch error: " + response.statusText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return response.blob();
        });
    }
}

export = NativeGet;