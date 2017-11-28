define(["require", "exports", "./UIUtil", "./ColorUtil"], function (require, exports, UIUtil, ColorUtil) {
    "use strict";
    class ScheduleGraphic extends UIUtil.UIItem {
        constructor(day) {
            super();
            this.wrap = `<div id="{{id}}">{{stuff}}</div>`;
            this.tableTemplate = `
        <p class="header">{{head}}</p>   
        {{sched}}`;
            this.itemTemplate = `
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
            this.inlineEventWrapper = `
    <div class="evWrap">
        {{events}}
    </div>`;
            this.inlineEventTemplate = `<p class="evText">{{name}}</p>`;
            this.recvParams = [
                {
                    type: 0,
                    schedDay: day,
                },
            ];
        }
        onInit(data) {
            let day = new Date();
            day.setHours(0, 0, 0, 0);
            let sched = data[0]["scheds"][day.setDate(day.getDate() + this.recvParams[0].schedDay)];
            return UIUtil.templateEngine(this.wrap, {
                id: this.id,
                stuff: sched ? this.makeSchedule(sched, new Date()) : '',
            });
        }
        buildJS() { }
        makeSchedule(sched, day) {
            if (!sched)
                return '';
            let schedStr = '';
            this.lastIndex = sched.getCurrentPeriodAndIndex(day)[0];
            const inv = 1.0 / (sched.getNumPeriods() - 1);
            let today = day.setHours(0, 0, 0, 0);
            for (let i = 0, len = sched.getNumPeriods(); i < len; i++) {
                let period = sched.getPeriod(i);
                if (period.getType() >= 0) {
                    schedStr += UIUtil.templateEngine(this.itemTemplate, {
                        upTime: period.getStartStr(),
                        lowTime: period.getEndStr(),
                        lineColor: ColorUtil.blendColors('#00ff00', '#004700', i * inv),
                        name: period.getName(),
                        backColor: this.lastIndex === i ? 'lightgreen' : '',
                        id: 'p' + i,
                    });
                }
            }
            return UIUtil.templateEngine(this.tableTemplate, {
                head: sched.getName() + ' Schedule',
                sched: schedStr,
            });
        }
    }
    return ScheduleGraphic;
});
//# sourceMappingURL=ScheduleGraphic.js.map