/**
 * the image data handler
 * takes data from the database and converts it to a image
 * you can display in the app
 */

import UIUtil = require('../UILib/UIUtil');
import ErrorUtil = require('../ErrorUtil');

class ImageData implements UIUtil.ImageHandle {
    //db pointer
    private readonly db: IDBDatabase;
    private readonly name: string;
    //constructor
    constructor(db: IDBDatabase, name: string) {
        this.db = db;
        this.name = name;
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
            if (!data.url) throw ErrorUtil.code.NO_STORED;
            let url = URL.createObjectURL(data.image);
            for (let i = 0, len = obj.length; i < len; i++) obj[i].storeImgURL(url);
        });
    }
}

export = ImageData;