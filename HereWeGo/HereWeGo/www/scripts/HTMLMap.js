define(["require", "exports"], function (require, exports) {
    "use strict";
    var HTMLMap;
    (function (HTMLMap) {
        HTMLMap.backImg = document.querySelector('#img');
        HTMLMap.backThumb = document.querySelector('#lowRes');
        HTMLMap.timeText = document.querySelector('.timeText');
        HTMLMap.menuBar = document.querySelector('#menuBar');
        HTMLMap.menuLine = document.querySelector('#menuLine');
        HTMLMap.topBarText = document.querySelector('#barText');
        HTMLMap.backText = document.querySelector('.backText');
        HTMLMap.periodText = document.querySelector('.periodText');
        HTMLMap.content = document.querySelector('#addStuff');
        HTMLMap.sideMenu = document.querySelector('#SMHere');
        HTMLMap.sideButton = document.querySelector('#sideButton');
        HTMLMap.toastBox = document.querySelector('#toast');
        HTMLMap.setSliderHTML = (html) => {
            HTMLMap.content.innerHTML = html;
        };
        HTMLMap.setSideMenuHTML = (html) => {
            HTMLMap.sideMenu.innerHTML = html;
        };
        HTMLMap.setBackImg = (url) => {
            HTMLMap.backImg.style.backgroundImage = 'url("' + url + '")';
        };
        HTMLMap.setBackLowRes = (url) => {
            HTMLMap.backThumb.style.backgroundImage = 'url("' + url + '")';
        };
    })(HTMLMap || (HTMLMap = {}));
    return HTMLMap;
});
//# sourceMappingURL=HTMLMap.js.map