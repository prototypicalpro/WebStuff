/**
 * Class to handle the links to background images
 * from the cloud
 */

import DataInterface = require('./DataInterface');
import GetLib = require('../GetLib/GetLib');
import ImageInterface = require('./ImageInterface');
import { DBInfoInterface } from '../DBLib/DBManage';

class ImageDataManage implements DataInterface {
    //database stuff
    readonly dbInfo: DBInfoInterface = {
        //store images
        storeName: 'images',
        //have one category for the image, and one category for when it was stored
        keys: ['image', 'lastTime'],
        //keypath is index
        keyPath: 'index',
    };
    //the key for our database
    readonly dataKey = 'imgs';
    //storage members
    //we need to grab the images, so we need http
    private readonly http: GetLib;
    //also we need to know when thats done, so storage promise
    private getPromise: Promise<any>;
    //the constructor
    constructor(http: GetLib) {
        this.http = http;
    }
    //overwrite data func
    overwriteData(db: IDBDatabase, data: Array<ImageInterface>) {
        //here we go!
        //if we're already getting data, don't bother doing it again
        if (this.getPromise) return;
        //check database if we already have any of the images
        //and if we don't add it
        //also delete old ones
        let fetchArray = [];
        return new Promise((resolve, reject) => {
            let req: IDBRequest = db.transaction([this.dataKey], "readonly").objectStore(this.dbInfo.storeName).openCursor();
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    let imgData: ImageInterface = cursor.value;
                    //if grabbed index is not present in database, fetch
                    //if index is present in database but not here, remove
                    let i = data.length - 1;
                    for (; i >= 0; i--) {
                        if (data[i].index === imgData.index) {
                            data.splice(i, 1);
                            break;
                        }
                    }
                    //if it's not found, delete it
                    if (i < 0) cursor.delete(); 
                    cursor.continue();
                }
                else resolve();
            };
            req.onerror = reject;
        }).then(() => {
            //any leftover items in data will not have been found in the database, which means we gotta fetch em
            //TODO
        }).catch((err) => { return null; });
    }
}
