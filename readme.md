# AWS SNS

Sample Node.js script to send notification to iOS and Android using AWS SNS SDK.

## AWS SNS Overview

PlatformApplication:
- each platform should have one Platform Application. ex. one for iOS and one for Android.
- PlatformApplications are created in the AWS web console. For Android (GCM), GCM API key is needed. For iOS (APNS), Push SSL certificate (.p12 file) is needed.
- each created PlatformApplication will have a generated ARN, ex:
  - iOS PlatformApplication ARN = arn:aws:sns:ap-northeast-1:012345678910:app/APNS_SANDBOX/MyAppiOS
  - Android PlatformApplication ARN = arn:aws:sns:ap-northeast-1:012345678910:app/GCM/MyAppAndroid

Endpoints:
- each user's device will have one endpoint (ex. one endpoint for User A's iPhone and one endpoint for User B's Android phone, etc.)
- Endpoints are created through AWS SDK by passing the device token and PlatformApplication ARN to `createPlatformEndpoint` function
- SNS push notifications are published to Endpoints using the Endpoints ARN

Pushing a notification:
- to push a notification to a device, use the `sns.publish()` function, passing the following parameters:
  - Message payload - the notif message and the settings for the notif (e.g. badge, sound, etc). See Sample JSON format below
  - TargetArn - the Endpoint of the device

Sample workflow for mobile chat notification:
1. User A login to iOS chat app and taps "Allow notifications". iOS app will send the device token to server and save to DB
2. User B sends message to User A. Server will use `createPlatformEndpoint()` for User A using his device token and iOS Platform Application ARN (already created in the web console), and will return a new Endpoint.
3. SNS can now `publish()` using the Endpoint in #2. User A should receive the notification on his device.
4. User B sends message again to User A. `createPlatformEndpoint()` will return the existing Endpoint in #2 instead of creating a new one.
5. SNS can now `publish()` using the same Endpoint. User A should receive the notification on his device.

## Installation

```
$ cd aws-sns-test
$ npm install
```

## Usage

Edit credentials and settings in Config.js, then run:

```
$ node index.js
```

## Notes

Sample JSON Format for notification payload:

```
{
  default: 'Hello world',
  APNS: {
    aps: {
      alert: 'Hello world',
      sound: 'default',
      badge: 1
    }
  },
  GCM: {
    data: {
      message: 'Hello world',
      sound: 1
    }
  }
}
```