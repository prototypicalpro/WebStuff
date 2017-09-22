/**
 * Script to replace the functionality of momentjs
 * b/c visual studio was choking on it and being dumb
 */

namespace TimeFormatUtil {
    //format as 9:36 am
    export const asSmallTime = (time: Date | number): string => {
        if (!(time instanceof Date)) time = new Date(time);
        let hours = time.getHours();
        let outStr;
        if(hours >= 12) outStr = ' PM';
        else outStr = ' AM';
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        let min = time.getMinutes();
        if (min > 9) return hours + ':' + min + outStr;
        return hours + ':0' + min + outStr;
    };
    //weekday enum cuz
    enum Days {
        Sunday,
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
    }
    //format as day of the week text (Tuesday)
    export const asFullDayText = (weekDay: Date | number): string => {
        if (typeof weekDay != 'number') weekDay = weekDay.getDay();
        //hahaha the string literals, enums are the best
        return Days[weekDay];
    }
    //format as human readable time to finish (An hour, a few seconds)
    //maximum duration of hours
    export const asTimeTo = (start: Date | number, end: Date | number): string => {
        //threshholds for calling something an hour vs. a minuete
        //and so on
        const mm = 3 * 60000; //min to a few min
        const m = 30 * 60000; //min to hour
        //typecheck and subtract to get the duration of time we're talking about
        let duration = (end instanceof Date ? end.getTime() : end) - (start instanceof Date ? start.getTime() : start);
        //if duration is greater than an hour
        if (duration > m) {
            //if duration is greater than an hour and a half, display multiple hours
            if (duration >= 3600000 + m) {
                //count full hours
                let hrCnt = 0;
                while (duration >= 3600000) {
                    hrCnt++;
                    duration -= 3600000;
                }
                //add partial hours
                if (duration > m) hrCnt++;
                //else there aren't any
                return hrCnt + ' hours';
            }
            //else if duration is 'an hour'
            else return 'An hour';
        }
        //else show minuetes
        if (duration >= mm) return Math.floor(duration / 60000) + ' minutes';
        return 'A few minutes';
    }
}

export = TimeFormatUtil;