import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  backgroundSrc: String = 'url("assets/img/background.jpg")';
  dayName: String = 'A';
  periodName: String = '3rd Period';
  timeLeft: String = '45 Minutes Left';

  constructor(public navCtrl: NavController) {

  }

}
