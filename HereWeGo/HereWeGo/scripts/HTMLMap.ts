/*
 * Namespace to simplify acsess to HTML elements in app
 * If you create an element in index and need to acess it in javascript,
 * make sure it is refrenced from here
 * Should make everything a little less spaghetti
 */

namespace HTMLMap {
    export const bottomBarButton: Element = document.querySelector('.bottom.bar.fab');
    export const bottomBarText: Element = document.querySelector('.bottom.bar.timeText');

    export const topUpText: Element = document.querySelector('.top.upText');
    export const topLowText: Element = document.querySelector('.top.lowText');

    const tableObject: Node = document.querySelector('tbody');
    const scheduleRowTemplate: HTMLElement = document.querySelector('#periodRow') as HTMLElement;

    export const startAnimation = (): boolean => {
        // Startup animation
        // Crappily take all elements and rip out the startup animation class to start animation
        // Hopefully we won't need it again
        let animElements: NodeListOf<Element> = document.querySelectorAll(".start");
        if (typeof animElements.length != 'number' || animElements.length === 0) return false;
        for (let i = 0; i < animElements.length; i++) animElements[i].classList.remove("start");
        return true;
    };

    //interface which holds the data for a schedule row in html, which I will convert into an html object
    export interface ScheduleRowData {
        leftText: Array<string>;
        lineColor: string;
        rightText: string;
        backgroundColor?: string;
    }

    export const pushBackScheduleRow = (row: ScheduleRowData): void => {
        //fix all the varibles
        scheduleRowTemplate.querySelector('.leftCell.upText').innerHTML = row.leftText[0];
        scheduleRowTemplate.querySelector('.leftCell.lowText').innerHTML = row.leftText[1];
        let temp: HTMLElement = scheduleRowTemplate.querySelector('.leftCell') as HTMLElement; //yay typescript
        temp.style.borderRightColor = row.lineColor;
        scheduleRowTemplate.querySelector('.rightCell.text').innerHTML = row.rightText;
        if (row.backgroundColor != undefined) scheduleRowTemplate.style.backgroundColor = row.backgroundColor;
        scheduleRowTemplate.id = row.rightText;
        scheduleRowTemplate.classList.remove('hidden');
        //create a copy of the schedule row template
        let nextRow = scheduleRowTemplate.cloneNode(true);
        //add it to the table
        tableObject.appendChild(nextRow);
    }

    export const deleteScheduleRows = (): void => { while (tableObject.firstChild) tableObject.removeChild(tableObject.firstChild); }
}

export = HTMLMap;