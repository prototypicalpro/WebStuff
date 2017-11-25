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
    //boolean to tell us if the stored images are currect
    private dataRefreshed: boolean = false;
    //promise to tell the app when we've finished fetching the full pictures
    private picPromise: Array<Promise<Blob>>;
    //the constructor
    //do file plugin stuff here since that stuff can run in the background (I think)
    constructor(http: GetLib, cacheDays: number) {
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
        }).then(() => { this.dataRefreshed = true; return data.length > 0; }).catch((err) => { return null; });
    }
    //overwriteData func
    overwriteData(data: Array<ImageInterface>): Promise<any> {
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
        }).then(() => this.dataRefreshed = true);
    }

    getData(): [Promise<string>, Promise<string>] | Promise<[Promise<string>, Promise<string>]> | Promise<false>{
        if (!this.picPromise) return this.getTodayPicData();
        else return this.picPromise;
    }

    private getTodayPicData(): Promise<Array<any>> {
        let day = new Date().getDate();
        //get the database entry for the stored images
        return new Promise((resolve, reject) => {
            //get the image database item
            let req = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).get(day);
            req.onerror = reject;
            req.onsuccess = resolve;
        }).then((evt: any) => {
            let data: ImageInterface = evt.target.result;
            if (!data) return [false, false];
            return this.picPromise = this.makePicPromise(data);
        });
    }

    private fillPicPromises(): [Promise<Blob>, Promise<Blob>] {
        return new Promise((resolve, reject) => {
            let req = this.db.transaction([this.dbInfo.storeName], "readonly").objectStore(this.dbInfo.storeName).openCursor();
            req.onerror = reject;
            req.onsuccess = (evt: any) => {
                //TODO iterate through database, fetching any blobs that are needed, and caching all teh things
            }
        });


        const codeReuse = (key: string, url: string): Promise<Blob> => {
            //if the database has the image, great! send it off
            return data[key] ? Promise.resolve(data[key]) : this.getUntilBlobSuccess(url).then((blob: Blob) => {
                data[key] = blob;
                return new Promise((resolve, reject) => {
                    let req = this.db.transaction([this.dbInfo.storeName], "readwrite").objectStore(this.dbInfo.storeName).put(data);
                    req.onsuccess = () => { return resolve(data[key]); };
                    req.onerror = reject;
                });
            });
        };
        //fetch the thumbnail, then the full image, but stagger the full image until after the thumbnail
        //but still return the string for each
        //...
        let ret: Array<Promise<Blob>> = [codeReuse("thumb", UIUtil.templateEngine(THUMB_URL, { height: Math.floor(screen.height / 4), id: data.id })), null];
        ret[1] = Promise.all(ret).then(() => { return codeReuse("image", UIUtil.templateEngine(THUMB_URL, { height: screen.height, id: data.id })) });
        return <[Promise<Blob>, Promise<Blob>]>ret;
    }

    private getUntilBlobSuccess(url): Promise<Blob> {
        //...sigh
        return this.http.getAsBlob(url).then((data: Blob) => {
            if (!data) return this.getUntilBlobSuccess(url);
        });
    }

}

export = ImageDataManage