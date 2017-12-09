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
    //gethtml doesn't do anything since we already built the html for this component
    //the only onInit function where document selectors are OK
    onInit(data: Array<any>): void {
        const day: Date = new Date();
        const zeroDay: number = new Date().setHours(0, 0, 0, 0);
        const schedule: ScheduleUtil.Schedule = data[UIUtil.RecvType.CAL]["scheds"][zeroDay];
        if (!schedule) {
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
            HTMLMap.backText.innerHTML = "";
            HTMLMap.periodText.innerHTML = "No School";
        }
        else {
            //get current period
            const indexAndPeriod: [number, ScheduleUtil.Period] = schedule.getCurrentPeriodAndIndex(day);
            //store it so we can check it later
            //this.lastIndex = indexAndPeriod[0];
            if (indexAndPeriod[0] === ScheduleUtil.PeriodType.before_start) {
                //before start code
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, indexAndPeriod[1].getEnd(zeroDay)) + " remaining";
                HTMLMap.periodText.innerHTML = "Before School";
            }
            else if (indexAndPeriod[0] === ScheduleUtil.PeriodType.after_end) {
                //after end code
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
                HTMLMap.periodText.innerHTML = "After School";
            }
            else {
                //current period code
                const period: ScheduleUtil.Period = indexAndPeriod[1];
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
            HTMLMap.backText.innerHTML = schedule.getName()[0];
        }
        //background image
        //get the promisi
        let back: [Promise<Blob>, Promise<Blob>] = data[UIUtil.RecvType.IMAGE];
        if (!back) {
            //display a waiting image?
            //TODO: something other than blank
        }
        if (!this.imageSet && back[0] && back[1]) {
            back[0].then((thing: Blob) => {
                //set it
                let url = URL.createObjectURL(thing)
                HTMLMap.setBackLowRes(url);

                this.imageSet = true;
                //and set the splashscreen to hide after it finishes
                let load = new Image();
                load.onload = () => {
                    navigator.splashscreen.hide();
                };
                load.src = url;
            });
            //set it to go 50ms after, for dat load speed increase
            back[1].then((hqThing: Blob) => setTimeout(() => HTMLMap.setBackImg(URL.createObjectURL(hqThing)), 50));
        }

        //take all touch events on the body and prevent scrolling
        //cuz, yknow, javascript
        document.addEventListener('touchmove', this.fixScrollForIOS, <any>{
            capture: false,
            passive: false
        });
    }
    //callback for init
    //we'll just operate in document quiries
    buildJS(): void { }
    //touchmove fixer
    private fixScrollForIOS = () => { return false; };

    recvParams: Array<UIUtil.RecvParams> = [
        <UIUtil.CalParams>{
            type: UIUtil.RecvType.CAL,
            schedDay: 0,
        }
    ];
    /*
    //the actual update callback
    onUpdate(why: Array<UIUtil.TRIGGERED>) {
        //if update or update schedule, rebuild
        if (why.indexOf(UIUtil.TRIGGERED.UPDATE_ALL_DATA) != -1 ||
            why.indexOf(UIUtil.TRIGGERED.SCHEDULE_UPDATE) != -1) this.onInit();
        //else if time update
        else if (why.indexOf(UIUtil.TRIGGERED.TIME_UPDATE) != -1) {
            if (!this.schedule) HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(this.day);
            else {
                //cache today time
                let todayTime = new Date(this.day).setHours(0, 0, 0, 0); 
                //if the period hasn't changed, just update the time remaining
                if (this.schedule.getCurrentPeriodIndex(this.day) === this.lastIndex) {
                    if (this.lastIndex === ScheduleUtil.PeriodType.BEFORE_START) HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(this.day, this.schedule.getPeriod(0).getStart(todayTime)) + " remaining";
                    else if (this.lastIndex === ScheduleUtil.PeriodType.AFTER_END) HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(this.day);
                    else HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(this.day, this.schedule.getPeriod(this.lastIndex).getEnd(todayTime)) + " remaining";
                }
                //else rebuild
                else this.onInit();
            }
        }
    }
    */
}

export = TopUI;