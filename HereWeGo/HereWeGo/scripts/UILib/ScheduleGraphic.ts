/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIUtil = require('./UIUtil');
import ErrorUtil = require('../ErrorUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import ColorUtil = require('./ColorUtil');
import * as moment from 'moment';
import { PeriodType } from '../WHSLib/ScheduleUtil';

class ScheduleGraphic extends UIUtil.UIItem {
    //storage schedule
    private sched: ScheduleUtil.Schedule;
    //last green period store
    private lastIndex: number;
    //stored date
    private day: Date;
    //HTML Template
    //It's gonna be ugly, that's just how it is
    //schedule table template
    private readonly tableTemplate: string = `
        <div id="{{id}}">
            <p class="header">{{head}}</p>   
            {{sched}}
        </div>`;

    //period item template
    private readonly itemTemplate: string = `
         <div class="justRow" style="background-color:{{backColor}};" id="{{id}}">
            <div class="leftCell">
                <div class="incep">
                    <p class="leftUp">{{upTime}}</p>
                    <p class="leftLow">{{lowTime}}</p>
                </div>
            </div>
            <div class="rWrap" style="border-left: 2px solid {{lineColor}};">
                <div>
                    <p class="rText">{{name}}</p>
                </div>
            </div>
        </div>`

    private readonly inlineEventWrapper: string = `
    <div class="evWrap">
        {{events}}
    </div>`;

    //event item template for inline with the schedule
    private readonly inlineEventTemplate: string = `<p class="evText">{{name}}</p>`;

    //constructor with schedule
    constructor(day: number) {
        super();
        this.onInitRecv = [
            //prolly want the day
            <UIUtil.DayParams>{
                type: UIUtil.RecvType.DAY,
                storeDay: this.storeDay.bind(this),
            },
            //and the schedule
            <UIUtil.SchedParams>{
                type: UIUtil.RecvType.SCHEDULE,
                day: day,
                storeSchedule: this.storeSchedule.bind(this),
            }
        ];
        this.onScheduleUpdateRecv = this.onInitRecv;
    }

    //init stuff
    onInitRecv: Array<UIUtil.RecvParams>;
    //gethtml
    getHTML(): string {
        //if there's no schedule, rip
        if (!this.sched) return '';
        //do all the construction stuff
        let schedStr = '';
        this.lastIndex = this.sched.getCurrentPeriodIndex(this.day.getTime());
        const inv = 1.0 / (this.sched.getNumPeriods() - 1);
        //all parrellel b/c we're already async so why not
        for (let i = 0, len = this.sched.getNumPeriods(); i < len; i++) {
            //if it's not passing or whatever, we display it
            let period: ScheduleUtil.Period = this.sched.getPeriod(i);
            //make a buncha row templates
            if (period.getType() >= 0 && period.getType() != ScheduleUtil.PeriodType.PASSING) {
                schedStr += UIUtil.templateEngine(this.itemTemplate, {
                    upTime: period.getStart().format('h:mm a'),
                    lowTime: period.getEnd().format('h:mm a'),
                    lineColor: ColorUtil.blendColors('#00ff00', '#004700', i * inv),
                    name: period.getName(),
                    backColor: this.lastIndex === i ? 'lightgreen' : '',
                    id: 'p' + i,
                });
            }
        }
        return UIUtil.templateEngine(this.tableTemplate, {
            head: this.sched.getName() + ' Schedule',
            sched: schedStr,
            id: this.id,
        });
    } 
    //schedule cache update
    onScheduleUpdateRecv: Array<UIUtil.RecvParams>;
    //function
    onScheduleUpdate() {
        //if still no schedule, well shite
        if (!this.sched) return;
        //replace the html with a newly updated one
        (<HTMLElement>document.querySelector('#' + this.id)).innerHTML = this.getHTML();
    }

    //time update
    onTimeUpdateRecv: Array<UIUtil.RecvParams> = [<UIUtil.DayParams>{
        type: UIUtil.RecvType.DAY,
        storeDay: this.storeDay.bind(this),
    }];
    //function
    onTimeUpdate() {
        //if no schedule, do nothing
        if (!this.sched) return;
        //if nothing has changed, don't change anything
        let currentIndex = this.sched.getCurrentPeriodIndex(this.day.getTime());
        if(this.lastIndex === currentIndex) return;
        //else remove the color from the last index, assuming it's not a passing period
        if(this.lastIndex >= 0 && this.sched.getPeriod(this.lastIndex).getType() != ScheduleUtil.PeriodType.PASSING){
            let last = document.querySelector('#p' + this.lastIndex) as HTMLElement;
            if(last) last.style.backgroundColor = '';
        }
        //and add it to the current period
        if(currentIndex >= 0 && this.sched.getPeriod(currentIndex).getType() != ScheduleUtil.PeriodType.PASSING) {
            let current = document.querySelector('#p' + currentIndex) as HTMLElement;
            if(current) current.style.backgroundColor = 'lightgreen';
        }
        //nice
    }

    //store schedule callback fn
    storeSchedule(sched: ScheduleUtil.Schedule) {
        this.sched = sched;
    }

    //store day callback fn
    storeDay(day: Date) {
        this.day = day;
    }
}

export = ScheduleGraphic;