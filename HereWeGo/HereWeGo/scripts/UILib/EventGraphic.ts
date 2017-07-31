/**
 * Simple events list graphic
 * Using the UIItem API
 */

import UIItem = require('./UIItem');

class EventGraphic extends UIItem {
    //template for overall
    private readonly template: string = `
        <table id="{{id}}" class="eventTable">{{stuff}}</table>`
    //and template for each item
    //100% certified unreadable
    private readonly itemTempalte: string = `
        <tr> <td class="leftCell"> <p>{{time}}</p> </td>
        <td class="rightCell"> <p>{{text}}</p> </td> </tr>`
    //temp cache string
    private tempString: string = "";
    //function to push back event
    pushBackEvent(time: string, text: string): void {
        this.tempString += this.templateEngine(this.itemTempalte, {
            time: time,
            text: text,
        });
    }
    //and finally, get all dat HTML
    getHTML(): string {
        let temp = this.templateEngine(this.template, {
            id: this.id,
            stuff: this.tempString
        });
        this.tempString = "";
        return temp;
    }
}

export = EventGraphic;