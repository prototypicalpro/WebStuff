/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML
 *
 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */

namespace UIUtil {
    //enumeration for the type of recvParam
    export const enum RecvType {
        CAL,
        QUOTE,
        IMAGE,
        length = 3, //adjust for number of above items
    }
    //base interface for an object which specifys how to inject
    export interface RecvParams {
        type: RecvType;
    }
    //interfaces enumerating the properties each object must have in order to recieve the data
    //only present due to weird database efficiency stuff
    export interface CalParams extends RecvParams {
        //which days we want events for
        //use a number, 0 being today, 1 being the next day, and so on
        //to get a range, also fill dayend
        dayStart?: number;
        dayCount?: number;
        //constructing a schedule is expensive, so we'll assume that if we want a schedule we'll ony need a single one
        schedDay?: number;
        //database runs this function for every event, so this should store all the data you need 
        //to do the thing
    }
    //Varibles to put in template, in form of { name: value }
    //searches for strings in double curly beackets and replaces them (e.g. {{thing}})
    //no spaces in there please
    //this function will search every member of values, and fill the template
    export const templateEngine = (template: string, values: Object): string => {
        //get all teh keys, and map them to a RegEx for optimization
        let re = new RegExp(Object.keys(values)
            //give the strings the template syntax
            .map((str) => { return '{{' + str + '}}'; })
            //join them with the or operator
            .join('|'), 'g');
        //then in the replace, match the things to the things (filtering out the {{}} first)
        return template.replace(re, function (matched) { return values[matched.replace(new RegExp(/{|}/, 'g'), '')]; });
    };
    //utility function to flatten the arrays of messes of recvparams
    export const combineParams = (ray: Array<UIItem>): Array<RecvParams> => {
        return [].concat.apply([], ray.map((item) => { return item.recvParams; }).filter((obj) => { return obj; }));
    };

    //unique ID utility function, will just increment a number to ensure nothing is duplicated
    var idCount: number = 0;
    const getUniqueId = (): number => {
        return idCount++;
    }
    //Interface to universalize UI Items (such as graphics)
    //should be implemented by anything that returns a string of HTML
    export abstract class UIItem {
        //automated unique ID generation
        readonly id: string;
        constructor() {
            this.id = 'i' + getUniqueId();
        }
        //get data, fill in html from children or class
        abstract onInit(data: Array<any>): void | string;
        //build JS over the html from onInit
        abstract buildJS(): void;
        //update data, also give data to children, reconstructing HTML if needed
        onUpdate?(data: Array<any>): void;
        //recv parameters, parsed from children at construction
        recvParams?: Array<UIUtil.RecvParams>;
    }

    //didn't have a better place to put this :(
    export interface ButtonParam {
        text: string,
        callback: () => void;
        longPressCallback?: () => void;
        icon?: string,
    }
}

export = UIUtil;

//idk what do do with these
/*
//utility function to de duplicate an array of days stored inside an object
    private deDupeDays(key: string, objs: Array<Object>): Array<number> {
        let days: Array<number> = [];
        for (let i = 0, len = objs.length; i < len; i++) {
            //convert the date(s) into a number so we can compare it
            //if it's an array, do every date
            let dayRay = objs[i][key] as Array<number>;
            if (Array.isArray(dayRay)) {
                //for every item, if the day isn't a duplicate add it
                for (let o = 0, len1 = dayRay.length; o < len1; o++) if(days.indexOf(dayRay[o]) == -1) days.push(dayRay[o]);
            }
            //else if it's a single item, add it if it's not a dupe
            else if(days.indexOf(dayRay[i]) == -1) days.push(dayRay[i]);
        }
        return days;
    }

     //IDK where to put this, but a utility function to dedupe days is here
    //this has a buncha confusing optimization stuff and is pretty much unreadable, but assume it
    //would otherwise reside in one of the ___Data files
    //returns an object in {(small day number (0, 1, 2, etc.)): (Array of indexes in object array argument)} format
    export const deDupeDays = (key: string, objs: Array<Object>): Object => {
        let days: Object = {};
        for (let i = 0, len = objs.length; i < len; i++) {
            //convert the date(s) into a number so we can compare it
            //if it's an array, do every date
            let dayRay = objs[i][key] as Array<number>;
            if (Array.isArray(dayRay)) {
                //for every item
                for (let o = 0, len1 = dayRay.length; o < len1; o++) {
                    //if the days object does not have the property of the time we want to push, add the index of the element
                    if (!days[dayRay[o]]) days[dayRay[o]] = [i];
                    //else push it to the existing array
                    else days[dayRay[o]].push(i);
                }
            }
            //else if it's a single item, add it if it's not a dupe
            else {
                //if the days object does not have the property of the time we want to push, add the index of the element
                if (!days[<number>dayRay]) days[<number>dayRay] = [i];
                //else push it to the existing array
                else days[<number>dayRay].push(i);
            }
        }
        return days;
    }
*/