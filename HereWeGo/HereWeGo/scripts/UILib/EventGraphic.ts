/**
 * Simple events list graphic
 * Using the UIItem API
 */

import UIUtil = require('./UIUtil');
import UIArgs = require('../UIArgs');
import EventInterface = require('../WHSLib/EventInterface');
import EventData = require('../WHSLib/EventData');
import ColorUtil = require('./ColorUtil');
import * as moment from 'moment';

class EventGraphic implements UIArgs.EventRecv, UIArgs.SchedRecv {
    //Recv globals
    recv;
    //we want to trigger init and user refresh
    readonly triggers = [UIArgs.TRIGGERED.INIT, UIArgs.TRIGGERED.USER_REFRESH];
    //Event recv globals
    //stroage event day, follows guidlines set by EventRecv
    readonly eventDay: number;
    readonly schedDay: number;
    //other stuff
    //storage title
    private readonly header: string;
    //storage events to be filled during callback
    private eventObjs: Array<any> = [];
    //storage schedule to be filled
    readonly schedProps: string = 'key';
    schedule: string;
    //whether or not to display schedule for today
    private readonly displaySched: boolean;
    //template for overall
    private readonly template: string = `
        <p class="header">{{head}}</p>
        {{stuff}}`
    //and template for each item
    //100% certified unreadable
    //event item template
    private readonly eventTemplate: string = `
        <div class="evRow {{modCl}}">
            <div class="leftCell"> 
                <div class="incep"> 
                    {{time}}
                </div> 
            </div>
            <div class="rWrap" style="border-left: 2px solid {{lineColor}}">
                <p class="evRight">{{name}}</p> 
            </div>
        </div>`;
    //time templates
    private readonly normalTime: string = `
    <p class="leftUp">{{start}}</p> 
    <p class="leftLow">{{end}}</p>`

    private readonly allDayTime: string = `
    <p class='leftUp' style='margin:0'>ALL DAY</p>`
    //constructor for teh evenents
    constructor(header: string, day: number, displaySchedule: boolean) {
        this.header = header;
        this.eventDay = day;
        this.schedDay = day;
        this.displaySched = displaySchedule;
        if(displaySchedule) this.recv = [UIArgs.ARGS.EVENTS, UIArgs.ARGS.SCHEDULE];
        else this.recv = UIArgs.ARGS.EVENTS;
    }
    //return self for getChildren
    getChildren() {
        return [this];   
    }
    //the thang that does the contruction!
    storeEvent(event: EventInterface) {
        this.eventObjs.push({
            //if it isn't all day, do templating, else use ALL DAY template instead
            //beware nested conditional
            time: !event.isAllDay ? UIUtil.templateEngine(this.normalTime, {
                start: moment(event.startTime).format('LT'),
                end: moment(event.endTime).format('LT'),
            }) : this.allDayTime,
            //add extra modifier class if it's all day as well
            modCl: !event.isAllDay ? '' : 'evSmall',
            name: event.title,
        });
    }
    //and finally, get all dat HTML
    getHTML(): string {
        if (this.eventObjs.length > 0) {
            //do templating after so we can have line color fancyness
            let eventStr = '';
            const inv = 1.0 / (this.eventObjs.length - 1);
            for (let i = 0, len = this.eventObjs.length; i < len; i++) {
                if (this.eventObjs.length === 1) this.eventObjs[i].lineColor = '#00ff00';
                else this.eventObjs[i].lineColor = ColorUtil.blendColors('#00ff00', '#004700', i * inv);
                eventStr += UIUtil.templateEngine(this.eventTemplate, this.eventObjs[i]);
            }
            //reset eventObjs
            this.eventObjs = [];
            return UIUtil.templateEngine(this.template, {
                head: this.header,
                stuff: eventStr,
            });
        }
        return '';
    }
}

export = EventGraphic;