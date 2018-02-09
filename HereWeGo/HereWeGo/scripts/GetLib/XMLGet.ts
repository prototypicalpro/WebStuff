/*
 * Non-Native HTTP Client Implementation for Older webviews
 */

import GetUtil = require('./GetUtil');
import ErrorUtil = require('../ErrorUtil');

class FetchGet implements GetUtil.GetInterface {
    static initAPI(): boolean { return typeof XMLHttpRequest !== "undefined"; }

    private fs: DirectoryEntry;

    constructor(fs: DirectoryEntry) {
        this.fs = fs;
    }

    get(URL: string, params: any): Promise<Object> {
        console.log("Using XML!");
        URL = GetUtil.generateURL(URL, params);
        //fire away
        let req = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            req.open("GET", URL);
            req.onload = resolve;
            req.onerror = reject;
            req.send();
        }).then(() => {
            if(!req.response) {
                console.log("Fetch error: " + req.responseText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return JSON.parse(req.response);
        });
    }

    getAsBlob(URL: string, params: any): Promise<string> {
        URL = GetUtil.generateURL(URL, params);
        //fire away
        let req = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            req.open("GET", URL);
            req.onload = resolve;
            req.onerror = reject;
            req.responseType = "blob";
            req.send();
        }).then(() => {
            if(req.status !== 200) throw ErrorUtil.code.BAD_RESPONSE;
            //store into temporary file
            let fname = params.id;
            if(params.isFullRez) fname += 'FR';
            delete params.isFullRez;
            return GetUtil.writeBlob(this.fs, fname, req.response);
        });
    }
}

export = FetchGet;