import GetUtil = require('./GetUtil');
import ErrorUtil = require('../ErrorUtil');

/** 
 * Non-Native HTTP Client Implementation for Older webviews using XHR.
 */
class FetchGet implements GetUtil.GetInterface {
    /** See {@link GetUtil.GetInterface.initAPI} */
    static initAPI(): boolean { return typeof XMLHttpRequest !== "undefined"; }

    private fs: DirectoryEntry;

    constructor(fs: DirectoryEntry) {
        this.fs = fs;
    }

    /** See {@link GetUtil.GetInterface.get} */
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

    /** See {@link GetUtil.GetInterface.getAsBlob} */
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