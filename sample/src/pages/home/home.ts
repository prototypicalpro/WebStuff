import { Component, ViewChild, trigger, state, animate, transition, style  } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { WHSSched } from '../../lib/WHSUtil/WHSSched.ts';
import { CalendarData } from '../../lib/WHSUtil/CalendarData.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('hidden', [
      transition(':enter', [
        style({
          position: 'absolute',
          top: "-50%"
        }),
        animate('4000ms 5000ms ease-out', style({
          position: 'relative',
          top: '0'
        }))
      ])
    ])
  ]
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;

  task: any;
  calData: CalendarData;
  s1: string;
  s2: string;
  events: Array<any>;
  imgURL: string;
  hidden: boolean = false;
  hiddenCheck: string = "false";

  constructor(public navCtrl: NavController, public calDataThing: CalendarData) {
      //this.task = setInterval(() => {
     // this.goToSlide();
     // }, 500);
      this.calData = calDataThing;
      //this.calData.logCalendar();

      this.s1 = WHSSched.ADay.getPeriod(3).getName();
      this.s2 = "Hello World!";

      if(Math.random() > 0.5) this.imgURL = "https://upload.wikimedia.org/wikipedia/commons/0/01/Crater_Lake_winter_pano2.jpg";
      else this.imgURL = "http://media.oregonlive.com/trending/photo/2017/02/08/crater-lake-attendance-8622cbadf7945e4e.jpg";
  }

  ngAfterContentInit() {
    this.hidden = true;
    this.hiddenCheck = this.hidden.toString();
  }

  syncCal(){
    this.hidden = !this.hidden;
    this.hiddenCheck = this.hidden.toString();
    console.log(this.hiddenCheck);
    //this.calData.syncCalendar();
  }

  clearCache(){
    this.calData.clearCache();
  }

  goToSlide(){
    if(this.slides) this.slides.slideNext();
    console.log("Slide Next!");
  }

}
