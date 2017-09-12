/**
 * The frontpage UI
 * also controls the bars and buttons and such
 * written using my brand new fancy UI framework
 */

import UIUtil = require('./UIUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import HTMLMap = require('../HTMLMap');
import * as moment from 'moment';

class TopUI extends UIUtil.UIItem {
    //copy all the init refrences and bind them to the other updating thingys
    constructor() {
        super();
        this.onScheduleUpdateRecv = this.onInitRecv;
        this.onScheduleUpdate = this.onInit;
        this.onEventUpdateRecv = this.onInitRecv;
        this.onEventUpdate = this.onInit;
    }
    //storage schedule name
    private schedule: ScheduleUtil.Schedule;
    //storage schedule callback
    storeSched(sched: ScheduleUtil.Schedule) {
        this.schedule = sched;
    }
    //storage day
    private day: Date;
    //day callback
    storeDay(day: Date) {
        this.day = day;
    }
    //actual members for optimization
    private lastIndex: number;
    //params for init
    onInitRecv: Array<UIUtil.RecvParams> = [
        <UIUtil.SchedParams>{
            type: UIUtil.RecvType.SCHEDULE,
            day: 0,
            storeSchedule: this.storeSched.bind(this),
        },
        <UIUtil.DayParams>{
            type: UIUtil.RecvType.DAY,
            storeDay: this.storeDay.bind(this),
        }
    ];
    //gethtml doesn't do anything since we already built the html for this component
    getHTML(): string {
        return null;
    }
    //callback for init
    //we'll just operate in document quiries
    onInit(): void {
        if (!this.schedule) {
            HTMLMap.timeText.innerHTML = moment(this.day).format('LT');
            HTMLMap.backText.innerHTML = "";
            HTMLMap.periodText.innerHTML = "No School";
        }
        else {
            //get current period
            const index = this.schedule.getCurrentPeriodIndex(this.day.getTime());
            //store it so we can check it later
            this.lastIndex = index;
            if (index === ScheduleUtil.PeriodType.BEFORE_START) {
                //before start code
                HTMLMap.timeText.innerHTML = "School starts " + moment().to(this.schedule.getPeriod(0).getStart());
                HTMLMap.periodText.innerHTML = "";
            }
            else if (index === ScheduleUtil.PeriodType.AFTER_END) {
                //after end code
                HTMLMap.timeText.innerHTML = moment().format('LT');
                HTMLMap.periodText.innerHTML = "";
            }
            else {
                //current period code
                const period = this.schedule.getPeriod(index);
                HTMLMap.timeText.innerHTML = moment().to(period.getEnd(), true) + " remaining";
                switch (period.getType()) {
                    case ScheduleUtil.PeriodType.CLASS:
                        HTMLMap.periodText.innerHTML = 'Period ' + period.getName();
                        break;
                    case ScheduleUtil.PeriodType.LUNCH:
                        HTMLMap.periodText.innerHTML = 'Lunch';
                        break;
                    case ScheduleUtil.PeriodType.PASSING:
                        HTMLMap.periodText.innerHTML = 'Passing';
                        break;
                }
            }
            HTMLMap.backText.innerHTML = this.schedule.getName()[0];
        }
    }
    //do a light time update
    onTimeUpdateRecv: Array<UIUtil.RecvParams> = [
        <UIUtil.DayParams>{
            type: UIUtil.RecvType.DAY
        }
    ];
    //fn
    onTimeUpdate() {
        if (!this.schedule) HTMLMap.timeText.innerHTML = moment(this.day).format('LT');
        else {
            //if the period hasn't changed, just update the time remaining
            if (this.schedule.getCurrentPeriodIndex(this.day.getTime()) === this.lastIndex) HTMLMap.timeText.innerHTML = moment().to(this.schedule.getPeriod(this.lastIndex).getEnd(), true) + " remaining";
            //else rebuild
            else this.onInit();
        }
    }
    //we wanna refresh for erethang, so we'll just copy all the parameters around in the constructor
    onEventUpdateRecv;
    onEventUpdate() { }
    onScheduleUpdateRecv;
    onScheduleUpdate() { }
}

export = TopUI;