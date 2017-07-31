/*
 * Namespace to simplify acsess to HTML elements in app
 * If you create an element in index and need to acess it in javascript,
 * make sure it is refrenced from here
 * Should make everything a little less spaghetti
 */

namespace HTMLMap {
    export const bottomBarButton: Element = document.querySelector('.bar.fab');
    export const bottomBarText: Element = document.querySelector('.timeText');

    const menuBar: HTMLElement = document.querySelector('#menuBar') as HTMLElement;
    const menuLine: HTMLElement = document.querySelector('#menuLine') as HTMLElement;

    export const topUpText: Element = document.querySelector('.topText.up');
    export const topLowText: Element = document.querySelector('.topText.low');

    const scheduleTableObject: Node = document.querySelector('#schedule');
    const scheduleRowTemplate: HTMLElement = document.querySelector('#periodRow') as HTMLElement;

    export const bottomContent: HTMLElement = document.querySelector('#content') as HTMLElement;

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
        fontWeight: string;
        fontColor: string;
    }

    export const pushBackScheduleRow = (row: ScheduleRowData): void => {
        //fix all the varibles
        scheduleRowTemplate.querySelector('.text.up').innerHTML = row.leftText[0];
        scheduleRowTemplate.querySelector('.text.low').innerHTML = row.leftText[1];
        let temp: HTMLElement = scheduleRowTemplate.querySelector('.leftCell') as HTMLElement; //yay typescript
        temp.style.borderRightColor = row.lineColor;
        scheduleRowTemplate.querySelector('.rightCell.text').innerHTML = row.rightText;
        let temp2: NodeListOf<Element> = scheduleRowTemplate.querySelectorAll('.text');
        for (let i = 0, len = temp2.length; i < len; i++) {
            let element: HTMLElement = temp2.item(i) as HTMLElement;
            element.style.fontWeight = row.fontWeight;
            element.style.color = row.fontColor;
        }
        if (row.backgroundColor != undefined) scheduleRowTemplate.style.backgroundColor = row.backgroundColor;
        scheduleRowTemplate.id = row.rightText;
        scheduleRowTemplate.classList.remove('hidden');
        //create a copy of the schedule row template
        let nextRow = scheduleRowTemplate.cloneNode(true);
        //add it to the table
        scheduleTableObject.appendChild(nextRow);
    }

    export const deleteScheduleRows = (): void => { while (scheduleTableObject.firstChild) scheduleTableObject.removeChild(scheduleTableObject.firstChild); }

    //add HTML to the bottom section
    export const setBottomHTML = (html: string): void => {
        bottomContent.innerHTML = html;
    }
}

export = HTMLMap;