/**
 * The frontpage UI
 * also controls the bars and buttons and such
 * written using my brand new fancy UI framework
 */

import UIUtil = require('./UIUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import HTMLMap = require('../HTMLMap');
import TimeFormatUtil = require('../TimeFormatUtil');

class TopUI extends UIUtil.UIItem {
    private imageSet: boolean = false;
    //storage scheudle
    private schedule: ScheduleUtil.Schedule;
    //storage index
    private lastIndex: number;
    //image promise
    thumbPromise: Promise<any>;
    //wheter or not to tack on the better image
    private readonly noHq: boolean;

    constructor(noHq?: boolean) {
        super();
        this.noHq = noHq;
    }

    onInit(data: Array<any>): void {
        const day: Date = new Date();
        const zeroDay: number = new Date().setHours(0, 0, 0, 0);
        this.schedule = data[UIUtil.RecvType.CAL]["scheds"][zeroDay];
        if (!this.schedule) {
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
            HTMLMap.backText.innerHTML = "";
            HTMLMap.periodText.innerHTML = "No School";
        }
        else {
            this.createTop(this.schedule.getCurrentPeriodAndIndex(day), day);
            HTMLMap.backText.innerHTML = this.schedule.getName()[0];
        }
        //background image
        //get the promisi
        let back: [Promise<string>, Promise<string>] = data[UIUtil.RecvType.IMAGE];
        if (!back) {
            //display a waiting image?
            //TODO: something other than blank
        }
        if (!this.imageSet && back[0] && back[1]) {
            this.thumbPromise = back[0].then((thing: string) => {
                //if(typeof navigator.splashscreen != 'undefined') HTMLMap.backThumb.onload = navigator.splashscreen.hide;
                this.imageSet = true;
                return new Promise((resolve) => {
                    HTMLMap.backThumb.onload = resolve;
                    HTMLMap.backThumb.src = thing;
                });
            });
            //set it to go 50ms after, for dat load speed increase
            if(!this.noHq) back[1].then((hqThing: string) => HTMLMap.backImg.src = hqThing);
        }

        //take all touch events on the body and prevent scrolling
        //cuz, yknow, javascript
        if(typeof cordova != 'undefined' && cordova.platformId === 'ios') document.addEventListener('touchmove', this.fixScrollForIOS, <any>{
                passive: false,
                capture: false,
            });
    }
    //callback for init
    //we'll just operate in document quiries
    buildJS(): void { }
    //touchmove fixer
    private fixScrollForIOS = e => e.preventDefault();

    recvParams: Array<UIUtil.RecvParams> = [
        <UIUtil.CalParams>{
            type: UIUtil.RecvType.CAL,
            schedDay: 0,
        }
    ];

    //on changed data, rebuild!
    onUpdate(data: Array<any>): void {
        this.onInit(data);
    }
    
    //the actual update callback
    onTimeChanged(): void {
        let day = new Date()
        if (!this.schedule) HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
        else { 
            //if the period hasn't changed, just update the time remaining
            let curStuff = this.schedule.getCurrentPeriodAndIndex(day);
            if (curStuff[0] === this.lastIndex) {
                //cache today time
                let todayTime = new Date(day).setHours(0, 0, 0, 0);
                if (this.lastIndex === ScheduleUtil.PeriodType.before_start) HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, curStuff[1].getEnd(todayTime)) + " remaining";
                else if (this.lastIndex === ScheduleUtil.PeriodType.after_end) HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
                else HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, curStuff[1].getEnd(todayTime)) + " remaining";
                this.lastIndex = curStuff[0];
            }
            else this.createTop(curStuff, day);
        }   
    }

    private createTop(currStuff: [number, ScheduleUtil.Period], day: Date) {
        //get current period
        const zeroDay = new Date(day).setHours(0,0,0,0);
        //store it so we can check it later
        //this.lastIndex = indexAndPeriod[0];
        if (currStuff[0] === ScheduleUtil.PeriodType.before_start) {
            //before start code
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, currStuff[1].getEnd(zeroDay)) + " remaining";
            HTMLMap.periodText.innerHTML = "Before School";
        }
        else if (currStuff[0] === ScheduleUtil.PeriodType.after_end) {
            //after end code
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
            HTMLMap.periodText.innerHTML = "After School";
        }
        else {
            //current period code
            const period: ScheduleUtil.Period = currStuff[1];
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, period.getEnd(zeroDay)) + " remaining";
            switch (period.getType()) {
                case ScheduleUtil.PeriodType.class:
                    HTMLMap.periodText.innerHTML = 'Period ' + period.getName();
                    break;
                case ScheduleUtil.PeriodType.lunch:
                    HTMLMap.periodText.innerHTML = 'Lunch';
                    break;
                case ScheduleUtil.PeriodType.tutor_time:
                    HTMLMap.periodText.innerHTML = 'Tutor Time';
                    break;
                case ScheduleUtil.PeriodType.assembly:
                    HTMLMap.periodText.innerHTML = 'Assembly';
                    break;
                case ScheduleUtil.PeriodType.passing:
                    HTMLMap.periodText.innerHTML = 'Passing';
                    break;
            }
        }
        this.lastIndex = currStuff[0];
    }
}

export = TopUI;