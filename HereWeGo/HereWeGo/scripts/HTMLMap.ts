/*
 * Namespace to simplify acsess to HTML elements in app
 * If you create an element in index and need to acess it in javascript,
 * make sure it is refrenced from here
 * Should make everything a little less spaghetti
 */

namespace HTMLMap {
    export const backImg: HTMLElement = document.querySelector('#img') as HTMLElement;
    export const backThumb: HTMLElement = document.querySelector('#lowRes') as HTMLElement;

    export const timeText: Element = document.querySelector('.timeText');

    export const menuBar: HTMLElement = document.querySelector('#menuBar') as HTMLElement;
    export const menuLine: HTMLElement = document.querySelector('#menuLine') as HTMLElement;

    export const topBar: HTMLElement = document.querySelector('#topBar') as HTMLElement;
    export const topBarText: HTMLElement = document.querySelector('#barText') as HTMLElement;

    export const backText: Element = document.querySelector('.backText');
    export const periodText: Element = document.querySelector('.periodText');

    export const content: HTMLElement = document.querySelector('#addStuff') as HTMLElement;

    export const sideMenu: HTMLElement = document.querySelector('#SMHere') as HTMLElement;
    export const sideButton: HTMLElement = document.querySelector('#sideButton') as HTMLElement;

    export const toastBox: HTMLElement = document.querySelector('#toast') as HTMLElement;

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

    export const setBackLowRes = (url: string): void => {
        backThumb.style.backgroundImage = 'url("' + url + '")';
    }
}

export = HTMLMap;