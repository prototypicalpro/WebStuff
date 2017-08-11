/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIItem = require('./UIItem');
import ScheduleData = require('../WHSLib/ScheduleData');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import EventData = require('../WHSLib/EventData');
import CalDataManage = require('../WHSLib/CalDataManage');
import { PeriodType } from '../WHSLib/ScheduleUtil';

class ScheduleGraphic extends UIItem {
    //storage schedule
    private sched: ScheduleData;
    //storage events
    private event: EventData;
    //I sorta have to include this due to the direct database

    //HTML Template
    //It's gonna be ugly, that's just how it i
    //schedule table template
    private readonly tableTemplate: string = `
        <p class="schedHead header">{{head}}</p>
        {{sched}}
        <p class="evHead header">Events</p>
        {{events}}`;

    private tempContentString: string = "";

    //period item template
    private readonly itemTemplate: string = `
         <div class="justRow" style="background-color:{{backColor}};">
            <div class="leftCell">
                <p class="leftUp">{{upTime}}</p>
                <p class="leftLow">{{lowTime}}</p>
            </div>
            <div id="rightWrap" style="border-left: 2px solid {{lineColor}};">
                <p class="rText">{{name}}</p>
                {{events}}
            </div>
        </div>`

    //event item template for inline with the schedule
    private readonly inlineEventTemplate: string = `
        <p class="evText">{{name}}</p>`;

    //event item template for other evetns outside of school
    private readonly eventTemplate: string = `
        <p class="regEv">{{time}} - {{name}}</p>`;

    //constructor with schedule
    constructor(sched: ScheduleData, event: EventData) {
        super();
        this.sched = sched;
        this.event = event;
    }

    getHTML(): string {
        //construct the middle graphic
        let ret: string = '';
        //cache current schedule
        //there must be some sort of law against this, but I'm sick of .then
        //TODO: Fix Async IndexedDB Hell
        //cache current period
        let cur = schedule.getCurrentPeriodIndex(Date.now());
        let inv = 1.0 / schedule.getNumPeriods();
        for (let i = 0, len = schedule.getNumPeriods(); i < len; i++) {
            //cache period
            let period = schedule.getPeriod(i);
            //do period types differently of course
            switch (period.getType()) {
                case PeriodType.CLASS:
                case PeriodType.LUNCH:
                    ret += this.templateEngine(this.itemTemplate, {
                        upTime: period.getStart().format('h:mma'),
                        lowTime: period.getEnd().format('h:mma'),
                        lineColor: this.blendColors('#008000', '#90ee90', (len - i) * inv),
                        name: period.getName(),
                        backColor: cur === i ? 'lightgreen' : '',
                        events: ''
                    });
                    break;
                default:
                    break;
            }
        }
        //add the header
        return this.templateEngine(this.tableTemplate, {
            head: schedule.getName() + ' Schedule',
            sched: ret,
        });
    }

    //utility color function from this jesus post: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    private shadeColors(color: string, percent: number): string {
        var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }

    private blendColors(c0, c1, p) {
        var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
    }
}

export = ScheduleGraphic;