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

const THUMB_URL: string = 'https://drive.google.com/thumbnail'
const IMG_IND_ID: string = '2';
const IMG_DAY_ID: string = '3';

interface CloudData {
    index: number;
    data: Array<ImageInterface>;
}

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
    private index: number = 0;
    //the constructor
    //do file plugin stuff here since that stuff can run in the background (I think)
    constructor(http: GetLib, cacheDays: number) {
        this.http = http;
        this.storeNum = cacheDays;
    }
    //set DB func
    setDB(db: IDBDatabase) { this.db = db; }
    //update data func
    updateData(data: CloudData): Promise<boolean> | false {
        //check if emptey array
        if(<any>data == []) return false;
        //check index
        if(typeof data.index === 'number') {
            //refresh index
            localStorage.setItem(IMG_DAY_ID, new Date().setHours(0,0,0,0).toString());
            localStorage.setItem(IMG_IND_ID, data.index.toString());
            this.index = data.index;
        }
        else if (typeof this.index != 'number') this.index = parseInt(localStorage.getItem(IMG_IND_ID));
        //refresh data
        if (!Array.isArray(data.data) || data.data.length === 0) {
            if (this.cacheRefresh) return this.fillPicPromises(this.storeNum).then(() => this.cacheRefresh = false);
            else return false;
        }
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
                for (let i = 0, len = data.data.length; i < len; i++) {
                    if ('cancelled' in data.data[i]) ray.push(new Promise((resolve, reject) => {
                        let req = store.delete(data.data[i][this.dbInfo.keyPath]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                    else ray.push(new Promise((resolve, reject) => {
                        let req = store.put(data.data[i]);
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    }));
                }
                return Promise.all(ray);
            });
        }).then(() => {
            if (this.cacheRefresh || data.data.length > 0) return this.fillPicPromises(this.storeNum).then(() => this.cacheRefresh = false);
        }).then(() => { return data.data.length > 0; });
    }
    //overwriteData func
    overwriteData(data: CloudData): Promise<any> {
        //refresh index
        localStorage.setItem(IMG_DAY_ID, new Date().setHours(0, 0, 0, 0).toString());
        localStorage.setItem(IMG_IND_ID, data.index.toString());
        this.index = data.index;
        //add iowait for any images making write calls to the database
        let thenme: Promise<any>;
        if (this.picPromise) thenme = Promise.all(this.picPromise);
        else thenme = Promise.resolve();
        //then do your stuff!
        let obj = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
        return thenme.then(() => {
            return new Promise((resolve, reject) => {
                let req = obj.clear();
                req.onerror = reject;
                req.onsuccess = resolve;
            })
        }).then(() => {
            let len = data.data.length;
            let ray: Array<Promise<any>> = new Array(len);
            for(let i = 0; i < len; i++) ray[i] = new Promise((resolve1, reject1) => {
                let req2 = obj.add(data.data[i]);
                req2.onerror = reject1;
                req2.onsuccess = resolve1;
            });
            return Promise.all(ray);
        }).then(() => { return this.fillPicPromises(this.storeNum); });
    }

    getData(): Promise<Array<Promise<Blob>>> | [Promise<Blob>, Promise<Blob>] | Promise<[Promise<Blob>, Promise<Blob>]> | Promise<false>{
        if (!this.picPromise) {
            //get crap from localstorage
            let lastDay: number = parseInt(localStorage.getItem(IMG_DAY_ID));
            this.index = parseInt(localStorage.getItem(IMG_IND_ID));
            if (!lastDay || typeof this.index != 'number') throw ErrorUtil.code.NO_STORED;
            let today = new Date().setHours(0, 0, 0, 0);
            if (lastDay != today) {
                localStorage.setItem(IMG_DAY_ID, today.toString());
                localStorage.setItem(IMG_IND_ID, (this.index += this.daysBetweenDates(lastDay, today)).toString());
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
                if (this.index >= evt.target.result) localStorage.setItem(IMG_IND_ID, (this.index = 0).toString());
                //count the number of items to wrap around and fetch at the start of the cursor
                let temp = picNum + this.index;
                let count = temp - evt.target.result;
                let endRay = [];
                let i = 0;
                let req2 = obj.openCursor();
                req2.onerror = reject;
                req2.onsuccess = (evt: any) => {
                    //iterate through database, fetching any blobs that are needed, and caching all teh things
                    let cursor = evt.target.result as IDBCursorWithValue;
                    if (!cursor || ++i > temp) return resolve(this.picPromise = this.picPromise.concat(endRay));
                    count--;
                    if (i > this.index || count >= 0) {
                        let tempScope = cursor.value;
                        let tH = window.innerHeight;
                        let tempPromise = this.getAndStoreImage(tempScope, "thumb", THUMB_URL, Math.floor(tH / 4),  tempScope.id);
                        let tempP2 = Promise.resolve(tempPromise).then(() => { return this.getAndStoreImage(tempScope, "image", THUMB_URL, tH, tempScope.id, true); });
                        //push such that they end up in order, even though we may wrap around
                        if (count >= 0) endRay.push(tempPromise, tempP2);
                        else this.picPromise.push(tempPromise, tempP2);
                    }
                    cursor.continue();
                };
            };
        });
    }

    private getAndStoreImage(data: ImageInterface, key: string, url: string, height: number, id: string, loadThenSave?: boolean): Promise<Blob> {
        //trip a boolean here that we got new images
        this.cacheRefresh = true;
        //if the database has the image, great! send it off
        return data[key] ? Promise.resolve(data[key]) : this.getUntilBlobSuccess(url, {
            authuser: 0,
            sz: 'h' + height,
            id: id,
        }).then((blob: Blob) => {
            data[key] = blob;
            let obj = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName);
            return new Promise((resolve, reject) => {
                const runFunc = (blurd: any) => {
                    let req2 = obj.put(blurd);
                    req2.onerror = reject;
                    req2.onsuccess = () => resolve(data[key]);
                };
                if (loadThenSave) {
                    let req = obj.get(data.id);
                    req.onerror = reject;
                    req.onsuccess = (evt: any) => {
                        evt.target.result[key] = blob;
                        runFunc(evt.target.result);
                    };
                }
                else runFunc(data);
            });
        });
    }

    private getUntilBlobSuccess(url: string, params: any): Promise<Blob> {
        //...sigh
        return this.http.getAsBlob(url, params).then((data: Blob) => {
            if (!data) return this.getUntilBlobSuccess(url, params);
            else return data;
        });
    }

    private daysBetweenDates(day1: number, day2: number): number {
        // The number of milliseconds in one day
        var ONE_DAY = 1000 * 60 * 60 * 24
        return Math.round(Math.abs(day1 - day2)/ONE_DAY);
    }
}

export = ImageDataManage