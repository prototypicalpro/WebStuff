/**
 * Provides useful functions and interfaces for the UI system.
 * 
 * I don't know how many events there are until the day of, and as a result I don't know how many event graphics 
 * we need to construct until the app is opened. The solution is dynamically generate the HTML at the start based 
 * on the data given to us. Industry experience (googling) has shown me that the fasted way to do this is to create 
 * what is known as a templating engine (ex. {@link http://mustache.github.io/mustache.5.html})
 * which uses string manipulation to create HTML pages and then renders it all at once. Of course I wanted fast and compact so
 * I wrote my own found here: {@link UIUtil.templateEngine}
 * 
 * The rest of the UI component system is designed around using this templating engine to increase the reusability and
 * modularity of the code written in each component. Everything in the UI is written in a class that extends {@link UIUtil.UIItem}.
 * This class contains abstract methods for a {@link UIUtil.UIItem.onInit HTML builder function} which returns a string to put in the HTML, 
 * {@link UIUtil.UIItem.buildJS Javascript builder function} which then binds listeners over the newly created elements,
 * and multiple optional functions called on state changes (data update, time, etc.). These functiions are managed either by the 
 * {@link onDeviceReady top level script} or a parent UIItem class (ex. {@link SlideTabUI}). All CSS is located in the index.css file, and classes in
 * each component determine the effects applied to the HTML. I attempted to avoid inline styles for readability, but if needed they are a good 
 * debugging tool.
 * 
 * Data (events, schedule, etc.) is given to the UIItem through a parameter in {@link UIUtil.UIItem.onInit} or {@link UIUtil.UIItem.onUpdate}. 
 * This data must be generated from an instance of {@link DataManage}, and more detail on how this data is fetched and what it's contents are 
 * can be found in {@link DataManage}. Each UIItem has an array of {@link UIUtil.RecvParams} objects in {@link UIUtil.UIItem.recvParams} 
 * which specifies what kind of data is needed for the UIItem. This property must be a flat array of objects, so if a UIItem class has 
 * children UIItems with individual recvParams (ex. {@link SlideTabUI}) it must create a flat list of all the parameters during 
 * construction. This can easily be done using the {@link UIUtil.combineParams} function.
 */

namespace UIUtil {
    /** Numerical contant to specify which class should treat this object as a request */
    export const enum RecvType {
        CAL,
        QUOTE,
        IMAGE,
        /** Numerical length of enumerations above (must adjust manually) */
        length = 3, //adjust for number of above items
    }
    /**
     * Interface defining the base class for a data request parameter, as outlined in {@link UIUtil}. Different parameter types
     * will be defined as extending this interface and including all the extra properties they need (ex. {@link UIUtil.CalParams})
     */
    export interface RecvParams {
        /** Define Which class should we tell we need data */
        type: RecvType;
    }
    /**
     * Calendar {@link UIUtil.RecvParams}. Only in this file due to convienence.
     */
    export interface CalParams extends RecvParams {
        /**
         * Specify which days we want events for: use a number, 0 being today, 1 being the next day, and so on.
         * To get a range, also fill {@link UIUtil.CalParams.dayCount}
         */
        dayStart?: number;
        /** Number of days after dayStart to fetch events for */
        dayCount?: number;
        /** 
         * Which day to get a schedule for: use a number, 0 being today, 1 being the next day, and so on.
         * Constructing a schedule is expensive, so we'll assume that if we want a schedule we'll only need a single one 
         */
        schedDay?: number;
        /** Boolean on whether or not we only care if the schedule is marked "special" (see {@link CalDataManage}) */
        excludeNormal?: boolean;
    }
    /**
     * Template engine function. Follows {{item}} syntax, meaning if a string "this is {{thing}}" is templated
     * against the values {"thing" : 7} the output will be "this is 7". Based off of regular expressions and stackoverflow.
     * @param template The string to apply templating to
     * @param values An object in format of {key: value} where '{{key}}' => value
     * @returns The templated string
     */
    export const templateEngine = (template: string, values: Object): string => {
        //get all teh keys, and map them to a RegEx for optimization
        let re = new RegExp(Object.keys(values)
            //give the strings the template syntax
            .map(str => '{{' + str + '}}')
            //join them with the or operator
            .join('|'), 'g');
        //then in the replace, match the things to the things (filtering out the {{}} first)
        return template.replace(re, matched => values[matched.replace(new RegExp(/{|}/, 'g'), '')]);
    };
    /**
     * Utility function to 'flatmap' {@link UIUtil.UIItem.recvParams} arrays in nested children UIItems. RecvParams must
     * be flattened for optimization purposes (also it's a pain to change it to something not like this).
     * @param ray The array of UIItems to get the recvParams from
     * @returns The flat array of RecvParams
     */
    export const combineParams = (ray: Array<UIItem>): Array<RecvParams> => {
        return [].concat.apply([], ray.map(item => item.recvParams).filter(obj => obj));
    };
    /**
     * Utility function to add '<br/>' tags automatically to a string to limit line length. Breaks lines to the nearest
     * word, split using spaces. If we find a word longer than the line length, do grammatically incorrect hyphenating.
     * CSS word wrapping is annoying so I just did it in JS.
     * @param text The string to add '<br/>' tags to
     * @param charLineLen The maximum number of characters to have in a line, inclusive
     * @returns A string broken with '<br/>' tags
     */
    export const breakText = (text: string, charLineLen: number): string => {
        let textfix = '';
        //add breaklines to quote so we don't overflow
        let breakPoint = 0;
        while (text.length - breakPoint - 1 > charLineLen) {
            //work on the substring ending at the line length char
            //starting at the line length char, and work backwards until we find a space
            let nextBreakPoint = text.slice(breakPoint, breakPoint + charLineLen + 1).lastIndexOf(' ');
            //if no space (word is longer than line length)
            if(nextBreakPoint === -1) {
                //hyphenate at line length
                textfix += text.slice(breakPoint, breakPoint + charLineLen - 1) + '-<br/>';
                breakPoint = breakPoint + charLineLen - 1;
            }
            //add a break tag to that space
            else {
                nextBreakPoint = breakPoint + nextBreakPoint
                textfix += text.slice(breakPoint, nextBreakPoint) + `<br/>`;
                breakPoint = nextBreakPoint + 1;
            }
        }
        if (textfix.length) textfix += text.slice(breakPoint);
        else textfix = text;
        return textfix;
    }
    /**
     * Class implemented by any UI element. For a detailed explanation on this UI system see {@link UIUtil}.
     * 
     * If a UIItem is managing other children UIItems, it must also call each childrens
     * onInit, buildJS, etc. For examples on how to do this see {@link ScrollPageUI} or {@link SlideTabUI}.
     */
    export abstract class UIItem {
        /** 
         * Generic wrapper div template for use in an extending class
         * @param id id: The ID of the div element
         * @param stuff stuff: The div's content 
         */
        protected static readonly wrapTemplate: string = `<div id="{{id}}">{{stuff}}</div>`;
        /** Unique ID utility function for creation of divs with ids */
        private static idCount = 0;
        private static getUniqueId() {
            return UIItem.idCount++;
        }
        readonly id: string;
        /** A call to super() must be made in the implementing class */
        constructor() {
            this.id = 'i' + UIItem.getUniqueId();
        }
        /**
         * Uses the event/schedule/whatever data to construct the HTML string, and return it to be dropped into the app. This function should be called
         * before {@link UIUtil.UIItem.buildJS}.  
         * @param Data the {@link DataManage} generated data
         * @returns An HTML string
         */
        abstract onInit(data: Array<any>): void | string;
        /**
         * Build JS (event listeners, css, etc.) over the generated HTML. This function is split from {@link UIUtil.UIItem.onInit} to allow the main script
         * to populate the page with the generated HTML beforehand, then running this function and allowing it to access the newly created elements using
         * document queries.
         */
        abstract buildJS(): void;
        /**
         * Called when new data (usually over the internet) has been received. Implementing class should update the HTML to reflect this new data 
         * using document queries.
         * @param data The {@link DataManage} generated data
         */
        onUpdate?(data: Array<any>): void;
        /**
         * Called when a signifigant time change (one minuete as of writing) has occured.Implementing class should update the HTML to reflect this new time
         * using document queries.
         */
        onTimeChanged?(): void;
        /**
         * Called when the item has come into focus on the page. 'into focus' implementation depends on UIItem's parent class, for example {@link SlideTabUI}
         * calls onFocus when the item has finished sliding into view.
         */
        onFocus?(): void;
        /**
         * Receive parameters, or objects which specify what kind of data (events, schedule, etc.) the UIItem needs to function. Determines the contents
         * passed to the onInit and onUpdate functions, and is parsed by the {@link DataManage} class. More information on what is done with these parameters
         * can be found in {@link DataManage}.
         */
        recvParams?: Array<UIUtil.RecvParams>;
    }
}

export = UIUtil;
