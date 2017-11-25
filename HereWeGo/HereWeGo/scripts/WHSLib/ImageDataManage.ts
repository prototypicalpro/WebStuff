/**
 * Class to handle the links to background images
 * from the cloud
 */

import DataInterface = require('./DataInterface');
import GetLib = require('../GetLib/GetLib');
import ImageInterface = require('./ImageInterface');
import { DBInfoInterface } from '../DBLib/DBManage';
import UIUtil = require('../UILib/UIUtil');
import ErrorUtil = require('../ErrorUtil');

const THUMB_URL: string = 'https://drive.google.com/thumbnail?authuser=0&sz=h{{height}}&id={{id}}'; 

class ImageDataManage implements DataInterface {
    //database stuff
    readonly dbInfo: DBInfoInterface = {
        //store images
        storeName: 'images',
        //have one category for the image, and one category for when it was stored
        //TODO: Credits
        keys: ['id'],
        //keypath is index
        keyPath: 'showDay',
    };
    //the key for our database
    readonly dataKey = 'imgData';
    //storage members
    //we need to grab the images, so we need http
    private readonly http: GetLib;
    //database
    private db: IDBDatabase;
    //promise to tell the app when we've finished fetching the full pictures
    private picPromise: Promise<any>;
    //lastDay for imagedata
    private lastDay: number;
    //the constructor
    //do file plugin stuff here since that stuff can run in the background (I think)
    constructor(http: GetLib) {
        this.http = http;
    }
    //set DB func
    setDB(db: IDBDatabase) { this.db = db; }
    //update data func
    updateData(data: Array<ImageInterface>): Promise<boolean> | false {
        if (!Array.isArray(data) || data.length === 0) return false;
        //check database if we already have any of the images
        //and if we don't add it
        //also delete old ones
        return new Promise((resolve, reject) => {
            let req: IDBRequest = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).openCursor();
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
            return this.getAndStoreImagesFromArray(data);
        }).then(() => {
            return data.length > 0;
        }).catch((err) => { return null; });
    }
    //overwriteData func
    overwriteData(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).clear();
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then(() => {
            return this.getAndStoreImagesFromArray(data);
        });
    }

    getData() {
        return this;
    }

    //ImageData merger
    //cuz promises are a huge pain
    //aaand the magic
    getImage(): Promise<any> | void {
        //check and see if the day is new
        let day = new Date().getDate();
        if (day === this.lastDay) return;
        this.lastDay = day;
        //search database for todays time
        return new Promise((resolve, reject) => {
            //get todays image
            let req = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).get(day);
            let image;
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then((data: any) => {
            //TODO: FIX WHEN WE DON'T AHVE AN IMAGE
            if (!data.target.result) throw ErrorUtil.code.NO_IMAGE;
            //fill all the objects
            for (let i = 0, len = obj.length; i < len; i++) obj[i].storeImgURL(
                URL.createObjectURL(data.target.result.thumb),
                new Promise((resolve, reject) => {
                    if (!this.picPromise) return resolve(URL.createObjectURL(data.target.result.image));
                    else return resolve(this.picPromise.then(() => {
                        return new Promise((resolve, reject) => {
                            //get todays image
                            let req = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).get(day);
                            let image;
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        }).then((img: any) => {
                            return URL.createObjectURL(img.target.result.image);
                        });
                    }));
                })
            );
        }).catch(() => {
            throw ErrorUtil.code.NO_IMAGE;
        });
    }

    private getAndStoreImagesFromArray(imgs: Array<ImageInterface>): [Promise<string> /* thumbnail */, Promise<string> /* picture */] {
        //any leftover items in data will not have been found in the database, which means we gotta fetch em and then add em to the database
        //fetch half width thumnails and store them
        let fetchArray = imgs.map((img) => {
            return this.http.getAsBlob(UIUtil.templateEngine(THUMB_URL, { height: Math.floor(screen.height / 4), id: img.id })).then((blob: Blob) => {
                return new Promise((resolve, reject) => {
                    let put = img;
                    //save the image
                    put.thumb = blob;
                    let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).put(put);
                    req.onsuccess = resolve;
                    req.onerror = reject;
                });
            });
        });

        //setup pic promise
        this.picPromise = Promise.all(fetchArray).then(() => {
            return Promise.all(imgs.map((img) => {
                //async start fetching the real pictures
                return this.http.getAsBlob(UIUtil.templateEngine(THUMB_URL, { height: screen.height, id: img.id })).then((blob: Blob) => {
                    //get the existing object
                    return new Promise((resolve, reject) => {
                        let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).get(img.showDay);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }).then((event: any) => {
                        //update, then store the new object with the image
                        let old: ImageInterface = event.target.result;
                        old.image = blob;
                        return new Promise((resolve, reject) => {
                            let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).put(old);
                            req.onsuccess = resolve;
                            req.onerror = reject;
                        });
                    });
                });
            }));
        }).then((() => { this.picPromise = null; }).bind(this));;
        //dooo eet
        return Promise.all(fetchArray);
    }
}

export = ImageDataManage