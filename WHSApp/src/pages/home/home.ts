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

  time: String = '1:45pm-3:15pm';
  room: String = 'Room 15';

  constructor(public navCtrl: NavController) {

  }

}
