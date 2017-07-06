/*
 * List of constants (API key, url, etc.) used when getting the calendar
 */

//because library is written for the Wilson Calender, calender credentials will be
//static
//const CAL_ID: string = 'q0q3k1l212j63ll589gckte05ebgqfe4@import.calendar.google.com';
//const CAL_ID: string = 'o2tur235ud7inbdm3je330pl4c@group.calendar.google.com'; old google calendar
const CAL_ID: string = 'anythingupgrade@gmail.com' //my calendar

const CalendarConstants = {
    parameters: {
        key: 'AIzaSyB0FJRVrer63aO-U_4JFi-6XCo0bS6Y6yk',
        singleEvents: 'true',
    },
    URL: 'https://www.googleapis.com/calendar/v3/calendars/' + CAL_ID + '/events',
};

export = CalendarConstants;