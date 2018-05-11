import GetUtil = require('./GetUtil');
import ErrorUtil = require('../ErrorUtil');

/**
 * Native HTTP Client implementation via cordova-http.
 */
class NativeGet implements GetUtil.GetInterface {
    /** See {@link GetUtil.GetInterface.initAPI} */
    static initAPI(): boolean { 
        //console.log(cordovaHTTP.get);
        return typeof cordovaHTTP != 'undefined'; 
    }

    private fs: DirectoryEntry;

    constructor(fs: DirectoryEntry) {
        this.fs = fs;
    }

    /** See {@link GetUtil.GetInterface.get} */
    get(URL: string, params:any): Promise<Object> {
        console.log("Using native!");
        //fire away
        URL = GetUtil.generateURL(URL, params);
        return new Promise((resolve, reject) => { cordovaHTTP.get(URL, {}, {}, resolve, reject); }).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: any) => {
            if (!response) throw ErrorUtil.code.NO_INTERNET;
            if (response.status != 200) throw ErrorUtil.code.BAD_RESPONSE;
            return JSON.parse(response.data);
        });
    }

    /** See {@link GetUtil.GetInterface.getAsBlob} */
    getAsBlob(URL: string, params: any): Promise<string> {
        //fire away
        let fname = this.fs.toURL() + params.id;
        if(params.isFullRez) fname += 'FR';
        delete params.isFullRez;
        return new Promise((resolve, reject) => { cordovaHTTP.downloadFile(URL, params, {}, fname, resolve, reject); }).catch((err) => {
            console.log(err);
            throw ErrorUtil.code.NO_INTERNET;
        }).then((response: FileEntry) => {
            if (!response) throw ErrorUtil.code.NO_INTERNET;
            if (!response.isFile) throw ErrorUtil.code.BAD_RESPONSE;
            return fname;
        });
    }
}

export = NativeGet;