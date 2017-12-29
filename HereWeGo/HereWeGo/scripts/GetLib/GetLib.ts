/*
 * Library manager which simplifies fallback of alternate http clients
 * overly complicated and abstract, but simply to use upfront
 */

import GetUtil = require('./GetUtil');
import FetchGet = require('./FetchGet');
import XMLGet = require('./XMLGet');
import NativeGet = require('./NativeGet');
import ErrorUtil = require('../ErrorUtil');

//list of all drivers useable in the app, in order of priority
//const DRIVER_LIST: Array<any> = [NativeGet, FetchGet, XMLGet];
const DRIVER_LIST: Array<any> = [FetchGet, XMLGet]; //comment this one if on mobile

class GetLib {
    private useClass: GetUtil.GetInterface;

    //figure out which API to use
    initAPI(): Promise<any> {
        //initialize filesystem
        return new Promise((resolve, reject) => {
            /*(<any>window).resolveLocalFileSystemURL(cordova.file.cacheDirectory,*/window.requestFileSystem(window.TEMPORARY, 0, resolve, e => {
                console.log(e);
                return reject(ErrorUtil.code.FS_FAIL);
            });
        }).then((fs: /*Entry*/ FileSystem) => {
            for (let i = 0, len = DRIVER_LIST.length; i < len; i++) if (DRIVER_LIST[i].initAPI()) {
                this.useClass = new DRIVER_LIST[i](/*fs*/ fs.root);
                return;
            } 
            throw ErrorUtil.code.HTTP_FAIL;
        });
    }

    get(URL: string, params: any): Promise<Object> {
        return this.useClass.get(URL, params);
    }

    getAsBlob(URL: string, params: GetUtil.ParamInterface): Promise<string> {
        return this.useClass.getAsBlob(URL, params);
    }
}

export = GetLib;