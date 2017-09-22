/*
 * Non-Native HTTP Client Implementation
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');
import ErrorUtil = require('../ErrorUtil');

class FetchGet implements GetInterface {
    static initAPI(): boolean { return typeof fetch !== undefined; }

    get(URL: string): Promise<Object> {
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

    getAsBlob(URL: string): Promise<Blob> {
        //fire away
        return fetch(URL).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: Response) => {
            console.log(response);
            if (!response.ok) {
                console.log("Fetch error: " + response.statusText);
                throw ErrorUtil.code.BAD_RESPONSE;
            }
            return response.blob();
        });
    }
}

export = FetchGet;