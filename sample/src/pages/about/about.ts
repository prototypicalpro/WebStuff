import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { URLUtil } from '../../lib/URLUtil.service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  tab: URLUtil;

  constructor(public navCtrl: NavController, private opener: URLUtil) {
    this.tab = opener;
  }
}
