define(["require", "exports", "./UIUtil", "../TimeFormatUtil", "./ColorUtil"], function (require, exports, UIUtil, TimeUtil, ColorUtil) {
    "use strict";
    class EventGraphic extends UIUtil.UIItem {
        constructor(header, day, displaySchedule) {
            super();
            this.wrap = `<div id="{{id}}">{{stuff}}</div>`;
            this.templateStr = `
            <p class="header">{{head}}</p>
            {{stuff}}`;
            this.eventTemplate = `
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
            this.normalTime = `
    <p class="leftUp">{{start}}</p> 
    <p class="leftLow">{{end}}</p>`;
            this.allDayTime = `
    <p class='leftUp' style='margin:0'>ALL DAY</p>`;
            this.charLineMax = 32;
            this.recvParams = [
                {
                    type: 0,
                    dayStart: day,
                }
            ];
            this.header = header;
            this.dispSched = displaySchedule;
        }
        onInit(data) {
            let day = new Date();
            day.setDate(day.getDate() + this.recvParams[0].dayStart);
            return UIUtil.templateEngine(this.wrap, {
                id: this.id,
                stuff: this.buildEventHTML(data[0]["events"], day.setHours(0, 0, 0, 0), day.setHours(23, 59, 59, 999)),
            });
        }
        buildJS() {
            this.elem = document.querySelector('#' + this.id);
        }
        onUpdate(data) {
            let temp = data[0]["events"][new Date().setHours(0, 0, 0, 0)];
            if (temp)
                this.elem.innerHTML = this.buildEventHTML(temp, new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999));
        }
        buildEventHTML(eventData, start, end) {
            if (eventData) {
                let events = [].concat.apply([], Object.keys(eventData).filter((time) => { let num = parseInt(time); return num >= start && num <= end; }).map((key) => { return eventData[key]; }));
                let length = events.length;
                if (length <= 0)
                    return '';
                let eventStr = '';
                let schedNameIndex = false;
                if (this.dispSched) {
                    schedNameIndex = events.findIndex((ev) => { return ev.schedule; });
                    if (schedNameIndex != -1) {
                        let schedName = events[schedNameIndex].title;
                        eventStr += UIUtil.templateEngine(this.eventTemplate, {
                            modCl: 'evSmall',
                            time: this.allDayTime,
                            name: schedName ? schedName + ' Schedule' : 'No School',
                            lineColor: '#00ff00',
                        });
                    }
                    else
                        schedNameIndex = false;
                }
                let inv = 1.0 / (schedNameIndex === false ? length - 1 : length);
                for (let i = 0; i < length; i++) {
                    if (i !== schedNameIndex) {
                        let eventProp = {
                            time: !events[i].isAllDay ? UIUtil.templateEngine(this.normalTime, {
                                start: TimeUtil.asSmallTime(events[i].startTime),
                                end: TimeUtil.asSmallTime(events[i].endTime),
                            }) : this.allDayTime,
                            modCl: !events[i].isAllDay ? '' : 'evSmall',
                            name: events[i].title,
                        };
                        if (length === 1 && schedNameIndex === false)
                            eventProp.lineColor = '#00ff00';
                        else
                            eventProp.lineColor = ColorUtil.blendColors('#00ff00', '#004700', (typeof schedNameIndex === 'number' ? i + 1 : i) * inv);
                        let eventfix = '';
                        let tempEvent = eventProp.name;
                        while (tempEvent.length > this.charLineMax) {
                            let breakPoint = tempEvent.slice(0, this.charLineMax).lastIndexOf(' ');
                            eventfix += tempEvent.slice(0, breakPoint) + `<br/>`;
                            tempEvent = tempEvent.slice(breakPoint + 1);
                        }
                        if (eventfix.length)
                            eventProp.name = eventfix + tempEvent;
                        else
                            eventProp.name = tempEvent;
                        eventStr += UIUtil.templateEngine(this.eventTemplate, eventProp);
                    }
                }
                return UIUtil.templateEngine(this.templateStr, {
                    head: this.header,
                    stuff: eventStr,
                });
            }
            else
                return '';
        }
    }
    return EventGraphic;
});
//# sourceMappingURL=EventGraphic.js.map