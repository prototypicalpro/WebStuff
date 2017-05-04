import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { WHSSched } from '../../lib/WHSUtil/WHSSched.ts';
import { CalendarData } from '../../lib/WHSUtil/grabCal.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;

  task: any;
  s1: string;
  s2: string;

  constructor(public navCtrl: NavController, public calData: CalendarData) {
      //this.task = setInterval(() => {
     // this.goToSlide();
     // }, 500);
      let promise = calData.logCalendar();
      promise.subscribe((data) => calData.data = data);

      this.s1 = WHSSched.ADay.getPeriod(3).getName();
      this.s2 = "Hello World!";
  }

  goToSlide(){
    if(this.slides) this.slides.slideNext();
    console.log("Slide Next!");
  }

}
