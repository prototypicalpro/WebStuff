/**
 * the image data handler
 * takes data from the database and converts it to a image
 * you can display in the app
 */

import UIUtil = require('../UILib/UIUtil');
import ErrorUtil = require('../ErrorUtil');
import ImageInterface = require('./ImageInterface');

class ImageData implements UIUtil.ImageHandle {
    //db pointer
    private readonly db: IDBDatabase;
    private readonly name: string;
    private readonly picPromise: Promise<any>;
    private lastDay: number;
    //constructor
    constructor(db: IDBDatabase, name: string, picPromise: Promise<any>) {
        this.db = db;
        this.name = name;
        this.picPromise = picPromise;
    }
    //aaand the magic
    getImage(obj: Array<UIUtil.ImageParams>): Promise<any> | void {
        //check and see if the day is new
        let day = new Date().getDate();
        if (day === this.lastDay) return;
        this.lastDay = day;
        //search database for todays time
        return new Promise((resolve, reject) => {
            //get todays image
            let req = this.db.transaction([this.name], "readonly").objectStore(this.name).get(day);
            let image;
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then((data: any) => {
            //TODO: FIX WHEN WE DON'T AHVE AN IMAGE
            if (!data.target.result) {
                console.log("no data");
                return;
            }
            let url = URL.createObjectURL(data.target.result.thumb);
            //fill all the objects
            for (let i = 0, len = obj.length; i < len; i++) obj[i].storeImgURL(
                url,
                new Promise((resolve, reject) => {
                    return this.picPromise;
                }).then(() => {
                    //search database for todays time
                    return new Promise((resolve, reject) => {
                        //get todays image
                        let req = this.db.transaction([this.name], "readonly").objectStore(this.name).get(day);
                        let image;
                        req.onsuccess = resolve;
                        req.onerror = reject;
                    });
                }).then((img: ImageInterface) => {
                    return URL.createObjectURL(img.image);
                })
            );
        });
    }
}

export = ImageData;