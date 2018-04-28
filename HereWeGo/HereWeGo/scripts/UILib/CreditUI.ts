/**
 * Popup to display credits to all the people who helped create this wonderful project
 * And the ones who didn't too (hi Benjamin)
 */

import UIUtil = require('./UIUtil');
import IScroll = require('../iscroll-lite');

class CreditUI extends UIUtil.UIItem {
    private static readonly template: string = `
        <div class="credImg"></div>
        <div class="credImg" id="hmmm" style="height:30vh;top:70vh;background-image:none;box-shadow:none;"></div>
        <div id="credScroll" class="scrollHack" style="position:relative"> 
            <div class="scrollHack">
                <div class="credTop">
                    <div class="credShd"></div>
                    <div class="credIconText">Wilson App</div>
                    <img class="credIcon"></img>
                </div>
                <div class="credCont">
                    <p class="credTitle" style="margin-bottom: 0;">The Team</p>
                    <p class="credSubT">(Right to Left)</p>
                    <p class="benjamin"> 
                        Vision: Nico Machinski <br>
                        Development: Noah Koontz <br>
                        Design: Sam Lewis <br>
                        Marketing: Elliot Chimenti <br>
                    </p>
                    <p class="credTitle">Photography</p>
                    <a class="benjamin link" id="flk">Kitrick Miller</a>
                    <p class="credTitle">Astrophotography</p>
                    <p class="benjamin">
                        Thomas Lemione <br> 
                        Benjamin Carlton <br> 
                        Mateo Minato <br> 
                        Christopher Schuring <br> 
                        Eleanor Solomon <br>
                    </p>
                    <p class="credTitle">Special Thanks</p>
                    <p class="benjamin"> 
                        Wilson Peer Counselling <br>
                        Wilson Leadership <br>
                        Wilson Computer Science <br>
                        Wilson App Alpha Testers <br>
                    </p>
                    <p class="credTitle">Open Source Licenses</p>
                    <a class="benjamin link" id="llory">Lory</a>
                    <a class="benjamin link" id="liscroll">IScroll</a>
                    <a class="benjamin link" id="lquote">Forismatic</a>
                    <p class="benjamin"><br><br><br><br><br><br></p>
                </div>
            </div>
        </div>`;

    private makeCallback: (url: string) => () => void;

    constructor(makeUrl: (url: string) => () => void) {
        super();
        this.makeCallback = makeUrl;
    }

    onInit(): string {
        return CreditUI.template;
    }

    buildJS() {
        new IScroll(document.querySelector('#credScroll'));
        //populate links
        document.querySelector('#flk').addEventListener("click", this.makeCallback("https://www.flickr.com/photos/kitrickmiller/"));
        document.querySelector('#llory').addEventListener("click", this.makeCallback("https://github.com/meandmax/lory/blob/master/LICENSE"));
        document.querySelector('#liscroll').addEventListener("click", this.makeCallback("https://github.com/cubiq/iscroll/blob/master/LICENSE"));
        document.querySelector('#lquote').addEventListener("click", this.makeCallback("http://forismatic.com/en/api/"));

        //I have no idea what you're talking about, I've never seen this before
        let hmmm = document.querySelector('#hmmm') as HTMLElement;
        let num = Math.random();
        if(num < 0.33) hmmm.style.backgroundImage = 'url("./images/jesus.jpg")';
        else if(num < 0.66) hmmm.style.backgroundImage = 'url("./images/jesus2.png")';
        else hmmm.style.backgroundImage = 'url("./images/jesus3.jpg")';
    }
}

export = CreditUI;