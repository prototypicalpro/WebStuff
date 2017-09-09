/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML
 *
 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */

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
    //Interface to universalize UI Items (such as graphics)
    //should be implemented by anything that returns a string of HTML
    export interface UIItem {
        //TODO: Replace trickle update heirarchy with query heirarchy
        //static makeStart and then more later? idk
        //the return all the HTML that we want
        getHTML(): Promise<string>;
        //get all the child UIItems (or if it is at the bottom, don't implement this function)
        getChildren?(): Array<UIItem>;
    }
}

export = UIUtil;