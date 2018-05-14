import UIUtil = require('./UIUtil');
import IScroll = require('../iscroll-lite');

/**
 * Popup to display credits to all the people who helped create this wonderful project!
 * 
 * ...and the ones who didn't too (hi Benjamin).
 */
class CreditUI extends UIUtil.UIItem {
    //Note: this contains a lot of inline styles as well lot of styles in index.css
    //and is generally pretty hacky.
    //It is recommended when adding yourself to this page you avoid messing with anything
    //that you think shouldn't be there.
    /**
     * Our template for the credits page.
     */
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
    private readonly makeCallback: (url: string) => () => void;

    /** 
     * @param makeUrl Function to call to convert a string URL to a function which opens an external window using the URL.
     */
    constructor(makeUrl: (url: string) => () => void) {
        super();
        this.makeCallback = makeUrl;
    }

    /**
     * Since we don't dynamically generate anything in this case, return our giant string.
     * @returns The CreditUI HTML
     */
    onInit(): string {
        return CreditUI.template;
    }

    /**
     * Initialize IScroll and links.
     */
    buildJS() {
        new IScroll(document.querySelector('#credScroll'));
        //populate links
        document.querySelector('#flk').addEventListener("click", this.makeCallback("https://www.flickr.com/photos/kitrickmiller/"));
        document.querySelector('#llory').addEventListener("click", this.makeCallback("https://github.com/meandmax/lory/blob/master/LICENSE"));
        document.querySelector('#liscroll').addEventListener("click", this.makeCallback("https://github.com/cubiq/iscroll/blob/master/LICENSE"));
        document.querySelector('#lquote').addEventListener("click", this.makeCallback("http://forismatic.com/en/api/"));
        //code never lies, comments sometimes do
        let hmmm = document.querySelector('#hmmm') as HTMLElement;
        let num = Math.random();
        if(num < 0.33) hmmm.style.backgroundImage = 'url("./images/jesus.jpg")';
        else if(num < 0.66) hmmm.style.backgroundImage = 'url("./images/jesus2.png")';
        else hmmm.style.backgroundImage = 'url("./images/jesus3.jpg")';
    }
}

export = CreditUI;