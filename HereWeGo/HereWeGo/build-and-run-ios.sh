#!/bin/sh
# Name we use to identify our simulator
simName="IOSSim"
# Version of IOS to use on the simulator
# Valid versions can be seen by running "xcrun simctl list" in terminal
IOSVer=com.apple.CoreSimulator.SimRuntime.iOS-10-0 # IOS 10.0
# Device to simulate the app on
# Valid device types are found by running "xcrun simctl list" in terminal
device=com.apple.CoreSimulator.SimDeviceType.iPhone-7 # IPhone 7

echo "Building..."
cordova build ios

echo "Build Finished!"
# Test if simulator already exists by testing "xcrun simctl list"
xcrun simctl list | grep $simName &> /dev/null
if [ $? != 0 ]
then
    echo "Creating new Simulator!"
    xcrun simctl create $simName $device $IOSVer
fi
echo "Booting Simulator and Installing App!"
xcrun simctl boot $simName
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
xcrun simctl install $simName ./platforms/ios/build/emulator/Wilson\ App\ Alpha.app
echo "Launching..."
xcrun simctl launch $simName com.pileofwires.wilsonapp
exit 0