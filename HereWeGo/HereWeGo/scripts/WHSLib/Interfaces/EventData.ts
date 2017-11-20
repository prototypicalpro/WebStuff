/*
 * Event interface structure thingy, designed to make storing, parseing, and reading google calendar stuff
 * that much easier
 */

namespace EventData {
    //compressed event data enum index
    export const enum CloudEventEnum {
        id = 0,
        schedule,
        title,
        startTime,
        endTime,
        isAllDay,
    }

    export interface EventInterface {
        isAllDay: boolean;
        startTime: number;
        endTime: number;
        schedule: boolean;
        title: string;
        id: string;
    }
}

export = EventData;