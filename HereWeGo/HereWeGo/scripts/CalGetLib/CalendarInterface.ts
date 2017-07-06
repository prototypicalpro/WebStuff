/*
 * HTTP GET Implementation Interface
 * Designed to provide backup HTTP clients in case some don't work
 * Also abstracts all the http crap
 */

interface CalendarInterface {
    getCalendar(extraParams: Object): Promise<Object>;
}

export = CalendarInterface;