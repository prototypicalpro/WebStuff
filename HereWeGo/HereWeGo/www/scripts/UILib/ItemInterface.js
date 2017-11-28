/**
 * This file should serve to provide a template for a google cards-esq list of informational
 * things. The elements of HTML will be constructed in each module implementing this interface
 * then this interface will allow a manager class to then put those elements into the actual HTML

 * I also might make those files add CSS, but probably not..?
 * Will also include some templating-engine-esq utility functions
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    class UIItem {
        //this function will search every member of values, and fill the template
        getHTML() {
            //get all the keys from the values object
            let keys = Object.keys(this.values);
            //temporary copy of template
            let temp = this.template;
            //replace them with the computed values
            for (let i = 0, len = keys.length; i < len; i++)
                temp.replace('{{' + keys[i] + '}}', this.values[keys[i]]);
            //return the computed HTML
            return temp;
        }
    }
    return UIItem;
});
//# sourceMappingURL=ItemInterface.js.map