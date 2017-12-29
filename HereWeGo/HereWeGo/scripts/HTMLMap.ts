/*
 * Namespace to simplify acsess to HTML elements in app
 * If you create an element in index and need to acess it in javascript,
 * make sure it is refrenced from here
 * Should make everything a little less spaghetti
 */

namespace HTMLMap {
    export const backImg: HTMLImageElement = document.querySelector('#img') as HTMLImageElement;
    export const backThumb: HTMLImageElement = document.querySelector('#lowRes') as HTMLImageElement;

    export const loadingGif: HTMLImageElement = document.querySelector("#load") as HTMLImageElement;

    export const timeText: Element = document.querySelector('.timeText');

    export const menuBar: HTMLElement = document.querySelector('#menuBar') as HTMLElement;
    export const menuLine: HTMLElement = document.querySelector('#menuLine') as HTMLElement;

    export const backText: Element = document.querySelector('.backText');
    export const periodText: Element = document.querySelector('.periodText');

    export const topPos: HTMLElement = document.querySelector('.topPos') as HTMLElement;

    export const slideAdd: HTMLElement = document.querySelector('#add');

    export const sideMenu: HTMLElement = document.querySelector('#SMHere') as HTMLElement;

    export const toastBox: HTMLElement = document.querySelector('#toast') as HTMLElement;

    export const pageBox: HTMLElement = document.querySelector("#page") as HTMLElement;

    //add HTML to the bottom section
    export const setSliderHTML = (html: string): void => {
        slideAdd.innerHTML = html;
    };

    export const setSideMenuHTML = (html: string): void => {
        sideMenu.innerHTML = html;
    };

    export const startLoad = (): void => {
        backImg.classList.add("loadCover");
        loadingGif.classList.add("loadGif");
        setTimeout(() => requestAnimationFrame(navigator.splashscreen.hide), 300);
    };

    export const endLoad = (): void => {
        backImg.classList.remove("loadCover");
        loadingGif.classList.remove("loadGif");
    }
}

export = HTMLMap;