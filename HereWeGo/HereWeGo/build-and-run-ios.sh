#!/bin/sh

echo "Building..."
cordova build ios

echo Build Finished!
echo Booting Simulator and Installing App!
xcrun simctl boot E283519E-C91E-4322-A017-F30C9B4234AD
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
xcrun simctl install E283519E-C91E-4322-A017-F30C9B4234AD ./platforms/ios/build/emulator/Wilson\ App\ Alpha.app
echo "Launching..."
xcrun simctl launch E283519E-C91E-4322-A017-F30C9B4234AD com.pileofwires.wilsonappalpha
exit 0