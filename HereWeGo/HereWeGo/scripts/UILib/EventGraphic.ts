/**
 * Simple events list graphic
 * Using the UIItem API
 */

import UIUtil = require('./UIUtil');
import ButtonUI = require('./ButtonUI');
import TimeUtil = require('../TimeFormatUtil');
import EventData = require('../WHSLib/Interfaces/EventData');
import ColorUtil = require('./ColorUtil');

class EventGraphic extends UIUtil.UIItem {
    //template for overall
    private static readonly wrap: string = `<div id="{{id}}">{{stuff}}</div>`;
    private static readonly headStr: string = `<p class="header">{{head}}</p>`;
    //time templates
    private static readonly normalTime: string = `
        <p class="leftUp">{{start}}</p>
        <p class="leftLow">{{end}}</p>`;
    private static readonly allDayTime: string = `<p class='leftUp' style='margin:0'>ALL DAY</p>`;
    //setup update callbacks with recv
    readonly recvParams: Array<UIUtil.RecvParams>; 
    //other stuff
    private dispSched: boolean;
    //storage title
    private readonly header: string;
    //storage document item
    private elem: HTMLElement;
    //storage array of the button parts of the events
    private buttonRay: Array<UIUtil.UIItem>;
    //constructor for teh evenents
    constructor(header: string, day: number, displaySchedule?: boolean) {
        super();
        this.recvParams = [
            //events
            <UIUtil.CalParams>{
                type: UIUtil.RecvType.CAL,
                dayStart: day,
            }
        ];
        this.header = header;
        this.dispSched = displaySchedule;
    }
    //and the funtion itself!
    //we specify the contents of the args array in the varible above
    onInit(data: Array<any>): string {
        //the data will be fed to us in a tuple indexed by recvType
        //we only need the events for the today, so start with that
        let day = new Date();
        day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).dayStart);
        //contruct our array of event rows
        this.buttonRay = EventGraphic.buildEventHTML(data[UIUtil.RecvType.CAL]["events"], day.setHours(0, 0, 0, 0), this.dispSched);
        return UIUtil.templateEngine(EventGraphic.wrap, {
            id: this.id,
            //header HTML + row HTML
            stuff: UIUtil.templateEngine(EventGraphic.headStr, { head: this.header }) + this.buttonRay.map(b => b.onInit(null)).join('')
        });
    }
    buildJS() {
        //store document objects
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
        //run the buildJS on all the buttons
        for(let i = 0, len = this.buttonRay.length; i < len; i++) this.buttonRay[i].buildJS();
    }
    //master update func
    //update if necessary
    onUpdate(data: Array<any>) {
        let day = new Date();
        day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).dayStart);
        //if the event cahce has been populated
        let temp = data[UIUtil.RecvType.CAL]["events"];
        //if updated, update!
        if (temp) {
            //get the button items
            this.buttonRay = EventGraphic.buildEventHTML(temp, day.setHours(0, 0, 0, 0), this.dispSched);
            //then build all the HTML!
            this.elem.innerHTML = UIUtil.templateEngine(EventGraphic.headStr, { head: this.header }) + this.buttonRay.map(b => b.onInit(null)).join('');
            //then buildJS
            for(let i = 0, len = this.buttonRay.length; i < len; i++) this.buttonRay[i].buildJS();
        }
        else {
            //remove the buttons so they don't cause trouble
            delete this.buttonRay;
            this.elem.innerHTML = '';
        }
    }
    //onFocus updates the rows if they exist
    onFocus() {
        //run the onFocus on all the buttons
        for(let i = 0, len = this.buttonRay.length; i < len; i++) if(this.buttonRay[i].onFocus) this.buttonRay[i].onFocus();
    }
    //create an array of EventRows based on event data
    private static buildEventHTML(eventData: any | false, startOfDayTime: number, displaySchedule: boolean): Array<UIUtil.UIItem> {
        if (eventData && eventData[startOfDayTime]) {
            let events: Array<EventData.EventInterface> = eventData[startOfDayTime];
            //if we aren't displaying the current schedule key, filter that event
            if(!displaySchedule) events = events.filter(e => !e.schedule);
            //break if that was the only event
            if(!events || events.length <= 0) return [];
            let length = events.length;
            //return stuff array
            let ret: Array<UIUtil.UIItem> = [];
            //store whether or not to offsett colors index later on
            let schedNameIndex: number | boolean = false;
            if (displaySchedule) {
                schedNameIndex = events.findIndex(ev => ev.schedule);
                if (schedNameIndex !== -1) {
                    let schedName = events[schedNameIndex].title;
                    //append schedule event at top
                    ret.push(new EventGraphic.EventRow('evSmall', EventGraphic.allDayTime, '#00ff00', schedName ? schedName : 'No School'));
                }
                else schedNameIndex = false;
            }
            //yay!
            //do templating after so we can have line color fancyness
            let inv = 1.0 / (schedNameIndex === false ? length - 1 : length);
            for (let i = 0; i < length; i++) {
                if (i !== schedNameIndex) {
                    //set lineColor
                    let lineColor: string;
                    if (length === 1 && schedNameIndex === false) lineColor = '#00ff00';
                    else lineColor = ColorUtil.blendColors('#00ff00', '#004700', (typeof schedNameIndex === 'number' ? i + 1 : i) * inv);
                    //check if event is all day, or event starts before day starts or after day ends
                    let makeAllDay: boolean = events[i].isAllDay || events[i].startTime <= startOfDayTime || events[i].endTime >= startOfDayTime + 86400000;
                    //add another row
                    ret.push(new EventGraphic.EventRow( makeAllDay ? 'evSmall' : '', 
                                                        makeAllDay ? EventGraphic.allDayTime : UIUtil.templateEngine(EventGraphic.normalTime, {
                                                            start: TimeUtil.asSmallTime(events[i].startTime),
                                                            end: TimeUtil.asSmallTime(events[i].endTime),
                                                        }),
                                                        lineColor,
                                                        events[i].title));
                }
            }
            //return!
            return ret;
        }
        return [];
    }
    //abstract each event row into it's own class, so we can make each one a button
    private static readonly EventRow = class extends ButtonUI {
        //event item template
        //100% certified(!) unreadable
        private static readonly eventTemplate: string = `
        <div id="{{id}}">
            <div class="evRow {{modCl}}">
                <div class="leftCell"> 
                    <div class="incep"> 
                        {{time}}
                    </div> 
                </div>
                <div class="rWrap" style="border-left: 2px solid {{lineColor}}">
                    <p class="evRight">{{name}}</p> 
                </div>
            </div>
        </div>`;
        //setting which controls how long each line is
        private static readonly charLineMax: number = 30;
        //member varibles
        protected readonly callback: () => void;
        private readonly strStore: string;
        //constructor
        constructor(modCl: string, time: string, lineColor: string, name: string) {
            super(false, 50);
            //start by creating our HTML
            //add breakline tags to long titles
            let eventFix: string = '';
            //add breaklines to quote so we don't overflow
            while (name.length > EventGraphic.EventRow.charLineMax) {
                //work on the substring ending at the 64th char
                //starting at the nth char, and work backwards until we find a space
                let breakPoint = name.slice(0, EventGraphic.EventRow.charLineMax).lastIndexOf(' ');
                //add a break tag to that space
                eventFix += name.slice(0, breakPoint) + `<br/>`;
                name = name.slice(breakPoint + 1);
            }
            if (eventFix.length) name = eventFix + name;
            //construct event string!
            this.strStore = UIUtil.templateEngine(EventGraphic.EventRow.eventTemplate, {
                id: this.id,
                modCl: modCl,
                time: time,
                lineColor: lineColor,
                name: name
            });
        }
        //onInit just returns the stored string
        //this is normally bad because it means we are messing with strings at the start
        //but these will be constructed in onInit of EventGraphic so whatever
        onInit() {
            return this.strStore;
        }
        //buildJS and otherwise handled in superclass
        //onFocus fetches the description
        onFocus() {
            //console.log("onFocus! " + this.id);
        }
    }
}

export = EventGraphic;