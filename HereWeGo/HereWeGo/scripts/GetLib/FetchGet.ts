/*
 * Non-Native HTTP Client Implementation
 */

import GetUtil = require('./GetUtil');
import ErrorUtil = require('../ErrorUtil');

class FetchGet implements GetUtil.GetInterface {
    static initAPI(): boolean { return typeof fetch !== "undefined"; }

    private fs: DirectoryEntry;
    
    constructor(fs: DirectoryEntry) {
        this.fs = fs;
    }

    get(URL: string, params: any): Promise<Object> {
        URL = GetUtil.generateURL(URL, params);
        //fire away
        return fetch(URL).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: Response) => {
            if (!response.ok) {
                console.log("Fetch error: " + response.statusText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return response.json();
        });
    }

    getAsBlob(URL: string, params: any): Promise<string> {
        let fullRez = params.isFullRez;
        delete params.isFullRez;
        URL = GetUtil.generateURL(URL, params);
        //fire away
        return fetch(URL).catch((err) => {
            console.log("Fetch Error!");
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: Response) => {
            //console.log(response);
            if (!response.ok) {
                console.log("Fetch error: " + response.statusText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return response.blob();
        }).then((blurb: Blob) => { 
            let fname = params.id;
            if(fullRez) fname += 'FR';
            return GetUtil.writeBlob(this.fs, fname, blurb);
        });
    }
}

export = FetchGet;