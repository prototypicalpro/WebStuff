/**
 * Experiment to increase launch times using a pre-cordova bootstrap
 * Will not work with the splashcreen, but we can fix that later
 * This file is designed to be compiled using WebPack, and will theoretically load cordova 
 * and requireJs afterwards automatically
 * Dunno how that's gonna work
 * 
 * Ironic that it's most of my code anyway, but oh well
 */

import HTMLMap = require('./HTMLMap');
import TimeFormatUtil = require('./TimeFormatUtil');
import DataManage = require('./DataManage');
import ErrorUtil = require('./ErrorUtil');
import TopUI = require('./UILib/TopUI');
import ImageDataManage = require('./WHSLib/ImageDataManage');
import CalDataManage = require('./WHSLib/CalDataManage');
import QuoteDataManage = require('./WHSLib/QuoteDataManage');

//do everything we can without internet access for now
var data: DataManage = new DataManage([new CalDataManage(), new ImageDataManage(null, 7, true), new QuoteDataManage()], null);

//frontpage graphic
var top: TopUI = new TopUI(true);

var start;

(<any>window).quickLoad = true;
console.log("Quickstart load!");
start = performance.now();
console.log(start);

var promiseMe: Promise<any> = 

Promise.all([
    data.initData().then(() => data.setUIObjs([top])).then(data.initUI.bind(data)).then(() => { return top.thumbPromise; }).catch((err) => {
        console.log("Quickstart error!");
        console.log(err);
        (<any>window).quickLoad = false;
    }), 
    new Promise((resolve, reject) => require(['./application'], resolve, reject))
]).then((ray: Array<any>) => ray[1].initialize());