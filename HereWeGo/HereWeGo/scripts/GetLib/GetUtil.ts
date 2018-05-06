/*
 * HTTP GET Implementation Interface
 * Designed to provide backup HTTP clients in case some don't work
 * Also abstracts all the http crap
 */

 import ErrorUtil = require('../ErrorUtil');

//interface drivers for get ar built on
namespace GetUtil {
    export interface GetInterface {
        //new (fs: DirectoryEntry): GetInterface;
        get(URL: string, parameters: any): Promise<Object>;
        getAsBlob(URL: string, parameters: any): Promise<string>;
    };
    
    export interface ParamInterface {
        id: string;
        isFullRez: boolean;
    };

    //static utility functions
    export const generateURL = (URL: string, params: any): string => {
        //generate url
        let keys = Object.keys(params);
        if (keys.length === 0) return URL;
        URL += '?'
        for (let i = 0, len = keys.length; i < len; i++) URL += '&' + keys[i] + '=' + params[keys[i]];
        //always remember to sanitize folks!
        URL = encodeURI(URL);
        return URL;
    };

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