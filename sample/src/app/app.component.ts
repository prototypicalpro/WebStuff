import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { Storage } from '@ionic/storage';

import { CalendarData } from '../lib/WHSUtil/CalendarData.service';


@Component({
  templateUrl: 'app.html',
  //providers: [CalendarData]
})
export class MyApp implements OnInit {
  rootPage: any = TabsPage;
  calData: CalendarData;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, cache: Storage, calData: CalendarData) {
    this.calData = calData;
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit(){
    let start, end;
    start = performance.now();
    this.calData.initCalendar().then(() => {
      end = performance.now();
      console.log("Took: " + (end - start));
    });
  }
}