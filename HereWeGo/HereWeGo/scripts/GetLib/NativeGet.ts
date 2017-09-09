/*
 * Native HTTP Client implementation
 * TODO: Add Error handling
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');

class NativeGet implements GetInterface {
    //check to see whether cordova exists
    static initAPI(): boolean { return typeof cordovaFetch != 'undefined'; }

    //do the magic
    get(URL: string): Promise<Object> {
        //fire away
        return cordovaFetch(URL).then((response: Response) => {
            return response.json();
        });
    }
}

export = NativeGet;