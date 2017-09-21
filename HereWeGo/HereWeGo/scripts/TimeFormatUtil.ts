/**
 * Script to replace the functionality of momentjs
 * b/c visual studio was choking on it and being dumb
 */

namespace TimeFormatUtil {
    //format as 9:36 am
    export const asSmallTime = (time: Date | number): string => {
        if (!(time instanceof Date)) time = new Date(time);
        let hours = time.getHours();
        if (hours > 12) return (hours - 12) + ':' + time.getMinutes() + ' pm';
        return hours + ':' + time.getMinutes() + ' am';
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
        const mm = 3; //min to a few min
        const m = 45; //min to hour
        const mh = 15; //half an hour to hour
        //typecheck and subtract to get the duration of time we're talking about
        let duration = (end instanceof Date ? end.getTime() : end) - (start instanceof Date ? start.getTime() : start);
        //if greater than min thresh, display hours
        if (duration > m * 60000) {
            if (duration >= 3600000 + mh * 60000) return 'An hour and a half';
            else return 'An hour';
            let hrCnt = 1;
            while ((duration -= 3600000) > 0) hrCnt++;
            if (Math.abs(duration) > m * 60000)
            let retStr = hrCnt + ' hours';
            
        }
    }
}

export = TimeFormatUtil;