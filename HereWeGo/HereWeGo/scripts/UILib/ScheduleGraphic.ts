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
import * as moment from 'moment';
import { PeriodType } from '../WHSLib/ScheduleUtil';

class ScheduleGraphic extends UIItem {
    //storage schedule
    private sched: ScheduleData;
    //storage events
    private event: EventData;
    //I sorta have to include this due to the direct database

    //HTML Template
    //It's gonna be ugly, that's just how it is
    //schedule table template
    private readonly tableTemplate: string = `
        <p class="schedHead header">{{head}}</p>   
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
                    {{evWrap}}
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

    //event item template for other evetns outside of school
    private readonly eventTemplate: string = `
        <div class="evRow">
            <div class="leftCell"> 
                <div class="incep"> <p class="leftLow">{{time}}</p> </div> 
            </div>
            <div class="rWrap" style="border-left: 2px solid {{lineColor}}">
                <p class="evText evRight">{{name}}</p> 
            </div>
        </div>`;

    //constructor with schedule
    constructor(sched: ScheduleData, event: EventData) {
        super();
        this.sched = sched;
        this.event = event;
    }

    getHTML(): Promise<string> {
        //get the schedule key for today, then get the schedule object associated with it
        //all in a flatmapped .then structure
        let schedule: ScheduleUtil.Schedule;
        return this.event.getScheduleKey(new Date()).then(this.sched.getSchedule.bind(this.sched)).then((schedObj: any) => {
            //cast to schedule
            schedule = schedObj as ScheduleUtil.Schedule;
            //do all the construction stuff
            //TODO: REMOVE THIS
            //let index = schedule.getCurrentPeriodIndex(Date.now());
            let index = 7;
            const inv = 1.0 / schedule.getNumPeriods();
            //all parrellel b/c we're already async so why not
            let ray: Array<Promise<string>> = [];
            //add before school events on first
            ray.push(this.makeBeforeEvents(schedule.getPeriod(0).getStart().valueOf(), '#000000'));
            for (let i = 0, len = schedule.getNumPeriods(); i < len; i++) {
                //if it's not passing or whatever, we display it
                let period: ScheduleUtil.Period = schedule.getPeriod(i);
                //make a buncha row templates
                if (period.getType() >= 0 && period.getType() != ScheduleUtil.PeriodType.PASSING) ray.push(this.makeRow(period, i * inv, index === i));
            }
            //add the after school events on last
            ray.push(this.makeAfterEvents(schedule.getPeriod(schedule.getNumPeriods() - 1).getEnd().valueOf(), '#FF0000'));
            return Promise.all(ray);
        }).then((strings: Array<string>) => {
            //get the last two elements in the array and put them somewhere else (they're different)
            //now we have all the components, lets package them up and send it off to our display class
            let ret = strings.join('');
            //add the header
            return this.templateEngine(this.tableTemplate, {
                head: schedule.getName() + ' Schedule',
                sched: ret,
            });
        });        
    }

    //promise chaining function to construct individual rows of the graphic
    private makeRow(period: ScheduleUtil.Period, colorBlendFrac: number, isCurrent: boolean): Promise<string> {
        //query events to see if there are any during this period
        let eventString = '';
        return this.event.getEvents(period.getStart().valueOf(), period.getEnd().valueOf(), (event) => {
            eventString += this.templateEngine(this.inlineEventTemplate, { name: event.title });
        }).then(() => {
            //template the event string
            if (eventString != '') eventString = this.templateEngine(this.inlineEventWrapper, { events: eventString });
            //return the fully constructed template
            //do period types differently of course
            switch (period.getType()) {
                case PeriodType.CLASS:
                case PeriodType.LUNCH:
                    return this.templateEngine(this.itemTemplate, {
                        upTime: period.getStart().format('h:mma'),
                        lowTime: period.getEnd().format('h:mma'),
                        lineColor: this.blendColors('#004700', '#00ff00', colorBlendFrac),
                        name: period.getName(),
                        backColor: isCurrent ? 'lightgreen' : '',
                        evWrap: eventString,
                    });
                default:
                    return '';
            }
        });
    }

    //also check before and after school for events, and display those
    private makeBeforeEvents(startTime: number, color: string): Promise<string> {
        //get the start of the day pointed to
        let start = new Date(startTime);
        start.setHours(0, 0, 0, 0);
        //query events to see if there are any before startTime
        let eventString = '';
        return this.event.getEvents(start.getTime(), startTime, (event) => {
            eventString += this.templateEngine(this.eventTemplate, {
                time: moment(event.startTime).format('h:mma'),
                name: event.title,
                lineColor: color,
            });
        }).then(() => { return eventString; });
    }

    //and after school too
    private makeAfterEvents(startTime: number, color: string): Promise<string> {
        //get the end of the day pointed to
        let end = new Date();
        end.setHours(23, 59, 59, 999); //lol this is too good
        //query events to see if there are any after startTime
        let eventString = '';
        return this.event.getEvents(startTime, end.getTime(), (event) => {
            eventString += this.templateEngine(this.eventTemplate, {
                time: moment(event.startTime).format('h:mma'),
                name: event.title,
                lineColor: color,
            });
        }).then(() => { return eventString; });
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