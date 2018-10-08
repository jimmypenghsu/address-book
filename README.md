# The Address Book application
If for some reason you couldn't get the solution to run, please get in touch with me or use the live instance at: https://s3-ap-southeast-2.amazonaws.com/the-static-bucket/address-book.html

Please note that the main focus of the solution is on integration, so you may find many things that are out of the ordinary, such as the demo page combines HTML and JS logic, and CloudFormation script not being parameterize etc...

### Features
* Address entries can be stored against a user (username).
* There is auto-complete on the address field to ensure data consistency, but the API also checks for model schema.
* Address entries can be retrieved for a given username, and further more be filtered by postcode or suburb.
* API is secured by generated API Key.
 
### Overview
The CloudFormation template will create most of the resources for you, make sure your account have the appropriate access and region is set to `ap-southeast-2`. On the high level these are the resources that would be created:

![Image of CF resources](https://s3-ap-southeast-2.amazonaws.com/the-static-bucket/cf-visual.png)

* REST API (OpenAPI spec embedded)
* DynamoDB table
* Two Lambda functions, one for retrieval and another for storing address entries
* Appropriate roles and permissions
* API dev stage deployment and configuration of Usage Plan with API Key

You can think of the base endpoint as serving _address entry bundles_ with the `username` being the ID, so the two methods looks like:

GET: `https://pb7yelzq48.execute-api.ap-southeast-2.amazonaws.com/dev/{username}` <br>
Query strings: postcode, suburb

POST: `https://pb7yelzq48.execute-api.ap-southeast-2.amazonaws.com/dev/{username}` <br>
Data schema, example:
```javascript
{
    "addressEntry": {
      "state": "VIC",
      "suburb": "RINGWOOD EAST",
      "postcode": "3134",
      "addressLine1": "Unit 1519",
      "addressLine2": "200 Rosedale Cres"
    }
}
````
You will be able to see these in action on the demo page with the development console.

### Deployment
1. Navigate to the CloudFormation console and create a new stack named `address-book-stack` with the template specified in `address-book-stack-v1.json`. Use all default param values. Note: the code for the Lambda functions are stored on my public S3 bucket which will be downloaded when you create the new stack, but there is also a copy in source control.
2. Once done, you should see several resources under the new stack. Click into `ID=apiGateway`.
3. Under Stages, you should find a `dev` stage has been created with an endpoint, this is the endpoint you will use, either from the demo page `address-book.html` or any API testing tool of your choice, e.g. Postman.
4. Under API Keys, you should find a key named `mykey`, this is required for both the GET and POST requests, it should be included in the HTTP request header, e.g. `x-api-key: 31aOxiDzlC1uJohxZVYzhaVfTesPOpY41Vq23yCS`.
5. If you wish to deploy your own demo page, just upload `address-book.html` to a public S3 bucket. Note that this is important as it is integrated with a 3rd party address validation service that checks for request origin.
