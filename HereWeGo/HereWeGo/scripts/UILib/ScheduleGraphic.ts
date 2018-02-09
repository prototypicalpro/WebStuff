/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIUtil = require('./UIUtil');
import ErrorUtil = require('../ErrorUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import ColorUtil = require('./ColorUtil');
import TimeFormatUtil = require('../TimeFormatUtil');
import { PeriodType } from '../WHSLib/ScheduleUtil';

class ScheduleGraphic extends UIUtil.UIItem {
    //last green period store
    private lastIndex: number;
    //stored date
    //HTML Template
    //It's gonna be ugly, that's just how it is
    private readonly wrap: string = `<div id="{{id}}">{{stuff}}</div>`;
    //schedule table template
    private readonly tableTemplate: string = `
        <p class="header">{{head}}</p>   
        {{sched}}`;

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

    //cached access to the wrapper div
    private schedElem: HTMLElement;

    //cahced schedule object
    private sched: ScheduleUtil.Schedule;

    //constructor with schedule
    constructor(day: number, excludeNormal?: boolean) {
        super();
        this.recvParams = [
            //and the schedule
            <UIUtil.CalParams>{
                type: UIUtil.RecvType.CAL,
                schedDay: day,
                excludeNormal: excludeNormal,
            },
        ];
    }

    //update params to get
    recvParams: Array<UIUtil.RecvParams>;
    //gethtml
    onInit(data: Array<any>): string {
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        this.sched = data[UIUtil.RecvType.CAL]["scheds"][day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).schedDay)];
        return UIUtil.templateEngine(this.wrap, {
            id: this.id,
            stuff: this.sched ? this.makeSchedule(this.sched, new Date()) : '',
        });
    }

    //buildJS grabs the element we made for later
    buildJS() { 
        this.schedElem = document.querySelector("#" + this.id);
    }

    //utility makeScheduleHTML
    private makeSchedule(sched: ScheduleUtil.Schedule, day: Date): string {
        //if there's no schedule, rip
        if (!sched) return '';
        //do all the construction stuff
        let schedStr = '';
        this.lastIndex = sched.getCurrentPeriodAndIndex(day)[0];
        const inv = 1.0 / (sched.getNumPeriods() - 1);
        //all parrellel b/c we're already async so why not
        //cache today
        for (let i = 0, len = sched.getNumPeriods(); i < len; i++) {
            //if it's not passing or whatever, we display it
            let period: ScheduleUtil.Period = sched.getPeriod(i);
            //make a buncha row templates
            if (period.getType() >= 0) {
                schedStr += UIUtil.templateEngine(this.itemTemplate, {
                    upTime: period.getStartStr(),
                    lowTime: period.getEndStr(),
                    lineColor: ColorUtil.blendColors('#00ff00', '#004700', i * inv),
                    name: period.getName(),
                    backColor: this.lastIndex === i && (this.recvParams[0] as UIUtil.CalParams).schedDay === 0 ? 'lightgreen' : '',
                    id: 'p' + i,
                });
            }
        }
        return UIUtil.templateEngine(this.tableTemplate, {
            head: sched.getName() + ' Schedule',
            sched: schedStr,
        });
    }
    
    //onUpdate function
    //handles the updates
    //just rebuilds the entire thing for now
    onUpdate(data: Array<any>): void {
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        this.sched = data[UIUtil.RecvType.CAL]["scheds"][day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).schedDay)];
        this.schedElem.innerHTML = this.sched ? this.makeSchedule(this.sched, new Date()) : '';
    }

    onTimeChanged(): void {
        if(this.sched && (this.recvParams[0] as UIUtil.CalParams).schedDay === 0) {
            //if nothing has changed, don't change anything
            let currentStuff = this.sched.getCurrentPeriodAndIndex(new Date());
            let currentIndex = currentStuff[0];
            if (this.lastIndex === currentIndex) return;
            //else remove the color from the last index, assuming it's not a passing period
            if (this.lastIndex >= 0 && this.sched.getPeriod(this.lastIndex).getType() !== ScheduleUtil.PeriodType.passing) {
                let last = document.querySelector('#p' + this.lastIndex) as HTMLElement;
                if (last) last.style.backgroundColor = '';
            }
            //and add it to the current period
            if (currentIndex >= 0 && currentStuff[1].getType() !== ScheduleUtil.PeriodType.passing) {
                let current = document.querySelector('#p' + currentIndex) as HTMLElement;
                if (current) current.style.backgroundColor = 'lightgreen';
            }
            this.lastIndex = currentIndex;
        }
        
    }
}

export = ScheduleGraphic;