/*
 * Non-Native HTTP Client Implementation
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');
import ErrorUtil = require('../ErrorUtil');

class FetchGet implements GetInterface {
    static initAPI(): boolean { return typeof fetch !== undefined; }

    get(URL: string, params: any): Promise<Object> {
        URL = this.generateURL(URL, params);
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

    getAsBlob(URL: string, params: any): Promise<Blob> {
        URL = this.generateURL(URL, params);
        //fire away
        return fetch(URL).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: Response) => {
            //console.log(response);
            if (!response.ok) {
                console.log("Fetch error: " + response.statusText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return response.blob();
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