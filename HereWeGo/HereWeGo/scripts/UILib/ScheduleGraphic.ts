import UIUtil = require('./UIUtil');
import ErrorUtil = require('../ErrorUtil');
import ScheduleUtil = require('../WHSLib/ScheduleUtil');
import ColorUtil = require('./ColorUtil');
import TimeFormatUtil = require('../TimeFormatUtil');
import { PeriodType } from '../WHSLib/ScheduleUtil';

/**
 * Schedule graphic UI Element.
 * 
 * Displays a generic school schedule with times, period names, and highlights the current period.
 */

class ScheduleGraphic extends UIUtil.UIItem {
    //stored date
    //HTML Template
    //It's gonna be ugly, that's just how it is
    //schedule table template
    /** 
     * Heading template ("Thursday") 
     * @param head head: The header text
     */
    private static readonly headStr: string = `<p class="header">{{head}}</p>`;
    /**
     * Single time row template (two times, one name)
     * @param backColor backColor: The CSS background color for the row
     * @param id id: The ID to create the row with
     * @param upTime upTime: The upper (start) time in the row
     * @param lowTime lowTime: The lower (end) time in the row
     * @param lineColor lineColor: The CSS color to use for the dividing line between time and name
     * @param name name: The name to display on the row
     */
    private static readonly itemTemplate: string = `
         <div class="justRow" style="background-color:{{backColor}};" id="{{id}}">
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
        </div>`;
    //cached access to the wrapper div
    private schedElem: HTMLElement;
    //cahced schedule object
    private sched: ScheduleUtil.Schedule;
    //last green period store
    private lastIndex: number;
    //update params to get
    recvParams: Array<UIUtil.RecvParams>;
    /**
     * @param day Date to fetch events for, 0 being today, 1 being tommorrow, and so on. See {@link UIUtil.CalParams.dayStart}.
     * @param excludeNormal If true, only display schedule if schedule is marked 'special' by backend (see {@link CalDataManage})
     */
    constructor(day: number, excludeNormal?: boolean) {
        super();
        this.recvParams = [
            //and the schedule
            <UIUtil.CalParams>{
                type: UIUtil.RecvType.CAL,
                schedDay: day,
                excludeNormal: excludeNormal,
            },
        ];
    }
    /**
     * Build HTMl based on the schedule given.
     * @param data The {@link DataManage} generated data, containing {@link CalDataManage} data
     * @returns The Schedule graphic HTML
     */
    onInit(data: Array<any>): string {
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        this.sched = data[UIUtil.RecvType.CAL]["scheds"][day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).schedDay)];
        return UIUtil.templateEngine(ScheduleGraphic.wrapTemplate, {
            id: this.id,
            stuff: this.sched ? this.makeSchedule(this.sched, new Date()) : '',
        });
    }
    /** Store {@link ScheduleGraphic.schedElem} */
    buildJS() { 
        this.schedElem = document.querySelector("#" + this.id);
    }
    //utility makeScheduleHTML
    private makeSchedule(sched: ScheduleUtil.Schedule, day: Date): string {
        //if there's no schedule, rip
        if (!sched) return '';
        //do all the construction stuff
        let schedStr = '';
        this.lastIndex = sched.getCurrentPeriodAndIndex(day)[0];
        const inv = 1.0 / (sched.getNumPeriods() - 1);
        //all parrellel b/c we're already async so why not
        //cache today
        for (let i = 0, len = sched.getNumPeriods(); i < len; i++) {
            //if it's not passing or whatever, we display it
            let period: ScheduleUtil.Period = sched.getPeriod(i);
            //make a buncha row templates
            if (period.getType() >= 0) {
                schedStr += UIUtil.templateEngine(ScheduleGraphic.itemTemplate, {
                    upTime: period.getStartStr(),
                    lowTime: period.getEndStr(),
                    lineColor: ColorUtil.blendColors('#00ff00', '#004700', i * inv),
                    name: period.getName(),
                    backColor: this.lastIndex === i && (this.recvParams[0] as UIUtil.CalParams).schedDay === 0 ? 'lightgreen' : '',
                    id: 'p' + i,
                });
            }
        }
        return UIUtil.templateEngine(ScheduleGraphic.headStr, { head: sched.getName() + ' Schedule' }) + schedStr;
    }
    /**
     * Use {@link ScheduleGraphic.schedElem} to swap out old schedule graphic for new
     * @param data The {@link DataManage} generated data, containing {@link CalDataManage} data
     */
    onUpdate(data: Array<any>): void {
        let day = new Date();
        day.setHours(0, 0, 0, 0);
        this.sched = data[UIUtil.RecvType.CAL]["scheds"][day.setDate(day.getDate() + (<UIUtil.CalParams>this.recvParams[0]).schedDay)];
        this.schedElem.innerHTML = this.sched ? this.makeSchedule(this.sched, new Date()) : '';
    }
    /** Check and see if period changes, and if so change the color of the correct row to display current period */
    onTimeChanged(): void {
        if(this.sched && (this.recvParams[0] as UIUtil.CalParams).schedDay === 0) {
            //if nothing has changed, don't change anything
            let currentStuff = this.sched.getCurrentPeriodAndIndex(new Date());
            let currentIndex = currentStuff[0];
            if (this.lastIndex === currentIndex) return;
            //else remove the color from the last index, assuming it's not a passing period
            if (this.lastIndex >= 0 && this.sched.getPeriod(this.lastIndex).getType() !== ScheduleUtil.PeriodType.passing) {
                let last = document.querySelector('#p' + this.lastIndex) as HTMLElement;
                if (last) last.style.backgroundColor = '';
            }
            //and add it to the current period
            if (currentIndex >= 0 && currentStuff[1].getType() !== ScheduleUtil.PeriodType.passing) {
                let current = document.querySelector('#p' + currentIndex) as HTMLElement;
                if (current) current.style.backgroundColor = 'lightgreen';
            }
            this.lastIndex = currentIndex;
        }
    }
}

export = ScheduleGraphic;