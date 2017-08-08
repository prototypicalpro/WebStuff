/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIItem = require('./UIItem');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');

class ScheduleGraphic extends UIItem {
    //storage schedule
    private sched: ScheduleUtil.Schedule;

    //HTML Template
    //It's gonna be ugly, that's just how it i
    //schedule table template
    private readonly tableTemplate: string = `
        <p class="schedHead header">{{head}}</p>
        <table class="table">
            <tbody>{{content}}</tbody> 
        </table>`;

    private tempContentString: string = "";

    //period item template
    private readonly itemTemplate: string = `
        <tr class="justRow" style="background-color:{{backColor}};">
            <td class="leftCell" style="border-right: 2px solid {{lineColor}};">
                <p class="left text up">{{upTime}}</p>
                <p class="left text low">{{lowTime}}</p>
            </td>
            <td class="rightCell">
                <p class="rightCell text">{{name}}</p>
            </td>
        </tr>`

    //constructor with schedule
    constructor(sched: ScheduleUtil.Schedule) {
        super();
        this.sched = sched;
    }

    getHTML(): string {
        //construct the middle graphic
        let ret: string = '';
        //cache current period
        let cur = this.sched.getCurrentPeriodIndex();
        let inv = 1.0 / this.sched.getNumPeriods();
        for (let i = 0, len = this.sched.getNumPeriods(); i < len; i++) {
            //cache period
            let period = this.sched.getPeriod(i);
            //do period types differently of course
            switch (period.getType()) {
                case ScheduleUtil.PeriodType.CLASS:
                case ScheduleUtil.PeriodType.LUNCH:
                    ret += this.templateEngine(this.itemTemplate, {
                        upTime: period.getStart().format('h:mma'),
                        lowTime: period.getEnd().format('h:mma'),
                        lineColor: this.blendColors('#008000', '#90ee90', (len - i) * inv),
                        name: period.getName(),
                        backColor: cur === i ? 'lightgreen' : undefined
                    });
                    break;
                default:
                    break;
            }
        }
        //add the header
        return this.templateEngine(this.tableTemplate, {
            head: this.sched.getName() + ' Schedule',
            content: ret,
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