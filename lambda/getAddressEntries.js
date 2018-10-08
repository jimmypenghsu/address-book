const AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-2'});
const documentClient = new AWS.DynamoDB.DocumentClient();

const filterType = {
  SUBURB: 'suburb',
  POSTCODE: 'postcode'
};

exports.handler = async (event, context, callback) => {

  const dbQueryParams = {
    TableName: 'address-book',
    Key: {username: event.pathParameters.username}
  };

  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  };

  try {

    const data = await documentClient.get(dbQueryParams).promise();

    let addressEntries = [];

    if (data.Item && data.Item.addressEntries) {

      addressEntries = data.Item.addressEntries;

      // do some filtering if query params exists from request
      const httpQueryParams = event.queryStringParameters;
      if (httpQueryParams) {
        if (httpQueryParams.suburb) {
          addressEntries = filter(addressEntries, filterType.SUBURB, httpQueryParams.suburb);
        }
        if (httpQueryParams.postcode) {
          addressEntries = filter(addressEntries, filterType.POSTCODE, httpQueryParams.postcode);
        }
      }

    }

    response.statusCode = 200;
    response.body = JSON.stringify({
      result: 'Address query successful',
      entries: addressEntries
    });

    callback(null, response);

  } catch (e) {

    response.statusCode = 502;
    response.body = JSON.stringify({
      result: 'Oops.. something went wrong',
    });

    callback(null, response);

  }

};

const filter = (addressEntries, field, value) => {
  if (!value) return addressEntries;
  return addressEntries.filter(entry => entry[field].toUpperCase() === value.toUpperCase());
};
