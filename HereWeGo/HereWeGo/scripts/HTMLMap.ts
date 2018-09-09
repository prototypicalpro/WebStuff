/**
 * An attempt to centralize all document queries used at launch (such as the menu, the backgroud image, so on).
 * A bad idea but may increase performance in the long run.
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
    export const jsFrame: HTMLElement = document.querySelector('.js_frame') as HTMLElement;
    export const menuButton: HTMLElement = document.querySelector("#menuButton") as HTMLElement;
    export const pageDiv: HTMLElement = document.querySelector("#page") as HTMLElement;

    /** Show the gif for fetching new internet data */
    export const startLoad = (): void => {
        backImg.classList.add("loadCover");
        loadingGif.classList.add("loadGif");
        setTimeout(() => requestAnimationFrame(navigator.splashscreen.hide), 300);
    };

    /** remove the gif for fetching new internet data */
    export const endLoad = (): void => {
        backImg.classList.remove("loadCover");
        loadingGif.classList.remove("loadGif");
    }
}

export = HTMLMap;