/*
 * Namespace to simplify acsess to HTML elements in app
 * If you create an element in index and need to acess it in javascript,
 * make sure it is refrenced from here
 * Should make everything a little less spaghetti
 */

namespace HTMLMap {
    export const backImg: HTMLElement = document.querySelector('#img') as HTMLElement;

    //export const bottomBarButton: Element = document.querySelector('.bar.fab');
    export const timeText: Element = document.querySelector('.timeText');

    const menuBar: HTMLElement = document.querySelector('#menuBar') as HTMLElement;
    export const menuLine: HTMLElement = document.querySelector('#menuLine') as HTMLElement;

    export const backText: Element = document.querySelector('.backText');
    export const periodText: Element = document.querySelector('.periodText');

    const scheduleTableObject: Node = document.querySelector('#schedule');
    const scheduleRowTemplate: HTMLElement = document.querySelector('#periodRow') as HTMLElement;

    export const content: HTMLElement = document.querySelector('#addStuff') as HTMLElement;

    export const sideMenu: HTMLElement = document.querySelector('#SMHere') as HTMLElement;
    export const sideButton: HTMLElement = document.querySelector('#sideButton') as HTMLElement;

    export const toastBox: HTMLElement = document.querySelector('#toast') as HTMLElement;

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
    export const setSliderHTML = (html: string): void => {
        content.innerHTML = html;
    }

    export const setSideMenuHTML = (html: string): void => {
        sideMenu.innerHTML = html;
    }

    export const setBackImg = (url: string): void => {
        backImg.style.backgroundImage = 'url("' + url + '")';
    }
}

export = HTMLMap;