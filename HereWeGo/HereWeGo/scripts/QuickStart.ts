/**
 * Experiment to increase launch times using a pre-cordova bootstrap
 * This file is the entry point: it loads all the bare minimum stuff to start rendering the front page,
 * then starts up the rest of the code in application.ts
 * 
 * In theory, the less things we have to parse at the start the better, which is why I susepct this method is faster
 * than just starting at application.ts
 * I have been unable to prove this theory
 * 
 * Important note: this script also adds window.quickLoad as an indicator of a succesful start
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
var data: DataManage = new DataManage([new CalDataManage(null), new ImageDataManage(null, 7, true), new QuoteDataManage()], null);

//frontpage graphic
var top: TopUI = new TopUI(true);

var start;

(<any>window).quickLoad = true;
//console.log("Quickstart load!");
//start = performance.now();
//console.log(start);

var promiseMe: Promise<any> = Promise.all([
    data.initData().then(data.generateData.bind(data, [top])).then((dataRay) => { 
        top.onInit(dataRay);
        top.buildJS();
        return top.thumbPromise; 
    }).catch((err) => {
        console.log("Quickstart error!");
        console.log(err);
        (<any>window).quickLoad = false;
    }), 
    new Promise((resolve, reject) => require(['./application'], resolve, reject))
]).then((ray: Array<any>) => ray[1].initialize());