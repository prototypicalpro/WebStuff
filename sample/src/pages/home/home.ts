import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { WHSSched } from '../../lib/WHSUtil/WHSSched.ts';
import { CalendarData } from '../../lib/WHSUtil/CalendarData.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;

  task: any;
  calData: CalendarData;
  s1: string;
  s2: string;
  events: Array<any>;

  constructor(public navCtrl: NavController, public calDataThing: CalendarData) {
      //this.task = setInterval(() => {
     // this.goToSlide();
     // }, 500);
      this.calData = calDataThing;
      //this.calData.logCalendar();

      this.s1 = WHSSched.ADay.getPeriod(3).getName();
      this.s2 = "Hello World!";
  }

  syncCal(){
    this.calData.syncCalendar().then(() => {
      this.events = this.calData.getCachedTodayEvents();
      console.log(this.events);
    });
  }

  clearCache(){
    this.calData.clearCache();
  }

  goToSlide(){
    if(this.slides) this.slides.slideNext();
    console.log("Slide Next!");
  }

}
