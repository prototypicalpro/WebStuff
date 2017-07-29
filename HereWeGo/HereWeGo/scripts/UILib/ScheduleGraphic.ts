/**
 * Schedule graphic template
 * All the HTML is in here b/c that way it loads fasterish
 * I'll have to do some dynamic lazy loading nonsense to make it that way tho
 */


import UIItem = require('./UIItem');

class ScheduleGraphic extends UIItem {
    //HTML Template
    //It's gonna be ugly, that's just how it is
    readonly id: string;

    //schedule table template
    tableTemplate: string = `
        <table id="{{id}}" class="table">
            <tbody>{{content}}</tbody> 
        </table>`;

    private tempContentString: string = "";

    //period item template
    itemTemplate: string = `
        <tr class="justRow" id="{{name}}" style="background-color:{{backColor}};">
            <td class="leftCell" style="border-right: 2px solid {{lineColor}};">
                <p class="left text up">{{upTime}}</p>
                <p class="left text low">{{lowTime}}</p>
            </td>
            <td class="rightCell">
                <p class="rightCell text">{{name}}</p>
            </td>
        </tr>`


    constructor(id: string) {
        super();
        this.id = id;
    }

    pushBackRow(leftUpText: string, leftLowText: string, lineColor: string, rightText: string, backgroundColor?: string) {
        this.tempContentString += this.templateEngine(this.itemTemplate, {
            upTime: leftUpText,
            lowTime: leftLowText,
            lineColor: lineColor,
            name: rightText,
            backColor: backgroundColor ? backgroundColor : '#EFEFEF'
        });
    }

    getHTML(): string {
        let temp = this.tempContentString;
        //delete cache
        this.tempContentString = "";
        //serve data
        return this.templateEngine(this.tableTemplate, {
            id: this.id,
            content: temp,
        });
    }
}

export = ScheduleGraphic;