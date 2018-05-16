import UIUtil = require('./UIUtil');
import ButtonUI = require('./ButtonUI');
import TimeUtil = require('../TimeFormatUtil');
import EventData = require('../WHSLib/Interfaces/EventData');
import ColorUtil = require('./ColorUtil');
import EventRowUI = require('./EventRowUI');
/**
 * Events list graphic.
 * 
 * Includes clickable events with dropdown descriptions, auto updating, and way to many strings.
 * See also: {@link EventRowUI}.
 */
class EventGraphic extends UIUtil.UIItem {
    /** 
     * Wrapper template 
     * @param id id: The ID of the div element
     * @param stuff stuff: The div's content 
     */
    private static readonly wrap: string = `<div id="{{id}}">{{stuff}}</div>`;
    /** 
     * Heading template ("Thursday") 
     * @param head head: The header text
     */
    private static readonly headStr: string = `<p class="header">{{head}}</p>`;
    /** 
     * Normal time template 
     * @param start start: The string start time (ex. "3:45PM")
     * @param end end: The string end time (ex. "3:45PM")
     */
    private static readonly normalTime: string = `
        <p class="leftUp">{{start}}</p>
        <p class="leftLow">{{end}}</p>`;
    /** All day time template */
    private static readonly allDayTime: string = `<p class='leftUp' style='margin:0'>ALL DAY</p>`;
    //setup update callbacks with recv
    readonly recvParams: Array<UIUtil.RecvParams>; 
    //other stuff
    private readonly dispSched: boolean;
    //storage title
    private readonly header: string;
    /** Storage document item (selects wrapper div) */
    private elem: HTMLElement;
    /** Storage array of the {@link EventRowUI} objects */
    private eventRowRay: Array<UIUtil.UIItem>;
    /** 
     * @param header string title of the event list (ex. "Events For Today")
     * @param day Date to fetch events for, 0 being today, 1 being tommorrow, and so on. See {@link UIUtil.CalParams.dayStart}.
     * @param displaySchedule Whether or not to display the schedule event ("A schedule")
     */
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
    /**
     * Build HTML based on the events recieved.
     * @param data The {@link DataManage} generated data, containing {@link CalDataManage} data
     * @returns The event graphic HTML
     */
    onInit(data: Array<any>): string {
        //the data will be fed to us in a tuple indexed by recvType
        //we only need the events for the today, so start with that
        let day = new Date();
        day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).dayStart);
        //contruct our array of event rows
        this.eventRowRay = EventGraphic.buildEventHTML(data[UIUtil.RecvType.CAL]["events"], day.setHours(0, 0, 0, 0), this.dispSched);
        return UIUtil.templateEngine(EventGraphic.wrap, {
            id: this.id,
            //header HTML + row HTML
            stuff: UIUtil.templateEngine(EventGraphic.headStr, { head: this.header }) + this.eventRowRay.map(b => b.onInit(null)).join('')
        });
    }
    /**
     * Store {@link EventGraphic.elem}, and setup array of {@link EventRowUI}.
     */
    buildJS() {
        //store document objects
        this.elem = document.querySelector('#' + this.id) as HTMLElement;
        //run the buildJS on all the buttons
        for(let i = 0, len = this.eventRowRay.length; i < len; i++) this.eventRowRay[i].buildJS();
    }
    /**
     * If new data has been recieved, rebuild the HTML and use {@link EventGraphic.elem} to swap out
     * the old HTML.
     * @param data The {@link DataManage} generated data, containing {@link CalDataManage} data
     */
    onUpdate(data: Array<any>) {
        let day = new Date();
        day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).dayStart);
        //if the event cahce has been populated
        let temp = data[UIUtil.RecvType.CAL]["events"];
        //if updated, update!
        if (temp) {
            //get the button items
            this.eventRowRay = EventGraphic.buildEventHTML(temp, day.setHours(0, 0, 0, 0), this.dispSched);
            //then build all the HTML!
            this.elem.innerHTML = UIUtil.templateEngine(EventGraphic.headStr, { head: this.header }) + this.eventRowRay.map(b => b.onInit(null)).join('');
            //then buildJS
            for(let i = 0, len = this.eventRowRay.length; i < len; i++) this.eventRowRay[i].buildJS();
        }
        else {
            //remove the buttons so they don't cause trouble
            delete this.eventRowRay;
            this.elem.innerHTML = '';
        }
    }
    onFocus() {
        //run the onFocus on all the buttons
        for(let i = 0, len = this.eventRowRay.length; i < len; i++) if(this.eventRowRay[i].onFocus) this.eventRowRay[i].onFocus();
    }
   /**
    * Create array of {@link EventRowUI} based on the event data, day, and whether or not to display the schedule.
    * @param eventData The {@link CalDataManage} data in format of {epoch : Array<{@link EventData.EventInterface}>}
    * @param startOfDayTime The epoch time of the begining of the day, used to select the event row from eventData
    * @param displaySchedule Whether or not to display the schedule
    * @returns An array of {@link EventRowUI}
    */
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
                    ret.push(new EventRowUI('evSmall', EventGraphic.allDayTime, '#00ff00', schedName ? schedName : 'No School', true));
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
                    ret.push(new EventRowUI( makeAllDay ? 'evSmall' : '', 
                                                        makeAllDay ? EventGraphic.allDayTime : UIUtil.templateEngine(EventGraphic.normalTime, {
                                                            start: TimeUtil.asSmallTime(events[i].startTime),
                                                            end: TimeUtil.asSmallTime(events[i].endTime),
                                                        }),
                                                        lineColor,
                                                        events[i].title,
                                                        false,
                                                        events[i].desc));
                }
            }
            //return!
            return ret;
        }
        return [];
    }
}

export = EventGraphic;