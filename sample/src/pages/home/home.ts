import { Component, ViewChild, OnInit, trigger, state, animate, transition, style  } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { WHSSched, WHSEventParse } from '../../lib/WHSUtil/WHSSched';
import { CalendarData } from '../../lib/WHSUtil/CalendarData.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('hidden', [
      state('hidden', style({
        transform: 'translateY(-100%)'
      })),
      state('shown',  style({
        transform: 'translateY(0)'
        //sir, I desire a staircase
      })),
      transition('hidden <=> shown', animate('300ms ease-out'))
    ]),
    trigger('fade', [
      state('hidden', style({
        opacity: 0
      })),
      state('shown',  style({
        opacity: 1
        //sir, I desire a staircase
      })),
      transition('hidden <=> shown', animate('300ms 300ms'))
    ]),
  ]
})
export class HomePage {
  //@ViewChild(Slides) slides: Slides;

  calData: CalendarData;
  eventThingy: WHSEventParse;
  s1: string;
  s2: string;
  events: Array<any>;
  imgURL: string;
  isHidden: string = 'hidden';
  navHide: boolean = true;

  constructor(public navCtrl: NavController, public calDataThing: CalendarData, eventList: WHSEventParse) {
      this.calData = calDataThing;
      this.eventThingy = eventList;

      this.calData.onInitFinish().then(() => {
        let sched = this.eventThingy.getSchedule();
        if(sched != undefined) this.s1 = sched.getShowName();
        else this.s1 = 'No School Today';
      });

      this.s2 = "Hello World!";

      if(Math.random() > 0.5) this.imgURL = "https://upload.wikimedia.org/wikipedia/commons/0/01/Crater_Lake_winter_pano2.jpg";
      else this.imgURL = "http://media.oregonlive.com/trending/photo/2017/02/08/crater-lake-attendance-8622cbadf7945e4e.jpg";
  }

  ionViewDidEnter(){
    this.isHidden = 'shown';
    
  }

  syncCal(){
    this.calData.syncCalendar().then(() => this.eventThingy.filterEvents(this.calData.getTodaysEvents())).then(() => {
      let sched = this.eventThingy.getSchedule();
      if(sched != undefined) this.s1 = sched.getShowName();
      else this.s1 = 'No School Today';
    });
    this.navHide = !this.navHide;
  }

  clearCache(){
    this.calData.clearCache();
  }

}
