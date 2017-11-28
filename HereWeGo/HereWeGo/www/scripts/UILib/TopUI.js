define(["require", "exports", "./UIUtil", "../WHSLib/ScheduleUtil", "../HTMLMap", "../TimeFormatUtil"], function (require, exports, UIUtil, ScheduleUtil, HTMLMap, TimeFormatUtil) {
    "use strict";
    class TopUI extends UIUtil.UIItem {
        constructor() {
            super(...arguments);
            this.imageSet = false;
            this.recvParams = [
                {
                    type: 0,
                    schedDay: 0,
                }
            ];
        }
        onInit(data) {
            const day = new Date();
            const zeroDay = new Date().setHours(0, 0, 0, 0);
            const schedule = data[0]["scheds"][zeroDay];
            if (!schedule) {
                HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
                HTMLMap.backText.innerHTML = "";
                HTMLMap.periodText.innerHTML = "No School";
            }
            else {
                const indexAndPeriod = schedule.getCurrentPeriodAndIndex(day);
                if (indexAndPeriod[0] === ScheduleUtil.PeriodType.before_start) {
                    HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, indexAndPeriod[1].getEnd(zeroDay)) + " remaining";
                    HTMLMap.periodText.innerHTML = "Before School";
                }
                else if (indexAndPeriod[0] === ScheduleUtil.PeriodType.after_end) {
                    HTMLMap.timeText.innerHTML = TimeFormatUtil.asSmallTime(day);
                    HTMLMap.periodText.innerHTML = "After School";
                }
                else {
                    const period = indexAndPeriod[1];
                    HTMLMap.timeText.innerHTML = TimeFormatUtil.asTimeTo(day, period.getEnd(zeroDay)) + " remaining";
                    switch (period.getType()) {
                        case ScheduleUtil.PeriodType.class:
                            HTMLMap.periodText.innerHTML = 'Period ' + period.getName();
                            break;
                        case ScheduleUtil.PeriodType.lunch:
                            HTMLMap.periodText.innerHTML = 'Lunch';
                            break;
                        case ScheduleUtil.PeriodType.tutor_time:
                            HTMLMap.periodText.innerHTML = 'Tutor Time';
                            break;
                        case ScheduleUtil.PeriodType.assembly:
                            HTMLMap.periodText.innerHTML = 'Assembly';
                            break;
                        case ScheduleUtil.PeriodType.passing:
                            HTMLMap.periodText.innerHTML = 'Passing';
                            break;
                    }
                }
                HTMLMap.backText.innerHTML = schedule.getName()[0];
            }
            let back = data[2];
            if (!back) {
            }
            if (!this.imageSet) {
                back[0].then((thing) => {
                    let url = URL.createObjectURL(thing);
                    HTMLMap.setBackLowRes(url);
                    let load = new Image();
                    load.onload = () => {
                        this.imageSet = true;
                        navigator.splashscreen.hide();
                    };
                    load.src = url;
                });
                back[1].then((hqThing) => setTimeout(() => HTMLMap.setBackImg(URL.createObjectURL(hqThing)), 50));
            }
        }
        buildJS() {
        }
    }
    return TopUI;
});
//# sourceMappingURL=TopUI.js.map