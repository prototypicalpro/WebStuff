/**
 * Simple events list graphic
 * Using the UIItem API
 */

/*
import UIItem = require('./UIItem');
import EventInterface = require('../WHSLib/EventInterface');
import * as moment from 'moment';

class EventGraphic extends UIItem {
    //template for overall
    private readonly template: string = `
        <p class="evHead header">Events</p>
        <table class="eventTable">{{stuff}}</table>`
    //and template for each item
    //100% certified unreadable
    private readonly itemTemplate: string = `
        <tr> <td class="leftCell"> <p>{{time}}</p> </td>
        <td class="rightCell"> <p>{{text}}</p> </td> </tr>`
    //temp array for all teh events
    private readonly evList: Array<EventInterface>;
    //temp string for iteration if nesessary
    private tempStr: string = '';
    //constructor for teh evenents
    constructor(evList: Array<EventInterface>) {
        super();
        this.evList = evList;
    }
    //since indexeddb is weird, I'm also adding an iterable callback
    //if this is called, getHTML will not construct but instead return whatever this thing made
    iterateEvent(event: EventInterface) {
        this.tempStr += this.templateEngine(this.itemTemplate, {
            time: moment(event.startTime).format('h:mma'),
            title: event.title,
        });
    }
    //and finally, get all dat HTML
    getHTML(): string {
        //if we iterated, return the iterated string
        if (!this.evList || this.tempStr != '') {
            //but delete the string
            let temptempstr = this.templateEngine(this.template, { stuff: this.tempStr });
            this.tempStr = '';
            return temptempstr;
        }
        //construct item string
        let ret: string = '';
        for (let i = 0, len = this.evList.length; i < len; i++) ret += this.templateEngine(this.itemTemplate, {
            time: moment(this.evList[i].startTime).format('h:mma'),
            title: this.evList[i].title,
        });
        return this.templateEngine(this.template, { stuff: ret });
    }
}

export = EventGraphic;
*/