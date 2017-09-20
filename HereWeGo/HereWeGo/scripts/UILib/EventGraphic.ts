/**
 * Simple events list graphic
 * Using the UIItem API
 */

import UIUtil = require('./UIUtil');
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
    //storage schedule name
    private schedName: string;
    //storage events for callback
    private eventObjs: Array<any> = [];
    //storage document item
    private elem: HTMLElement;
    //template for overall
    private readonly wrap: string = `<div id="{{id}}">{{stuff}}</div>`
    private readonly template: string = `
            <p class="header">{{head}}</p>
            {{stuff}}`;
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

    private readonly charLineMax: number = 34;

    //constructor for teh evenents
    constructor(header: string, day: number, displaySchedule: boolean) {
        super();
        this.recv = [
            //events
            <UIUtil.EventParams>{
                type: UIUtil.RecvType.EVENTS,
                storeEvent: this.storeEvent.bind(this),
                day: day,
            },
        ];
        this.header = header;
        if(displaySchedule){
            this.recv.push(<UIUtil.SchedParams>{
                type: UIUtil.RecvType.SCHEDULE,
                day: day,
                schedProps: ['key'],
                storeSchedule: this.storeSchedule.bind(this),
            });
        }
    }
    //new callback api functions!
    //setup update callbacks with recv
    recv: Array<UIUtil.RecvParams>; 
    //and the funtion itself!
    //we specify the contents of the args array in the varible above
    getHTML(): string {
        return UIUtil.templateEngine(this.wrap, {
            id: this.id,
            stuff: this.makeEventHTML(),
        });
    }

    private makeEventHTML(): string {
        //if there is a schedule title, it's in our storage member
        if (this.dispSched) {
            this.eventObjs.unshift({
                modCl: 'evSmall',
                time: this.allDayTime,
                name: this.schedName ? this.schedName + ' Schedule' : 'No School',
            })
        }
        //yay!
        if (this.eventObjs.length > 0) {
            //do templating after so we can have line color fancyness
            let eventStr = '';
            let inv = 1.0 / (this.eventObjs.length - 1);
            for (let i = 0, len = this.eventObjs.length; i < len; i++) {
                //set linecolor
                if (this.eventObjs.length === 1) this.eventObjs[i].lineColor = '#00ff00';
                else this.eventObjs[i].lineColor = ColorUtil.blendColors('#00ff00', '#004700', i * inv);
                //add breakline tags to long titles
                if (this.eventObjs[i].name.length >= this.charLineMax) {
                    //work on the substring ending at the 64th char
                    //starting at the 64th char, and work backwards until we find a space
                    let breakPoint = (<string>this.eventObjs[i].name).slice(0, this.charLineMax).lastIndexOf(' ');
                    //add a break tag to that space
                    this.eventObjs[i].name = (<string>this.eventObjs[i].name).slice(0, breakPoint) + `<br/>` + (<string>this.eventObjs[i].name).slice(breakPoint + 1);
                }
                eventStr += UIUtil.templateEngine(this.eventTemplate, this.eventObjs[i]);
            }
            //reset eventObjs
            this.eventObjs = [];
            //return!
            return UIUtil.templateEngine(this.template, {
                head: this.header,
                stuff: eventStr,
            });
        }
        else return '';
    }

    //store document objects
    onInit() {
       this.elem = document.querySelector('#' + this.id) as HTMLElement;
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

    //the thing that stores a schedule if there is one!
    storeSchedule(sched: Array<string>) {
        if (sched) this.schedName = sched[0];
        else this.schedName = null;
    }

    //master update func
    //update if necessary
    onUpdate(type: Array<UIUtil.TRIGGERED>) {
        //if the event cahce has been populated
        if (this.eventObjs.length > 0) this.elem.innerHTML = this.makeEventHTML();
    }
}

export = EventGraphic;