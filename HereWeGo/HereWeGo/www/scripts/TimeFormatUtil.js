define(["require", "exports"], function (require, exports) {
    "use strict";
    var TimeFormatUtil;
    (function (TimeFormatUtil) {
        TimeFormatUtil.asSmallTime = (time) => {
            if (!(time instanceof Date))
                time = new Date(time);
            return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        };
        var Days;
        (function (Days) {
            Days[Days["Sunday"] = 0] = "Sunday";
            Days[Days["Monday"] = 1] = "Monday";
            Days[Days["Tuesday"] = 2] = "Tuesday";
            Days[Days["Wednesday"] = 3] = "Wednesday";
            Days[Days["Thursday"] = 4] = "Thursday";
            Days[Days["Friday"] = 5] = "Friday";
            Days[Days["Saturday"] = 6] = "Saturday";
        })(Days || (Days = {}));
        TimeFormatUtil.asFullDayText = (weekDay) => {
            if (typeof weekDay != 'number')
                weekDay = weekDay.getDay();
            if (weekDay > 6)
                weekDay -= 7;
            return Days[weekDay];
        };
        TimeFormatUtil.asTimeTo = (start, end) => {
            const mm = 1 * 60000;
            const m = 45 * 60000;
            let duration = (end instanceof Date ? end.getTime() : end) - (start instanceof Date ? start.getTime() : start);
            if (duration > m) {
                if (duration >= 3600000 + m) {
                    let hrCnt = 0;
                    while (duration >= 3600000) {
                        hrCnt++;
                        duration -= 3600000;
                    }
                    if (duration > m)
                        hrCnt++;
                    return hrCnt + ' hours';
                }
                else
                    return 'An hour';
            }
            if (duration > mm)
                return Math.ceil(duration / 60000) + ' minutes';
            return 'A minute';
        };
        TimeFormatUtil.asLongDayMonthText = (day) => {
            if (typeof day == 'number')
                day = new Date(day);
            return day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        };
    })(TimeFormatUtil || (TimeFormatUtil = {}));
    return TimeFormatUtil;
});
//# sourceMappingURL=TimeFormatUtil.js.map