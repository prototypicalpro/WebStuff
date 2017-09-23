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
        //TODO: Credits
        keys: ['url'],
        //keypath is index
        keyPath: 'showDay',
    };
    //the key for our database
    readonly dataKey = 'imgData';
    //storage members
    //we need to grab the images, so we need http
    private readonly http: GetLib;
    //and we need to store them
    private fsRootGet: Promise<any>;
    private fs: DirectoryEntry;
    //the constructor
    //do file plugin stuff here since that stuff can run in the background (I think)
    constructor(http: GetLib) {
        this.http = http;
        //20mb
        this.fsRootGet = new Promise((resolve, reject) => { window.requestFileSystem(window.TEMPORARY, 20 * 1024 * 1024, resolve, reject); }).then((fs: FileSystem) => { this.fs = fs.root; });
    }
    //update data func
    updataData(db: IDBDatabase, data: Array<ImageInterface>): Promise<boolean> | false {
        if (!Array.isArray(data) || data.length === 0) return false;
        //check database if we already have any of the images
        //and if we don't add it
        //also delete old ones
        return new Promise((resolve, reject) => {
            let req: IDBRequest = db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).openCursor();
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
            return this.getAndStoreImagesFromArray(db, data);
        }).then(() => {
            return data.length > 0;
        }).catch((err) => { return null; });
    }
    //overwriteData func
    overwriteData(db: IDBDatabase, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let req = db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).clear();
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then(() => {
            return this.getAndStoreImagesFromArray(db, data);
        });
    }

    getData(db: IDBDatabase) {
        return new ImageData(db, this.dbInfo.storeName, this.fsRootGet.then(() => { return this.fs; }));
    }

    private getAndStoreImagesFromArray(db: IDBDatabase, imgs: Array<ImageInterface>): Promise<any> {
        let fetchArray = [];
        console.log(imgs);
        //any leftover items in data will not have been found in the database, which means we gotta fetch em and then add em to the database
        for (let i = 0, len = imgs.length; i < len; i++) {
            fetchArray.push(this.http.getAsBlob(imgs[i].url).then((blob: Blob) => {
                //write to file!
                //my apalogies for callback hell
                this.fsRootGet.then(() => {
                    return new Promise((resolve, reject) => {
                        this.fs.getFile(imgs[i].showDay + '.imc', { create: true }, (file) => {
                            file.createWriter((writer) => {
                                writer.onwriteend = resolve;
                                writer.write(blob);
                            }, reject);
                        }, reject);
                    });
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    console.log(imgs[i]);
                    let req = db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).put(imgs[i]);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                });
            }));
        }
        return Promise.all(fetchArray);
    }
}

export = ImageDataManage