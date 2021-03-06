# add-custom-resouce

This is a library meant to be used in a Serverless plugin, when you need to add a custom resource. This allows you to execute arbitrary code within CloudFormation as part of deployment, allowing you do things like call the aws-sdk in cases where CloudFormation does not support the feature you need to deploy/configure.

## Usage

> my-plugin.js

```js
const addCustomResource = require('add-custom-resource');

class MyPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      'before:package': () => this.doStuff()
    };
  }

  doStuff() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    addCustomResource(template, {
      name: 'MyResource',
      sourceCodePath: path.join(__dirname, 'my-source-code.js')
    });
  }
}
```

This will add four resources to your CloudFormation template:

- A `Lambda::Function` (with `my-source-code.js` inlined)
- An `IAM::Role` (for the Lambda functions permissions)
- A `Logs::LogGroup` (for any logs related to the Lambda function running)
- A `Custom::` resource (which is backed by your Lambda function)

You source code can use the aws-sdk and the cf-response library, which are built in to Lambda. Other dependencies are not supported.

> my-source-code.js

```js
const aws = require('aws-sdk');
const response = require('cfn-response');

const s3 = new aws.S3();

module.exports.handler = function(event, context) {
  Promise.resolve()
   .then(() => {
     switch (event.RequestType) {
       case 'Create':
       case 'Update':
        return s3.doSomething().promise();
      case 'Delete':
        return s3.doSomethingElse().promise();
      default:
        return Promise.resolve('no action matched');
      }
   })
   .then(() => {
     response.send(event, context, response.SUCCESS, {});
   })
   .catch(() => {
     response.send(event, context, response.FAILED, {});
   });
};
```
