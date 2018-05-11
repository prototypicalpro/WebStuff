import ErrorUtil = require('../ErrorUtil');

namespace GetUtil {
    /**
     * HTTP GET Implementation Interface:
     * Designed to provide backup HTTP clients in case some don't work.
     * Also abstracts all the http crap.
     * Note: I couldn't figure out how to type this, but the contructor takes a DirectoryEntry object.
     */
    export interface GetInterface {
        /**
         * Fetch JSON data from a given URL
         * @param URL the URL target (must be whitlisted in the CSP and the config.xml @see https://cordova.apache.org/docs/en/latest/guide/appdev/whitelist/ and @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP )
         * @param parameters object in { param : data } format which is converted into ?param=data in the URL
         * @returns the parsed JSON object
         * @throws NO_INTERNET or BAD_RESPONSE 
         */
        get(URL: string, parameters: any): Promise<Object>;
        /**
         * Fetch Blob data (images, etc.)
         * Hacky note: if params contains isFullRez, this value will be read and removed, then
         * used internally to change the nameing scheme of the file
         * @param URL the URL target (must be whitlisted in the CSP and the config.xml @see https://cordova.apache.org/docs/en/latest/guide/appdev/whitelist/ and @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP )
         * @param parameters object in { param : data } format which is converted into ?param=data in the URL
         * @returns a URL to the blob fetched
         * @throws NO_INTERNET, BAD_RESPONSE, or FS_FAIL 
         */
        getAsBlob(URL: string, parameters: any): Promise<string>;
    };

    /**
     * Utility function to convert the object parameters into a URL
     * Ideally we would run this nativly but since it is sometimes not offered this is an alternate implementation
     * @param URL the target URL without parameters
     * @param params the object defining the parameters
     * @returns the URL with parameters
     */
    export const generateURL = (URL: string, params: any): string => {
        //generate url
        let keys = Object.keys(params);
        if (keys.length === 0) return encodeURI(URL);
        URL += '?'
        for (let i = 0, len = keys.length; i < len; i++) {
            let param = params[keys[i]];
            if(!Array.isArray(param)) URL += '&' + keys[i] + '=' + param;
            //iterate through array adding params of the same name
            else for(let o = 0, len1 = param.length; o < len1; o++) URL += '&' + keys[i] + '=' + param[o];
        }
        //always remember to sanitize folks!
        URL = encodeURI(URL);
        return URL;
    };

    /**
     * Utility function to write a blob to a directory for storage
     * @param fs the directory to save the blob to
     * @param fname the name of the file to save the blob to
     * @param data the blob in question
     * @returns a URL to the saved blob
     * @throws FS_FAIL
     */
    export const writeBlob = (fs: DirectoryEntry, fname: string, data: Blob): Promise<string>  => {
        return new Promise((resolve, reject) => {
            let error = (err) => { console.log(err); reject(ErrorUtil.code.FS_FAIL); };
            fs.getFile(fname, { create : true }, (file: FileEntry) => {
                file.createWriter((writer: FileWriter) => {
                    writer.onerror = error;
                    writer.onwriteend = () => resolve(file.toURL());
                    writer.write(data);
                }, error);
            }, error);
        });
    }
}


export = GetUtil;