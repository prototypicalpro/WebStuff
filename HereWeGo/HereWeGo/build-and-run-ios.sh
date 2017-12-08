#!/bin/sh

echo "Building..."
cordova build ios

echo Build Finished!
echo Booting Simulator and Installing App!
xcrun simctl boot CD8F73AD-C756-493D-B249-31689350608D
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
xcrun simctl install CD8F73AD-C756-493D-B249-31689350608D ./platforms/ios/build/emulator/WilsonAppAlpha.app
echo "Launching..."
xcrun simctl launch CD8F73AD-C756-493D-B249-31689350608D com.pileofwires.wilsonappalpha