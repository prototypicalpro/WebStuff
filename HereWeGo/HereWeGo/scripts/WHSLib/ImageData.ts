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
    private readonly fs: Promise<DirectoryEntry>;
    //constructor
    constructor(db: IDBDatabase, name: string, fs: Promise<DirectoryEntry>) {
        this.db = db;
        this.name = name;
        this.fs = fs;
    }
    //aaand the magic
    getImage(obj: Array<UIUtil.ImageParams>): Promise<any> {
        //search database for todays time
        return new Promise((resolve, reject) => {
            //get todays image
            let req = this.db.transaction([this.name], "readonly").objectStore(this.name).get(new Date().getDate());
            let image;
            req.onsuccess = resolve;
            req.onerror = reject;
        }).then((data: any) => {
            //TODO: FIX WHEN WE DON'T AHVE AN IMAGE
            if (!data.target.result) {
                console.log("no data");
                return;
            }
            let img: ImageInterface = data.target.result;
            //read file
            return this.fs.then((fs: DirectoryEntry) => {
                return new Promise((resolve, reject) => {
                    fs.getFile(img.showDay + '.imc', { create: false }, (file) => {
                        //loop through all the objs to inject
                        let fileStr = file.toURL();
                        console.log(fileStr);
                        for (let i = 0, len = obj.length; i < len; i++) obj[i].storeImgURL(fileStr);
                        return resolve();
                    }, reject);
                });
            });
        });
    }
}

export = ImageData;