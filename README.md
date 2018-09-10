# TroGo (Wilson App Alpha)

[Slideshow Project Overview](https://drive.google.com/open?id=1aMAVzhKJyau7Vcu4zmMJIr0zfJ9p8sFoSFUgTzjiidc)

Welcome to the Wilson App github repository! This app is coded using a typescript cordova project in visual studio.

## Developing For the Wilson App
### Setting Up Your Environment

This tutorial assumes you have a basic understanding of [Git](https://git-scm.com/), [Typescript](https://www.typescriptlang.org/), and that you are using Visual Studio Code as your IDE.
1. Install programs: [Visual Studio Code](https://code.visualstudio.com/), [Node.JS (Current)](https://nodejs.org/en/), [JDK (x64)](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html), [Android Studio](https://developer.android.com/studio/). If you would like to develop for iOS, you also must install [Xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12) and [Xcode Command Line Tools](http://railsapps.github.io/xcode-command-line-tools.html) (You must own a Mac to develop for iOS).
2. (OSX Only) Set up npm globally: https://github.com/glenpike/npm-g_nosudo/blob/master/npm-g-nosudo.sh
3. Install JS dependencies: In an administrator command window, run `npm i -g cordova typescript typedoc`.
4. (OSX Only) Install more JS dependencies: In an administrator command window, run `npm i -g --unsafe-perm=true ios-simulator ios-deploy`.
5. Setup Android: Follow [this tutorial](https://cordova.apache.org/docs/en/latest/guide/platforms/android/#installing-the-requirements) to the end of "Installing the Requirements". As of writing the targeted Android version is 4.4 (API level 19).
6. Clone this repository and open `HereWeGo/Wilson App.code-workspace` using VSCode. Install all recommended extensions for the workspace (can be found in the extensions window by searching "@recommended" and looking under "Workspace Recommendations" if the workspace is open).
7. Using the terminal in VSCode, run `npm update`, `cordova platform add android`, and `cordova platform add ios`.

### Simulating In Browser

1. To start the Typescript build, press `Ctrl+Shift+B` (`Command+Shift+B` on OSX). 
2. In the VSCode debug menu, select "Simulate iOS in browser" and hit run. 
3. In the browser, you will need to install a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) disabler extension. [I use this one for Chrome](https://chrome.google.com/webstore/detail/cors-toggle/jioikioepegflmdnbocfhgmpmopmjkim?hl=en-US). Install an extension and ensure it is enabled.
4. Refresh the page, and open the developer tools (`Ctrl+Shift+I` for Chrome on windows). Enable the Mobile Screen size tool (`Ctrl+Shift+M` for Chrome on Windows), and resize to a desired device (I use Samsung Galaxy S5).
5. You can now make changes to any files in the project, and the webpage will automatically update to reflect those changes. Note: Changes made to files located in `HereWeGo/www/scripts` will not persist, as these are automatically overwritten by Typescript. Any script editing should be done in the `.ts` or `.js` files in `HereWeGo/scripts`.

### Running On Android Device

1. Use `Ctrl+Shift+B` (`Command+Shift+B` on OSX) to start the Typescript build if you haven't already.
2. Connect an Android phone to your computer and [enable USB debugging](https://www.androidphonesoft.com/resources/enable-usb-debugging-on-android.html) if you haven't already.
3. In the VSCode debug menu, select "Run Android on device" and hit run.
4. Check out [this tutorial](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/) for debugging web apps on Android.
5. Unlike the browser simulation, you will need to reinstall the app every time you change a file to see the changes reflected on the device.

### Running On iOS Simulator

1. Use `Ctrl+Shift+B` (`Command+Shift+B` on OSX) to start the Typescript build if you haven't already.
2. Run `./build-and-run-ios.sh` in the integrated terminal (You may need to `sudo chmod +x ./build-and-run-ios.sh` for the first run). [This script](./HereWeGo/HereWeGo/build-and-run-ios.sh) can be configured to build to different versions and devices, by defualt it is set to an IPhone 7 running IOS 10.
3. Check out [this tutorial](http://adaptivejs.mobify.com/v2.0/docs/debug-on-ios-devices-and-the-ios-simulator/) for debugging a web app in IOS simulator using Safari.
4. Unlike the browser simulation, you will need to reinstall the app every time you change a file to see the changes reflected on the device. To reinstall, simply run `./build-and-run-ios.sh`, and the app will automatically be replaced on the already launched simulator.

### Running On iOS Device 

1. Connect an Apple ID to XCode (XCode->Preferences->Accounts). It can be either your personal account or the WilsonCS account.
2. In VSCode, use `Ctrl+Shift+B` (`Command+Shift+B` on OSX) to start the Typescript build if you haven't already.
3. Run `cordova build ios` in the integrated terminal.
4. Double click on `./HereWeGo/HereWeGo/platforms/ios/Wilson App.xcodeproj` to open the IOS project in XCode.
5. If this is your first build: In Project Editor->General->Signing section, select a personal team in the "Team" drop down menu.
6. Connect your IOS device, and use the device list menu (top left) to select your device. Press the play button to build the app.
7. If the above step throws a "Could not launch error": In your IOS device, navigate to Settings->General->Device Management, tap the email associated with the Apple ID you attached to XCode, and tap "Trust \<your email here\>". Click the play button in XCode one more time to try again.
8. Debugging an IOS device is messy. You can attempt following the [tutorial for Safari debugging an IOS Simulator](http://adaptivejs.mobify.com/v2.0/docs/debug-on-ios-devices-and-the-ios-simulator/) replacing the simulator with the device (I have had mixed results using this method). Or you use a proxy and the Chrome developer tools, as detailed [here](https://medium.com/@auchenberg/hello-remotedebug-ios-webkit-adapter-debug-safari-and-ios-webviews-from-anywhere-2a8553df7465).

### Documentation

[Typedoc](http://typedoc.org/guides/doccomments/) is used to generate web documentation from code comments. You can view the documentation generated [here](./HereWeGo/HereWeGo/docs/index.html). To update the documentation, simply run `typedoc --target ES6 --mode file --out ./docs`, and the documentation will be regenerated.

## Releasing the Wilson App

### Google Play Store

1. You will need to be granted access to the `build.json` and `WilsonCS.keystore` files, and the [WilsonCS Google Play Developer dashboard](https://play.google.com/apps/publish/?account=6167190952551910645#AppDashboardPlace:p=org.wilsoncs.wilsonapp&appid=4975381534210192245). Please speak with Mr. Bartlo or the student managing this project for access to these resources.
2. Place the `build.json` and `WilsonCS.keystore` file at `./HereWeGo/HereWeGo/`
3. Ensure the version in `config.xml` has been increased appropriately to reflect the new release. You may also need to clear the old cached data by modifying [DBManage](./HereWeGo/HereWeGo/scripts/DBLib/DBManage.ts).
4. Run `cordova build android --release` in the integrated terminal.
5. In the [developer console](https://play.google.com/apps/publish/?account=6167190952551910645#AppDashboardPlace:p=org.wilsoncs.wilsonapp&appid=4975381534210192245), navigate to Release Management->App releases, click "MANAGE" next to the "Production" header, then click "CREATE RELEASE".
6. Upload the built APK file in `./HereWeGo/HereWeGo/platforms/android/app/build/outputs/apk/release/app-release.apk` using the "BROWSE FILES" button. The Release name will be filled in automatically when the upload is finished. Write some descriptive and relevant release notes while you wait.
7. Click "REVIEW" and then "START ROLLOUT". The updated version will be released to the play store and installed on devices usually by the next day.

### Apple App Store

*These steps only work on a OSX machine. Warning: Apple makes everything harder than it should be, expect troubleshooting.*

1. You will need to be granted access to the `ios_distribution.cer` an instance of XCode which is connected to the WilsonCS Apple ID. Please speak with Mr. Bartlo or the student managing this project for access to these resources.
2. Ensure the version in `config.xml` has been increased appropriately to reflect the new release. You may also need to clear the old cached data by modifying [DBManage](./HereWeGo/HereWeGo/scripts/DBLib/DBManage.ts).
3. If this is your first time building: Double click on `ios_distribution.cer` and add it to your keychain. In XCode under Project Editor->General->Signing section, select "Christopher Bartlo" in the "Team" drop down menu.
4. In the XCode top menus click Product->Archive.
5. Once the archiving is finished, click "Upload to App Store".
6. TODO: More steps?