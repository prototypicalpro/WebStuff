import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { URLUtil } from '../../lib/URLUtil.service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  tab: URLUtil;
  themePick: string;

  constructor(public navCtrl: NavController, private opener: URLUtil) {
    this.tab = opener;
    this.themePick = 'this-theme';
  }

  toggleTheme(){
    if(this.themePick == 'this-theme') this.themePick = 'that-theme';
    else this.themePick = 'this-theme';
  }
}
