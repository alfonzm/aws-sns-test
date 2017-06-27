var AWS = require('aws-sdk');
var _ = require('lodash');
var Config = require('./config');

AWS.config.update({
  accessKeyId: Config.AWS_ACCESS_KEY,
  secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
  region: Config.AWS_REGION
});

var sns = new AWS.SNS();



// PlatformApplication ARNs for iOS and Android
// (static values generated in AWS web console)
var IOS_ARN = Config.IOS_PLATFORM_APPLICATION_ARN;
var ANDROID_ARN = Config.ANDROID_PLATFORM_APPLICATION_ARN;

// Recipients: send the notification to these devices (edit Config.js)
var recipients = Config.recipientDevices;



// Send push notif to all recipient Tokens
_.forEach(recipients, function(device){
  // Get an endpoint using the device token and platform application ARN
  var endpointParams = {
    PlatformApplicationArn: (device.type === 'ios') ? IOS_ARN : ANDROID_ARN,
    Token: device.token,
    CustomUserData: device.username // optional
  };

  // Get Endpoints for the device token
  // If the device token already has an endpoint, the existing endpoint is returned
  // If the device token doesn't have an endpoint, a new endpoint will be created
  sns.createPlatformEndpoint(endpointParams, function(err, res) {
    if (err) {
      console.log('Create platform endpoint error:');
      console.log(err.stack);
      return;
    }

    // The endpoint ARN of the device
    var endpointArn = res.EndpointArn;

    var notificationMessage = 'Hello from Huber!'
    var payload = {
      default: notificationMessage, // 'default' is required

      // Apple Push Notif System (iOS)
      APNS: {
        aps: {
          alert: notificationMessage,
          sound: 'default',
          badge: 1
        }
      },
      // Google Cloud Messaging (Android)
      GCM: {
        data: {
          message: notificationMessage,
          sound: 1
        }
      }
    };

    // Stringify the payload
    payload.APNS = JSON.stringify(payload.APNS);
    payload.GCM = JSON.stringify(payload.GCM);
    payload = JSON.stringify(payload);

    console.log('Sending push notification to ' + device.type);

    // Publish the push notification to the endpoint
    sns.publish({
      Message: payload,
      MessageStructure: 'json',
      TargetArn: endpointArn
    }, function(err, res) {
      if (err) {
        console.log('Error publishing:');
        console.log(err.stack);
        return;
      }

      console.log('Push sent to ' + device.type);
      console.log(res);
    });
  });
})