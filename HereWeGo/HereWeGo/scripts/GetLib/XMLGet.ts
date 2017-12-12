/*
 * Non-Native HTTP Client Implementation for Older webviews
 */

import GetInterface = require('./GetInterface');
import ErrorUtil = require('../ErrorUtil');

class FetchGet implements GetInterface {
    static initAPI(): boolean { return typeof XMLHttpRequest !== undefined; }

    get(URL: string, params: any): Promise<Object> {
        console.log("Using XML!");
        URL = this.generateURL(URL, params);
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

    getAsBlob(URL: string, params: any): Promise<Blob> {
        URL = this.generateURL(URL, params);
        console.log(URL);
        //fire away
        let req = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            req.open("GET", URL);
            req.onload = resolve;
            req.onerror = reject;
            req.responseType = "arraybuffer";
            req.send();
        }).then(() => {
            if(!req.response) throw ErrorUtil.code.BAD_RESPONSE;
            //parse to blob
            return new Blob([req.response]);
        });
    }

    private generateURL(URL: string, params: any): string {
        //generate url
        let keys = Object.keys(params);
        if (keys.length === 0) return URL;
        URL += '?'
        for (let i = 0, len = keys.length; i < len; i++) URL += '&' + keys[i] + '=' + params[keys[i]];
        return URL;
    }
}

export = FetchGet;