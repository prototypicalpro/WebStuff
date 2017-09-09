/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIUtil = require('./UIUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import ColorUtil = require('./ColorUtil');
import * as moment from 'moment';
import { PeriodType } from '../WHSLib/ScheduleUtil';

class ScheduleGraphic implements UIUtil.UIItem {
    //storage schedule
    private sched: ScheduleUtil.Schedule;
    //I sorta have to include this due to the direct database

    //HTML Template
    //It's gonna be ugly, that's just how it is
    //schedule table template
    private readonly tableTemplate: string = `
        <p class="header">{{head}}</p>   
        {{sched}}`;

    //period item template
    private readonly itemTemplate: string = `
         <div class="justRow" style="background-color:{{backColor}};">
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
    private readonly inlineEventTemplate: string = `
        <p class="evText">{{name}}</p>`;

    //constructor with schedule
    constructor(sched: ScheduleUtil.Schedule) {
        this.sched = sched;
    }

    //return self for getChildren
    getChildren() {
        return [this];
    }

    getHTML(): Promise<string> {
        //do all the construction stuff
        const index = this.sched.getCurrentPeriodIndex(Date.now());
        const inv = 1.0 / (this.sched.getNumPeriods() - 1);
        //all parrellel b/c we're already async so why not
        let ray: Array<Promise<string>> = [];
        for (let i = 0, len = this.sched.getNumPeriods(); i < len; i++) {
            //if it's not passing or whatever, we display it
            let period: ScheduleUtil.Period = this.sched.getPeriod(i);
            //make a buncha row templates
            if (period.getType() >= 0 && period.getType() != ScheduleUtil.PeriodType.PASSING) ray.push(this.makeRow(period, i * inv, index === i));
        }
        //go!
        return Promise.all(ray).then((strings: Array<string>) => {
            //get the last two elements in the array and put them somewhere else (they're different)
            //now we have all the components, lets package them up and send it off to our display class
            let ret = strings.join('');
            //add the header
            return UIUtil.templateEngine(this.tableTemplate, {
                head: this.sched.getName() + ' Schedule',
                sched: ret,
            });
        });        
    }

    //promise chaining function to construct individual rows of the graphic
    private makeRow(period: ScheduleUtil.Period, colorBlendFrac: number, isCurrent: boolean): Promise<string> {
        //query events to see if there are any during this period
        return new Promise((resolve) => {
            //return the fully constructed template
            //do period types differently of course
            switch (period.getType()) {
                case PeriodType.CLASS:
                case PeriodType.LUNCH:
                    return resolve(UIUtil.templateEngine(this.itemTemplate, {
                        upTime: period.getStart().format('h:mm a'),
                        lowTime: period.getEnd().format('h:mm a'),
                        lineColor: ColorUtil.blendColors('#00ff00', '#004700', colorBlendFrac),
                        name: period.getName(),
                        backColor: isCurrent ? 'lightgreen' : '',
                    }));
                default:
                    return resolve('');
            }
        });
    }
}

export = ScheduleGraphic;