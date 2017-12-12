/*
 * Library manager which simplifies fallback of alternate http clients
 * overly complicated and abstract, but simply to use upfront
 */

import GetInterface = require('./GetInterface');
import FetchGet = require('./FetchGet');
import XMLGet = require('./XMLGet');
//import NativeGet = require('./NativeGet');

//list of all drivers useable in the app, in order of priority
//const DRIVER_LIST: Array<any> = [NativeGet, FetchGet, XMLGet];
const DRIVER_LIST: Array<any> = [FetchGet, XMLGet]; //comment this one if on mobile

class GetLib {
    private useClass: GetInterface;

    //figure out which API to use
    initAPI(): boolean {
        for (let i = 0, len = DRIVER_LIST.length; i < len; i++) {
            if (DRIVER_LIST[i].initAPI()) {
                this.useClass = new DRIVER_LIST[i]();
                return true;
            }
        }
        return false;
    }

    get(URL: string, params: any): Promise<Object> {
        return this.useClass.get(URL, params);
    }

    getAsBlob(URL: string, params: any): Promise<Blob> {
        return this.useClass.getAsBlob(URL, params);
    }
}

export = GetLib;