#!/bin/sh
# Name we use to identify our simulator
simName="IOSSim"
#simName="IOSPhatPad"
# Version of IOS to use on the simulator
# Valid versions can be seen by running "xcrun simctl list" in terminal
IOSVer=com.apple.CoreSimulator.SimRuntime.iOS-10-0 # IOS 10.0
# Device to simulate the app on
# Valid device types are found by running "xcrun simctl list" in terminal
device=com.apple.CoreSimulator.SimDeviceType.iPhone-7 # IPhone 7
#device=com.apple.CoreSimulator.SimDeviceType.iPad-Pro--12-9-inch---2nd-generation- # IPad Pro 2nd Gen

echo "Building..."
cordova build ios

echo "Build Finished!"
# Test id "ios-simulator" package is installed
type ios-simulator >/dev/null 2>&1 || { echo "Fetching required dependencies!"; sudo npm i -g ios-simulator; }
# Test if simulator already exists
if ! [[ $(ios-simulator -n "$simName") ]]
then
    echo "Creating new Simulator!"
    xcrun simctl create $simName $device $IOSVer
fi
# Get its ID
simUID=$(ios-simulator -n "$simName")
echo "Sim UID: " $simUID
echo "Booting Simulator and Installing App!"
xcrun simctl boot $simUID
open -a Simulator --args -CurrentDeviceUDID $simUID
xcrun simctl install $simUID ./platforms/ios/build/emulator/Wilson\ App.app
echo "Launching..."
xcrun simctl launch $simUID org.wilsoncs.wilsonapp
exit 0