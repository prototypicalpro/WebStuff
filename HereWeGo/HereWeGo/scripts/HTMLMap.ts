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
    export const menuLine: HTMLElement = document.querySelector('#menuLine') as HTMLElement;

    export const topUpText: Element = document.querySelector('.upText');
    export const topLowText: Element = document.querySelector('.lowText');

    const scheduleTableObject: Node = document.querySelector('#schedule');
    const scheduleRowTemplate: HTMLElement = document.querySelector('#periodRow') as HTMLElement;

    export const content: HTMLElement = document.querySelector('.js_slides') as HTMLElement;

    //interface which holds the data for a schedule row in html, which I will convert into an html object
    export interface ScheduleRowData {
        leftText: Array<string>;
        lineColor: string;
        rightText: string;
        backgroundColor?: string;
        fontWeight: string;
        fontColor: string;
    }

    export const deleteScheduleRows = (): void => { while (scheduleTableObject.firstChild) scheduleTableObject.removeChild(scheduleTableObject.firstChild); }

    //add HTML to the bottom section
    export const appendSliderHTML = (html: string): void => {
        content.innerHTML += html;
    }
}

export = HTMLMap;