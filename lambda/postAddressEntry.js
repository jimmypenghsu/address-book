const AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-2'});
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

  const addressEntry = JSON.parse(event.body).addressEntry;

  // unfortunately dynamodb does not support empty strings, this is sort of a hack
  for (const key of Object.keys(addressEntry)) {
    if (addressEntry[key] === '') {
      addressEntry[key] = 'nil'
    }
  }

  // store or append address entry to username as required
  const dbUpdateParams = {
    TableName: 'address-book',
    Key: { username: event.pathParameters.username },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #addressEntries = list_append(if_not_exists(#addressEntries, :empty_list), :addressEntry)',
    ExpressionAttributeNames: {
      '#addressEntries': 'addressEntries'
    },
    ExpressionAttributeValues: {
      ':addressEntry': [addressEntry],
      ':empty_list': []
    }
  };

  documentClient.update(dbUpdateParams, function (err, data) {
    
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

      const response = {
        "statusCode": 200,
        "headers" : {
          "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify({ result: 'Address stored' })
      };

      console.log(`request success with params: ${JSON.stringify(event)}`);
      callback(null, response);
    }
    
  });


};