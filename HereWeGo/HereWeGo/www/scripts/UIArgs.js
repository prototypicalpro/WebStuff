/**
 * Namespace to enumerate all dependency injection constants
 * Allows UI classes to tell the super class which data they need
 * Might be a little messy
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    var UIUtil;
    (function (UIUtil) {
        //enumeration to specify which triggers the element would like to be refreshed in
        var TRIGGERED;
        (function (TRIGGERED) {
            //called after the time needs updating
            TRIGGERED[TRIGGERED["onTimeUpdate"] = 0] = "onTimeUpdate";
            //called after a new event has changed the event cache
            TRIGGERED[TRIGGERED["onEventUpdate"] = 1] = "onEventUpdate";
            //called after a new type of schedule has changed the schedule cache
            TRIGGERED[TRIGGERED["onScheduleUpdate"] = 2] = "onScheduleUpdate";
            //TODO: Interactivity
        })(TRIGGERED = UIUtil.TRIGGERED || (UIUtil.TRIGGERED = {}));
        //IDK where to put this, but a utility function to dedupe days is here
        //this has a buncha confusing optimization stuff and is pretty much unreadable, but assume it
        //would otherwise reside in one of the ___Data files
        //returns an object in {(small day number (0, 1, 2, etc.)): (Array of indexes in object array argument)} format
        UIUtil.deDupeDays = (key, objs) => {
            let days = {};
            for (let i = 0, len = objs.length; i < len; i++) {
                //convert the date(s) into a number so we can compare it
                //if it's an array, do every date
                let dayRay = objs[i][key];
                if (Array.isArray(dayRay)) {
                    //for every item
                    for (let o = 0, len1 = dayRay.length; o < len1; o++) {
                        //if the days object does not have the property of the time we want to push, add the index of the element
                        if (!days[dayRay[o]])
                            days[dayRay[o]] = [i];
                        else
                            days[dayRay[o]].push(i);
                    }
                }
                else {
                    //if the days object does not have the property of the time we want to push, add the index of the element
                    if (!days[dayRay])
                        days[dayRay] = [i];
                    else
                        days[dayRay].push(i);
                }
            }
            return days;
        };
    })(UIUtil || (UIUtil = {}));
    return UIUtil;
});
//# sourceMappingURL=UIUtil.js.map
