/*
 * Schedule interface structure thingy, designed to make storing, parseing, and reading all that JSON
 * that much easier
 */

namespace StoreSchedUtil {
    //utility interface to represent the data retrieved from the cloud
    export interface StoreSchedule {
        periods: Array<Array<string>>;
        key: string;
    };

    //all the database keys, defined by the interface above
    export const SCHED_KEYS = ['key', 'periods'];

    export interface StorePeriod {
        startTime: string,
        endTime: string,
        periodType: string,
        name: string
    };

    //utility enum to represent the array locations of data items in the period string array from the cloud
    export const enum IndexName {
        START_TIME = 0,
        END_TIME = 1,
        PERIOD_TYPE = 2,
        NAME = 3
    }

    // all times from the cloud will read like a clock
    // for more info read "string + format" in moment.js docs
    export const fmt = "hh:mma";
}

export = StoreSchedUtil;