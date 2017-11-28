/**
 * SchedulePage Class
 * Desiged to create a full-pageish graphic
 * displaying the Schedule and Events
 * basically just making it easier on my hands with abstraction
 * And also allowing all the code for that page to stay in this file
 */
define(["require", "exports", "./UILib/UIItem"], function (require, exports, UIItem) {
    "use strict";
    class Page extends UIItem {
        //fill all them varlibles
        constructor(id, items) {
            super();
            //pretty name
            this.name = 'Schedule';
            this.id = id;
            this.items = items;
        }
        //do the thang
        getHTML() {
            //lets make these items pop
            //and by pop I mean construct
            let ret = '';
            for (let i = 0, len = this.items.length; i < len; i++)
                ret += this.items[i].getHTML();
            return ret;
        }
    }
    return Page;
});
//# sourceMappingURL=SchedulePage.js.map