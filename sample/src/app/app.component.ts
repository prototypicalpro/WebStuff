import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { Storage } from '@ionic/storage';

import { CalendarData } from '../lib/WHSUtil/CalendarData.service';


@Component({
  templateUrl: 'app.html',
  providers: [CalendarData]
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, cache: Storage, calData: CalendarData) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      calData.initCalendar().then(() => splashScreen.hide());
    });
  }
}