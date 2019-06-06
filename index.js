'use strict';
console.log('Loading function');
const AWS = require('aws-sdk');
const sesClient = new AWS.SES();
const sesConfirmedAddress = "xxxxxxx@gmail.com"; // personal aws confirmed email
const googleRecaptcha = require('google-recaptcha');
const captcha = new googleRecaptcha({
  secret: 'xxxxxx' //Recaptcha v3 secret key
});

/**
 * Lambda to process HTTP POST for contact form with the following body
 * {
      "email": <contact-email>,
      "subject": <contact-subject>,
      "message": <contact-message>,
      "captca": <token>
    }
 *
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    var params = getEmailMessage(event);
    
    captcha.verify({response: event.captchaToken}, (error) => {
        if (error) {
            callback(error);
        }
        var sendEmailPromise = sesClient.sendEmail(params).promise();
        var response = {
            statusCode: 200
        };
        
        sendEmailPromise.then(function(result) {
            console.log(result);
            callback(null, response);
        }).catch(function(err) {
            console.log(err);
            response.statusCode = 500;
            callback(null, response);
        });
    })
};

function getEmailMessage (emailObj) {
    var emailRequestParams = {
        Destination: {
          ToAddresses: [ sesConfirmedAddress ]  
        },
        Message: {
            Body: {
                Text: {
                    Data: emailObj.message
                }
            },
            Subject: {
                Data: emailObj.subject
            }
        },
        Source: 'no-reply@xxxx.com', //AWS registered domain email
        ReplyToAddresses: [ emailObj.email ]
    };
    
    return emailRequestParams;
}