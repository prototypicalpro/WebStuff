/**
 * Popup to display credits to all the people who helped create this wonderful project
 * And the ones who didn't too (hi Benjamin)
 */

import UIUtil = require('./UIUtil');
import IScroll = require('../iscroll-lite');

class CreditUI extends UIUtil.UIItem {
    private readonly template: string = `
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
                    <p class="benjamin"> 
                        Idea: Nico Machinski <br>
                        Development: Noah Koontz <br>
                        Design: Sam Lewis <br>
                        Marketing: Elliot Chimenti <br>
                        Photography by Kitrick Miller <br> 
                        Additional Background Photos by: <br> 
                        Thomas Lemione <br> 
                        Benjamin Carlton <br> 
                        Mateo Minato <br> 
                        Christopher Schuring <br> 
                        Eleanor Solomon <br>
                        <br>
                        Special Thanks: <br>
                        Wilson Peer Counselling <br>
                        Wilson Leadership <br>
                    </p>
                    <a class="benjamin" id="flk">Flickr</a>
                    <p class="benjamin"> <br> To my alpha testers: <br> Thank you for the support!</p>
                </div>
            </div>
        </div>`;

    onInit(): string {
        return this.template;
    }

    buildJS() {
        new IScroll(document.querySelector('#credScroll'));
        //I have no idea what you're talking about, I've never seen this before
        let hmmm = document.querySelector('#hmmm') as HTMLElement;
        if(Math.random() > 0.5) hmmm.style.backgroundImage = 'url("./images/jesus.jpg")';
        else hmmm.style.backgroundImage = 'url("./images/jesus2.png")';
    }
}

export = CreditUI;