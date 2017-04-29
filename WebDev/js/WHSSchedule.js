/*
 * Javascript class types for a WHS schedule abstraction framework
 * And the encoded schedule as constansts in the framework
 * Designed to make unexpected schedule changes (such as skinny mondays)
 * easy to deal with in code
 * I also hate javascript, and will therefore be explicitly defining as
 * many things as I can to make the code more readable
 */ 

//every schedule is made up of a number of periods, each which have a start and end time
//the idea I have is to create a schedule from a list of periods, and determine how to 
//construct the rest of the page from there

//time class
//takes a time formatted in (hours, minutes, am=false/pm=true) and stores it
class T{
    constructor(hourTime, minuteTime, amPmBool){
        this.hour = hourTime;
        this.minute = minuteTime;
        this.amPm = amPmBool;
    }

    getHour(){
        return this.hour;
    }

    getAmPmString(){
        if(this.amPm) return "pm";
        else return "am";
    }

    getAmPmBool(){
        return this.amPm
    }

    get24Hour(){
        if(this.amPm == false) return this.hour;
        else return this.hour + 12;
    }

    getMinute(){
        return this.minute;
    }

    //returns a date object zeroed at the time
    getDateObject(){
        var hours = this.hour;
        if(this.amPm == true) hours += 12;
        var today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, this.minute);
    }

    toString(){
        var am = "am";
        if(this.amPm == true) am = "pm";
        return this.hour + ':' + this.minute + am;
    }
}

//period class
//takes a start time and end time and is then passed to a period for naming
class TimeSlot{
    constructor(startTime, endTime){
        this.start = startTime;
        this.end = endTime;
    }

    getStartTime(){
        return this.start;
    }

    getEndTime(){
        return this.end;
    }

    toString(){
        return "Start: " + this.start.toString() + " End: " + this.end.toString();
    }
}

//Named period class
//adds names to timeslot, which makes a period object
//$%&* Javascript
class Period{
    constructor(nameString, TimeSlotClass){
        this.name = nameString;
        this.time = TimeSlotClass;
    }

    getName(){
        return this.name;
    }

    getTimeSlot(){
        return this.time;
    }
}

//And now for a sample schedule
//Am I doing this right?
var regScheduleTemplate = {
    "1/5": new TimeSlot(new T(8, 15, false), new T(9, 47, false)), //starts at 8:15am, ends at 9:47am
    "2/6": new TimeSlot(new T(9, 52, false), new T(11, 24, false)), //9:52am, 11:24am
    "Lunch": new TimeSlot(new T(11, 24, false), new T(12, 1, false)), //and so on
    "3/7": new TimeSlot(new T(12, 6, false), new T(1, 38, true)),
    "4/8": new TimeSlot(new T(1, 43, true), new T(3, 15, true))
};
//ugly, but it works
//next, we make vars to contain periods with thier appropriete names
//these should be the ones referenced from the main code
var ADay = {
    "name": "A",
    "schedule": [
        new Period("1", regScheduleTemplate["1/5"]),
        new Period("2", regScheduleTemplate["2/6"]),
        new Period("Lunch", regScheduleTemplate["Lunch"]),
        new Period("3", regScheduleTemplate["3/7"]),
        new Period("4", regScheduleTemplate["4/8"])
    ]
}

var BDay = {
    "name": "B",
    "schedule": [
        new Period("5", regScheduleTemplate["1/5"]),
        new Period("6", regScheduleTemplate["2/6"]),
        new Period("Lunch", regScheduleTemplate["Lunch"]),
        new Period("7", regScheduleTemplate["3/7"]),
        new Period("8", regScheduleTemplate["4/8"])
    ]
}