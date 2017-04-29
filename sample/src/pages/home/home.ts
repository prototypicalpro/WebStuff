import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;

  task: any;

  constructor(public navCtrl: NavController) {
      this.task = setInterval(() => {
      this.goToSlide();
      }, 500);
  }

  goToSlide(){
    if(this.slides) this.slides.slideNext();
    console.log("Slide Next!");
  }

}
