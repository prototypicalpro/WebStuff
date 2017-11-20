/**
 * Group of interfaces defining the contents of
 * all the schedule and time data recieved from the cloud
 */

namespace ScheduleData {
    //enum for the period data
    export const enum PeriodCloudEnum {
        name = 0,
        type = 1,
    }
    //schedule data interface
    export interface SchedCloudData {
        name: string;
        timeName: string;
        periodNames: Array<[string, string]>;
    }
    //time data enum
    export const enum TimeCloudEnum {
        start = 0,
        end = 1,
    }
    //time cloud data interface
    export interface TimeCloudData {
        name: string;
        times: Array<[string, string]>;
    }
}

export = ScheduleData;