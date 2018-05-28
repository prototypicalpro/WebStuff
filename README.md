# TroGo (Wilson App Alpha)

[Slideshow Project Overview](https://drive.google.com/open?id=1aMAVzhKJyau7Vcu4zmMJIr0zfJ9p8sFoSFUgTzjiidc)

Welcome to the Wilson App github repository! This app is coded using a typescript cordova project in visual studio.

## Developing For The Wilson App
### Setting Up Your Environment

This tutorial assumes you have a basic understanding of [Git](https://git-scm.com/), [Typescript](https://www.typescriptlang.org/), and that you are using Visual Studio Code as your IDE.
1. Install programs: [Visual Studio Code](https://code.visualstudio.com/), [Node.JS (Current)](https://nodejs.org/en/), [JDK (x64)](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html), [Android Studio](https://developer.android.com/studio/). If you would like to develop for iOS, you also must install [Xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12) and [Xcode Command Line Tools](http://railsapps.github.io/xcode-command-line-tools.html) (You must own a Mac to develop for iOS).
2. Install JS dependencies: In an administrator command window, run `npm i -g cordova typedoc ios-simulator` (use `sudo` for OSX).
3. Setup Android: Follow [this tutorial](https://cordova.apache.org/docs/en/latest/guide/platforms/android/#installing-the-requirements) to the end of "Installing the Requirements". As of writing the targeted Android version is 4.4 (API level 19).
4. Clone this repository and open `HereWeGo/Wilson App.code-workspace` using VSCode. Install all recommended extensions for the workspace (can be found in the extensions window by searching "@recommended" and looking under "Workspace Recommendations" if the workspace is open).
5. Using the terminal in VSCode, run `npm update`, `cordova platform add android`, and `cordova platform add ios`.

### Simulating In Browser

1. To start the Typescript build, press `Ctrl+Shift+B` (`Command+Shift+B` on OSX). 
2. In the VSCode debug menu, select "Simulate iOS in browser" and hit run. 
3. In the browser, you will need to install a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) disabler extension. [I use this one for Chrome](https://chrome.google.com/webstore/detail/cors-toggle/jioikioepegflmdnbocfhgmpmopmjkim?hl=en-US). Install an extension and ensure it is enabled.
4. Refresh the page, and open the developer tools (`Ctrl+Shift+I` for Chrome on windows). Enable the Mobile Screen size tool (`Ctrl+Shift+M` for Chrome on Windows), and resize to a desired device (I use Samsung Galaxy S5).
5. You can now make changes to any files in the project, and the webpage will automatically update to reflect those changes. Note: Changes made to files located in `HereWeGo/www/scripts` will not persist, as these are automatically overwritten by Typescript. Any script editing should be done in the `.ts` or `.js` files in `HereWeGo/scripts`.

### Running On Android Device

TODO

### Running On iOS Simulator

TODO

### Running On iOS Device 

# Screenshots

TODO