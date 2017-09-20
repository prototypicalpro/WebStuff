/**
 * Class to handle the links to background images
 * from the cloud
 */

import DataInterface = require('./DataInterface');
import GetLib = require('../GetLib/GetLib');
import ImageInterface = require('./ImageInterface');
import { DBInfoInterface } from '../DBLib/DBManage';
import ImageData = require('./ImageData');

class ImageDataManage implements DataInterface {
    //database stuff
    readonly dbInfo: DBInfoInterface = {
        //store images
        storeName: 'images',
        //have one category for the image, and one category for when it was stored
        keys: ['image'],
        //keypath is index
        keyPath: 'showDay',
    };
    //the key for our database
    readonly dataKey = 'imgs';
    //storage members
    //we need to grab the images, so we need http
    private readonly http: GetLib;
    //the constructor
    constructor(http: GetLib) {
        this.http = http;
    }
    //update data func
    updataData(db: IDBDatabase, data: Array<ImageInterface>): Promise<boolean> | false {
        //check database if we already have any of the images
        //and if we don't add it
        //also delete old ones
        let objStore: IDBObjectStore = db.transaction([this.dataKey], "readwrite").objectStore(this.dbInfo.storeName);
        return new Promise((resolve, reject) => {
            let req: IDBRequest = objStore.openCursor();
            req.onsuccess = (event: any) => {
                let cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    let imgData: ImageInterface = cursor.value;
                    //if grabbed index is not present in database, fetch
                    //if index is present in database but not here, remove
                    let i = data.length - 1;
                    for (; i >= 0; i--) {
                        if (data[i].showDay === imgData.showDay) {
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
            return this.getAndStoreImagesFromArray(objStore, data);
        }).then(() => {
            console.log("here");
            return data.length > 0;
        }).catch((err) => { return null; });
    }
    //overwriteData func
    overwriteData(db: IDBDatabase, data: any): Promise<any> {
        let objStore: IDBObjectStore = db.transaction([this.dataKey], "readwrite").objectStore(this.dbInfo.storeName);
        return new Promise((resolve, reject) => {
            let req = objStore.clear();
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then(() => {
            return this.getAndStoreImagesFromArray(objStore, data);
        });
    }

    getData(db: IDBDatabase) {
        return new ImageData(db, this.dbInfo.storeName);
    }

    private getAndStoreImagesFromArray(objStore: IDBObjectStore, imgs: Array<ImageInterface>): Promise<any> {
        let fetchArray = [];
        //any leftover items in data will not have been found in the database, which means we gotta fetch em and then add em to the database
        for (let i = 0, len = imgs.length; i < len; i++) {
            console.log(imgs[i].url);
            fetchArray.push(this.http.getAsBlob(imgs[i].url).then((blob: Blob) => {
                let req = objStore.add({
                    image: blob,
                    showDay: imgs[i].showDay,
                });
                req.onsuccess = Promise.resolve;
                req.onerror = Promise.reject;
            }));
        }
        return Promise.all(fetchArray);
    }
}

export = ImageDataManage