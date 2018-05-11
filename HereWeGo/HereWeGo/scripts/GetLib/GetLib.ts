import GetUtil = require('./GetUtil');
import FetchGet = require('./FetchGet');
import XMLGet = require('./XMLGet');
import NativeGet = require('./NativeGet');
import ErrorUtil = require('../ErrorUtil');

/**
 * HTML manager which simplifies fallback of alternate http clients,
 * overly complicated and abstract, but simple to use upfront.
 */
class GetLib implements GetUtil.GetInterface {
    //which HTTP client to use
    private useClass: GetUtil.GetInterface;

    /**
     * Determine which class to use for our HTTP and set it up, also grab the filesystem
     * @returns nothing if succesful
     * @throws FS_FAIL or HTTP_FAIL
     */
    initAPI(): Promise<any> {
        //detect if simulator
        const isSimulator = cordova.file.applicationDirectory === "http://localhost:8000/"
        //initialize filesystem
        //detect if we're simulating in browser
        var promise: Promise<DirectoryEntry>;
        if(isSimulator) {
            promise = new Promise((resolve, reject) => {
                //request chrome filesystem
                window.requestFileSystem(window.TEMPORARY, 0, resolve, e => {
                    console.log(e);
                    return reject(ErrorUtil.code.FS_FAIL);
                });
            }).then((fs: FileSystem) => fs.root);
        }
        else {
            promise = new Promise((resolve, reject) => {
                //request cordova filesystem
                (<any>window).resolveLocalFileSystemURL(cordova.file.cacheDirectory, resolve, e => {
                    console.log(e);
                    return reject(ErrorUtil.code.FS_FAIL);
                });
            });
        }
        return promise.then((fs: DirectoryEntry) => {
            var DRIVER_LIST;
            if(isSimulator) DRIVER_LIST = [FetchGet, XMLGet];
            else DRIVER_LIST = [NativeGet, FetchGet, XMLGet];
            //initialize http by trying clients until one works
            for (let i = 0, len = DRIVER_LIST.length; i < len; i++) if (DRIVER_LIST[i].initAPI()) {
                this.useClass = new DRIVER_LIST[i](fs);
                return;
            } 
            throw ErrorUtil.code.HTTP_FAIL;
        });
    }

    /**
     * Fetch JSON data from a given URL
     * @param URL the URL target (must be whitlisted in the CSP and the config.xml @see https://cordova.apache.org/docs/en/latest/guide/appdev/whitelist/ and @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP )
     * @param params object in { param : data } format which is converted into ?param=data in the URL
     * @returns the parsed JSON object
     * @throws NO_INTERNET or BAD_RESPONSE 
     */
    get(URL: string, params: any): Promise<Object> {
        return this.useClass.get(URL, params);
    }

    /**
     * Fetch Blob data (images, etc.).
     * Hacky note: if params contains isFullRez, this value will be read and removed, then
     * used internally to change the nameing scheme of the file.
     * @param URL the URL target (must be whitlisted in the CSP and the config.xml @see https://cordova.apache.org/docs/en/latest/guide/appdev/whitelist/ and @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP )
     * @param params object in { param : data } format which is converted into ?param=data in the URL
     * @returns a URL to the blob fetched
     * @throws NO_INTERNET, BAD_RESPONSE, or FS_FAIL 
     */
    getAsBlob(URL: string, params: any): Promise<string> {
        return this.useClass.getAsBlob(URL, params);
    }
}

export = GetLib;