/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */

import UIItem = require('./UIItem');

class ScheduleGraphic extends UIItem {
    //HTML Template
    //It's gonna be ugly, that's just how it is
    id = '7';

    constructor() {
        super();
        console.log(this.id);
    }

    doThing() {
        console.log("did thing");
    }
}