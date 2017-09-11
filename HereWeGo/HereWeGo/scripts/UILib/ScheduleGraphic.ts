/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIUtil = require('./UIUtil');
import UIArgs = require('../UIArgs');
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
            <UIArgs.DayParams>{
                type: UIArgs.RecvType.DAY,
            },
            //and the schedule
            <UIArgs.SchedParams>{
                type: UIArgs.RecvType.SCHEDULE,
                schedDay: day,
            }
        ];
        this.onScheduleUpdateRecv = this.onInitRecv;
    }

    //init stuff
    onInitRecv: Array<UIArgs.RecvParams>;
    //function
    onInit(inj: Array<any>): string {
        //as specified in onInitRecv, the first arg is the day
        let day: Date = inj[0];
        //and second is schedule
        let sched: ScheduleUtil.Schedule = inj[1];
        this.sched = sched;
        //if there's no schedule, rip
        if(!sched) throw ErrorUtil.code.NO_SCHOOL;
        //do all the construction stuff
        let schedStr = '';
        this.lastIndex = this.sched.getCurrentPeriodIndex(day.getTime());
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
    onScheduleUpdateRecv: Array<UIArgs.RecvParams>;
    //function
    onScheduleUpdate(inj: Array<any>) {
        //if still no schedule, well shite
        if(!inj[1]) throw ErrorUtil.code.NO_SCHOOL;
        //replace the html with a newly updated one
        document.querySelector('#' + this.id).innerHTML = this.onInit(inj);
    }

    //time update
    onTimeUpdateRecv: Array<UIArgs.RecvParams> = [<UIArgs.DayParams>{ type: UIArgs.RecvType.DAY, }];
    //function
    onTimeUpdate(inj: Array<Date>) {
        //if nothing has changed, don't change anything
        let currentIndex = this.sched.getCurrentPeriodIndex(inj[0].getTime());
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
}

export = ScheduleGraphic;