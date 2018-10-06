const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-2' });
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

  const dbQueryParams = {
    TableName: 'address-book',
    Key: { username: event.pathParameters.username }
  };

  documentClient.get(dbQueryParams, function(err, data) {

    if (err) {

      const response = {
        "statusCode": 502,
        "headers" : {
          "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify({ result: 'Oops.. something went wrong' })
      };

      console.log(`request error with params: ${JSON.stringify(event)}`);
      callback(null, response);
    }
    else {

      let addressEntries = [];

      if (data.Item && data.Item.addressEntries) {

        addressEntries = data.Item.addressEntries;

        // do some filtering if query params exists from request
        if (event.queryStringParameters) {
          if (event.queryStringParameters.suburb) {
            addressEntries = addressEntries.filter(entry => entry.suburb.toUpperCase() === event.queryStringParameters.suburb.toUpperCase());
          }
          if (event.queryStringParameters.postcode) {
            addressEntries = addressEntries.filter(entry => entry.postcode === event.queryStringParameters.postcode);
          }
        }

      }

      const response = {
        "statusCode": 200,
        "headers" : {
          "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify({
          result: 'Address query successful',
          entries: addressEntries
        })
      };

      console.log(`request success with path params: ${JSON.stringify(event)}`);
      callback(null, response);
    }

  });

};
