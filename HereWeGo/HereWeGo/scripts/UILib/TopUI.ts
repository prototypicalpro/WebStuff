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
    //storage schedule name
    private schedule: ScheduleUtil.Schedule;
    //storage day
    private day: Date;
    //storage image url
    private url: string;
    //actual members for optimization
    private lastIndex: number;
    //gethtml doesn't do anything since we already built the html for this component
    getHTML(): string {
        return null;
    }
    //callback for init
    //we'll just operate in document quiries
    onInit(): void {
        if (!this.schedule) {
            HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(this.day);
            HTMLMap.backText.innerHTML = "";
            HTMLMap.periodText.innerHTML = "No School";
        }
        else {
            //cache today time
            let todayTime = new Date(this.day).setHours(0, 0, 0, 0); 
            //get current period
            const index = this.schedule.getCurrentPeriodIndex(this.day);
            //store it so we can check it later
            this.lastIndex = index;
            if (index === ScheduleUtil.PeriodType.BEFORE_START) {
                //before start code
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(this.day, this.schedule.getPeriod(0).getStart(todayTime)) + " remaining";
                HTMLMap.periodText.innerHTML = "Before School";
            }
            else if (index === ScheduleUtil.PeriodType.AFTER_END) {
                //after end code
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(this.day);
                HTMLMap.periodText.innerHTML = "After School";
            }
            else {
                //current period code
                const period = this.schedule.getPeriod(index);
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(this.day, period.getEnd(todayTime)) + " remaining";
                switch (period.getType()) {
                    case ScheduleUtil.PeriodType.CLASS:
                        HTMLMap.periodText.innerHTML = 'Period ' + period.getName();
                        break;
                    case ScheduleUtil.PeriodType.LUNCH:
                        HTMLMap.periodText.innerHTML = 'Lunch';
                        break;
                    case ScheduleUtil.PeriodType.TUTOR_TIME:
                        HTMLMap.periodText.innerHTML = 'Tutor Time';
                        break;
                    case ScheduleUtil.PeriodType.ASSEMBLY:
                        HTMLMap.periodText.innerHTML = 'Assembly';
                        break;
                    case ScheduleUtil.PeriodType.PASSING:
                        HTMLMap.periodText.innerHTML = 'Passing';
                        break;
                }
            }
            HTMLMap.backText.innerHTML = this.schedule.getName()[0];
        }
    }
    recv: Array<UIUtil.RecvParams> = [
        <UIUtil.SchedParams>{
            type: UIUtil.RecvType.SCHEDULE,
            day: 0,
            storeSchedule: ((sched) => { this.schedule = sched; }).bind(this),
        },
        <UIUtil.DayParams>{
            type: UIUtil.RecvType.DAY,
            storeDay: ((day) => { this.day = day; }).bind(this),
        },
        <UIUtil.ImageParams>{
            type: UIUtil.RecvType.IMAGE,
            storeImgURL: ((url) => { this.url = url; }).bind(this),
        }
    ];
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
}

export = TopUI;