/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML

 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */

abstract class UIItem {
    //unique ID, so this element can be updated later
    public readonly id: string;

    //constructor must accept ID
    constructor(id: string) { this.id = id; }

    //Varibles to put in template, in form of { name: value }
    //searches for strings in double curly beackets and replaces them (e.g. {{thing}})
    //no spaces in there please
    //this function will search every member of values, and fill the template
    protected templateEngine(template: string, values: Object): string {
        //get all teh keys, and map them to a RegEx for optimization
        let re = new RegExp(Object.keys(values)
            //give the strings the template syntax
            .map((str) => { return '{{' + str + '}}'; })
            //join them with the or operator
            .join('|'), 'g');
        //then in the replace, match the things to the things (filtering out the {{}} first)
        return template.replace(re, function (matched) { return values[matched.replace(new RegExp(/{|}/, 'g'), '')]; });
    }

    abstract getHTML(): string;
}

export = UIItem;