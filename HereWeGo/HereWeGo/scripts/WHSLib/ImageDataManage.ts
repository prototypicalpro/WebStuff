/**
 * Class to handle the links to background images
 * from the cloud
 */

import DataInterface = require('./Interfaces/DataInterface');
import UIUtil = require('../UILib/UIUtil');
import GetLib = require('../GetLib/GetLib');
import ImageInterface = require('./Interfaces/ImageInterface');
import { DBInfoInterface } from '../DBLib/DBManage';
import ErrorUtil = require('../ErrorUtil');

const THUMB_URL: string = 'https://drive.google.com/thumbnail?authuser=0&sz=h{{height}}&id={{id}}'; 
const IMG_IND_ID: string = '2';
const IMG_DAY_ID: string = '3';

class ImageDataManage implements DataInterface {
    //type
    readonly dataType = UIUtil.RecvType.IMAGE;
    //database stuff
    readonly dbInfo: DBInfoInterface = {
        //store images
        storeName: 'images',
        //have one category for the image, and one category for when it was stored
        //TODO: Credits
        keys: [],
        //keypath is index
        keyPath: 'id',
    };
    //the key for our database
    readonly dataKey = 'imgData';
    //storage members
    //we need to grab the images, so we need http
    private readonly http: GetLib;
    //database
    private db: IDBDatabase;
    //boolean to tell us if we failed to fetch an image, meaning it's time to get new ones
    private cacheRefresh: boolean = false;
    //promise to tell the app when we've finished fetching the full pictures
    private picPromise: Array<Promise<Blob>>;
    //store the number of images to cache at once
    private storeNum: number;
    private index: number;
    //the constructor
    //do file plugin stuff here since that stuff can run in the background (I think)
    constructor(http: GetLib, cacheDays: number) {
        this.http = http;
        this.storeNum = cacheDays;
    }
    //set DB func
    setDB(db: IDBDatabase) { this.db = db; }
    //update data func
    updateData(data: Array<ImageInterface>): Promise<boolean> | false {
        if (!Array.isArray(data) || data.length === 0) return false;
        //add iowait for anything making write calls to the database
        let thenme: Promise<any>;
        if (this.picPromise) thenme = Promise.all(this.picPromise);
        else thenme = Promise.resolve();
        //check database if we already have any of the images
        //and if we don't add it
        //also delete old ones
        thenme.then(() => {
            return new Promise((resolve, reject) => {
                let store: IDBObjectStore = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
                //then do a buncha quuuueirereis to update the database entries
                //but put it all in promises just to be sure
                let ray: Array<Promise<any>> = [];
                for (let i = 0, len = data.length; i < len; i++) {
                    if ('cancelled' in data[i]) ray.push(new Promise((resolve, reject) => {
                        let req = store.delete(data[i][this.dbInfo.keyPath]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                    else ray.push(new Promise((resolve, reject) => {
                        let req = store.put(data[i]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                }
                return Promise.all(ray);
            });
        }).then(() => {
            if (this.cacheRefresh) return this.fillPicPromises(this.storeNum).then(() => this.cacheRefresh = false);
        }).then(() => { return data.length > 0; });
    }
    //overwriteData func
    overwriteData(data: Array<ImageInterface>): Promise<any> {
        //add iowait for any images making write calls to the database
        let thenme: Promise<any>;
        if (this.picPromise) thenme = Promise.all(this.picPromise);
        else thenme = Promise.resolve();
        //then do your stuff!
        return thenme.then(() => {
            let obj = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
            return new Promise((resolve, reject) => {
                let req = obj.clear();
                req.onerror = reject;
                req.onsuccess = () => {
                    return Promise.all(data.map((img) => {
                        let req2 = obj.add(img);
                        req2.onerror = reject;
                        req2.onsuccess = resolve;
                    }));
                };
            });
        }).then(() => { return this.fillPicPromises(this.storeNum); });
    }

    getData(): [Promise<Blob>, Promise<Blob>] | Promise<[Promise<Blob>, Promise<Blob>]> | Promise<false>{
        if (!this.picPromise) {
            //get crap from localstorage
            let day: number = parseInt(localStorage.getItem(IMG_DAY_ID));
            this.index = parseInt(localStorage.getItem(IMG_IND_ID));
            let today = new Date().getDate();
            if (!day || typeof this.index != 'number') {
                localStorage.setItem(IMG_DAY_ID, today.toString());
                localStorage.setItem(IMG_IND_ID, '0');
                this.index = 0;
            }
            else if (day != today) {
                localStorage.setItem(IMG_DAY_ID, today.toString());
                localStorage.setItem(IMG_IND_ID, (++this.index).toString());
            }
            //make the promises for today, then return them
            //get the database entry for the stored images
            return this.fillPicPromises(1);
        }
        else return <[Promise<Blob>, Promise<Blob>]>this.picPromise.slice(0, 2);
    }

    private fillPicPromises(picNum: number): Promise<Array<Promise<Blob>>> {
        //fetch the thumbnail, then the full image, but stagger the full image until after the thumbnail
        //but still return the blobs for each
        //also ony fetch the # of images we want to store
        this.picPromise = [];
        return new Promise((resolve, reject) => {
            let obj = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName);
            //count the number of entries so we can wrap around in the cursor
            let req = obj.count();
            req.onerror = reject;
            req.onsuccess = (evt: any) => {
                //wrap index if it's over
                if (this.index >= evt.target.result) this.index = 0;
                //count the number of items to wrap around and fetch at the start of the cursor
                let temp = picNum + this.index;
                let count = temp - evt.target.result;
                let i = 0;
                let req2 = obj.openCursor();
                req2.onerror = reject;
                req2.onsuccess = (evt: any) => {
                    //iterate through database, fetching any blobs that are needed, and caching all teh things
                    let cursor = evt.target.result as IDBCursorWithValue;
                    if (!cursor || ++i > temp) return resolve(this.picPromise);
                    count--;
                    if (i > this.index || count >= 0) {
                        let tempPromise = this.getAndStoreImage(cursor.value, "thumb", UIUtil.templateEngine(THUMB_URL, { height: Math.floor(screen.height / 4), id: cursor.value.id }));
                        this.picPromise.push(tempPromise);
                        this.picPromise.push(Promise.resolve(tempPromise).then(() => { return this.getAndStoreImage(cursor.value, "image", UIUtil.templateEngine(THUMB_URL, { height: screen.height, id: cursor.value.id })); }));
                    }
                    cursor.continue();
                };
            };
        });
    }

    private getAndStoreImage(data: ImageInterface, key: string, url: string): Promise<Blob> {
        //trip a boolean here that we got new images
        this.cacheRefresh = true;
        //if the database has the image, great! send it off
        return data[key] ? Promise.resolve(data[key]) : this.getUntilBlobSuccess(url).then((blob: Blob) => {
            data[key] = blob;
            return new Promise((resolve, reject) => {
                let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).put(data);
                req.onsuccess = () => { return resolve(data[key]); };
                req.onerror = reject;
            });
        });
    }

    private getUntilBlobSuccess(url): Promise<Blob> {
        //...sigh
        return this.http.getAsBlob(url).then((data: Blob) => {
            if (!data) return this.getUntilBlobSuccess(url);
        });
    }

}

export = ImageDataManage