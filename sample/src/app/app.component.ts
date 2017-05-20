import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { Storage } from '@ionic/storage';

import { CalendarData } from '../lib/WHSUtil/CalendarData.service';
import { WHSEventParse } from '../lib/WHSUtil/WHSSched';


@Component({
  templateUrl: 'app.html',
  //providers: [CalendarData]
})
export class MyApp implements OnInit {
  rootPage: any = TabsPage;
  calData: CalendarData;
  eventParse: WHSEventParse;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, cache: Storage, calData: CalendarData, eventParse: WHSEventParse) {
    this.calData = calData;
    this.eventParse = eventParse;
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit(){
    let start, end, start2, end2;
    start = performance.now();
    this.calData.initCalendar().then(() => {
      end = performance.now();
      console.log("Took: " + (end - start));
      start2 = performance.now();
      this.eventParse.filterEvents(this.calData.getTodaysEvents());
      end2 = performance.now();
      console.log("Event parse took: " + (end2 - start2));
      return this.calData.syncCalendar();
    }).then(() => {
      this.eventParse.filterEvents(this.calData.getTodaysEvents());
    });
  }
}