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

class EventGraphic extends UIUtil.UIItem {
    //other stuff
    //storage title
    private readonly header: string;
    //whether or not to display schedule
    private readonly dispSched: boolean;
    //storage events for callback
    private eventObjs: Array<any> = [];
    //template for overall
    private readonly template: string = `
        <div id="{{id}}">
            <p class="header">{{head}}</p>
            {{stuff}}
        </div>`
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
        super();
        this.onInitRecv = [
            //events
            <UIArgs.EventParams>{
                type: UIArgs.RecvType.EVENTS,
                storeEvent: this.storeEvent.bind(this),
                eventDay: day,
            },
        ];
        this.header = header;
        if(displaySchedule){
            this.onInitRecv.push(<UIArgs.SchedParams>{
                type: UIArgs.RecvType.SCHEDULE,
                schedDay: day,
                schedProps: ['key'],
            });
            this.onScheduleUpdateRecv = this.onInitRecv;
        }
        this.dispSched = displaySchedule;
        this.onEventUpdateRecv = this.onInitRecv;
    }
    //new callback api functions!
    //setup init callback with onInitRecv
    onInitRecv: Array<UIArgs.RecvParams>; 
    //and the funtion itself!
    //we specify the contents of the args array in the varible above
    onInit(args: Array<any>): string {
        let areEvents: boolean = args[0];
        //if there is a schedule title, it's in args[1]
        if(this.dispSched) {
            this.eventObjs.unshift({
                modCl: 'evSmall',
                time: this.allDayTime,
                title: args[1] ? args[1] : 'No School',
            })
        }
        //yay!
        if (this.eventObjs.length > 0) {
            //do templating after so we can have line color fancyness
            let eventStr = '';
            let inv = 1.0 / (this.eventObjs.length - 1);
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
                id: this.id,
            });
        }
        return '';
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

    //cache update stuff
    onEventUpdateRecv: Array<UIArgs.RecvParams>; //initialized in contructor
    //function to update!
    //its the same!
    onEventUpdate(inj: Array<any>): void {
        //update graphic contents
        document.querySelector('#' + this.id).innerHTML = this.onInit(inj);
    }

    onScheduleUpdateRecv: Array<UIArgs.RecvParams>;
    //still the same!
    //except we check for a schedule and then update if so
    onScheduleUpdate(inj: Array<any>) {
        if(inj[1]) document.querySelector('#' + this.id).innerHTML = this.onInit(inj);
    }
}

export = EventGraphic;