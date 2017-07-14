/*
 * Non-Native HTTP Client Implementation
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');

class FetchGet implements GetInterface {
    static initAPI(): boolean { return typeof fetch !== undefined; }

    get(URL: string): Promise<Object> {
        //fire away
        return fetch(URL).then((response: Response) => {
            return response.json();
        });
    }
}

export = FetchGet;