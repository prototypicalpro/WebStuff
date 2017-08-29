/**
 * Simple events list graphic
 * Using the UIItem API
 */


import UIItem = require('./UIItem');
import EventInterface = require('../WHSLib/EventInterface');
import EventData = require('../WHSLib/EventData');
import ColorUtil = require('./ColorUtil');
import * as moment from 'moment';

class EventGraphic extends UIItem {
    //storage events
    private readonly events: EventData;
    private readonly extraEvents: Array<EventInterface>;
    //storage title
    private readonly header: string;
    //stroage start and end times
    private readonly start: number;
    private readonly end: number;
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
    constructor(events: EventData, header: string, start: number, end: number, addEvents: Array<EventInterface> = []) {
        super();
        this.events = events;
        this.extraEvents = addEvents;
        this.header = header;
        this.start = start;
        this.end = end;
    }
    //and finally, get all dat HTML
    getHTML(): Promise<string> {
        //temp var!
        let eventObjs = [];
        for (let i = 0, len = this.extraEvents.length; i < len; i++) eventObjs.push({
                //if it isn't all day, do templating, else use ALL DAY template instead
                //beware nested conditional
                time: !this.extraEvents[i].isAllDay ? this.templateEngine(this.normalTime, {
                    start: moment(this.extraEvents[i].startTime).format('h:mm a'),
                    end: moment(this.extraEvents[i].endTime).format('h:mm a'),
                }) : this.allDayTime,
                //add extra modifier class if it's all day as well
                modCl: !this.extraEvents[i].isAllDay ? '' : 'evSmall',
                name: this.extraEvents[i].title,
            });
        return this.events.getEvents(this.start, this.end, (event) => {
            eventObjs.push({
                //if it isn't all day, do templating, else use ALL DAY template instead
                //beware nested conditional
                time: !event.isAllDay ? this.templateEngine(this.normalTime, {
                    start: moment(event.startTime).format('h:mm a'),
                    end: moment(event.endTime).format('h:mm a'),
                }) : this.allDayTime,
                //add extra modifier class if it's all day as well
                modCl: !event.isAllDay ? '' : 'evSmall',
                name: event.title,
            });
        }).then(() => {
            if (eventObjs.length > 0) {
                //do templating after so we can have line color fancyness
                let eventStr = '';
                const inv = 1.0 / (eventObjs.length - 1);
                for (let i = 0, len = eventObjs.length; i < len; i++) {
                    if (eventObjs.length === 1) eventObjs[i].lineColor = '#00ff00';
                    else eventObjs[i].lineColor = ColorUtil.blendColors('#00ff00', '#004700', i * inv);
                    eventStr += this.templateEngine(this.eventTemplate, eventObjs[i]);
                }
                return Promise.resolve(this.templateEngine(this.template, {
                    head: this.header,
                    stuff: eventStr,
                }));
            }
            else return Promise.resolve('');
        });
    }
}

export = EventGraphic;