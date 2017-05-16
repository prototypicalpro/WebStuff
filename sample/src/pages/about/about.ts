import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BrowserTab } from '@ionic-native/browser-tab';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  tab: BrowserTab;

  constructor(public navCtrl: NavController, private browserTab: BrowserTab) {
    this.tab = browserTab;
  }

  openURL(){
    this.tab.openUrl("https://developers.google.com/google-apps/calendar/v3/reference/events/list");
  }
}
