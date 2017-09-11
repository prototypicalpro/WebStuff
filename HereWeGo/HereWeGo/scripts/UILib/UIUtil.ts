/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML
 *
 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */

import UIArgs = require('../UIArgs');

namespace UIUtil {
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
    //utility function to search an array of UIItem for base children and return the flat array
    export const findChildren = (ray: Array<UIItem>): Array<UIItem> => {
        //iterate through every item making sure to find it's children, adding things on the end to check as we go
        for(let i = 0; i < ray.length; i++){
            if(ray[i].getChildren){
                ray.push.apply(ray, ray[i].getChildren());
            }
        }
        return ray;
    };
    //unique ID utility function, will just increment a number to ensure nothing is duplicated
    var idCount: number = 0;
    export const getUniqueId = (): number => {
        return idCount++;
    }
    //Interface to universalize UI Items (such as graphics)
    //should be implemented by anything that returns a string of HTML
    export abstract class UIItem {
        //automated unique ID generation
        readonly id: number;
        constructor() {
            this.id = getUniqueId();
        }
        //get all the child UIItems (or if it is at the bottom, don't implement this function)
        getChildren?(): Array<UIItem>;
        //the enum array or item for the onInit
        abstract onInitRecv: Array<UIArgs.RecvParams>;
        //build HTML
        abstract onInit(inj: Array<any> | null): string;
        //run every time the app state is changed(e.g. the time changes and we need to update the front)
        //the enum array or item for the onTimeUpdate
        onTimeUpdateRecv?: Array<UIArgs.RecvParams>;
        //paremeters are based on the enumerated constant above
        onTimeUpdate?(inj: Array<any> | null): void;
        //the enum array or item for the onUpdate
        onEventUpdateRecv?: Array<UIArgs.RecvParams>;
        //paremeters are based on the enumerated constant above
        onEventUpdate?(inj: Array<any> | null): void;
        //the enum array or item for the onUserRefresh
        onScheduleUpdateRecv?: UIArgs.RecvParams | Array<UIArgs.RecvParams>;
        //run only when the user triggers a refresh (includes the app coming in and out of focus)
        onScheduleUpdateRefresh?(inj: Array<any> | null): void;
    }
}

export = UIUtil;