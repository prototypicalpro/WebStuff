/*
 * Native HTTP Client implementation
 * TODO: Add Error handling
 */

import GetInterface = require('./GetInterface');
import GetConstants = require('./GetContants');
import ErrorUtil = require('../ErrorUtil');

class NativeGet implements GetInterface {
    //check to see whether cordova exists
    static initAPI(): boolean { return typeof cordovaHTTP != 'undefined'; }

    //do the magic
    get(URL: string): Promise<Object> {
        //fire away
        return new Promise((resolve, reject) => { cordovaHTTP.get(URL, {}, {}, resolve, reject); }).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: any) => {
            if (!response) throw ErrorUtil.code.NO_INTERNET;
            if (response.status != 200) throw ErrorUtil.code.BAD_RESPONSE;
            return JSON.parse(response.data);
        });
    }

    getAsBlob(URL: string): Promise<Blob> {
        //fire away
        return new Promise((resolve, reject) => { cordovaHTTP.downloadFile(URL, {}, {}, resolve, reject); }).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: FileEntry) => {
            console.log(response);
            if (!response) throw ErrorUtil.code.NO_INTERNET;
            if (!response.isFile) throw ErrorUtil.code.BAD_RESPONSE;
            return <Promise<Blob>>new Promise((resolve, reject) => {
                response.file((obj) => {
                    let reader = new FileReader();
                    reader.onloadend = () => resolve(new Blob([new Uint8Array((<any>this).result)]));
                    reader.readAsArrayBuffer(obj);
                });
            });
        });
    }
}

export = NativeGet;