# Doorway App CDK Project

This project uses [CDK](https://aws.amazon.com/cdk/) to deploy the ECS tasks and services to AWS. This presumes that you have already deployed [doorway-infra](https://github.com/metrotranscom/doorway-infra) to the environment.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

# Necessary workstation setup

You will need the following things set up before you work with the code in this repo:

- A Typescript IDE like VS Code.
- NodeJS - currently version 22 - I reccomend using [NVM](https://github.com/nvm-sh/nvm).
- The [AWS CLI](https://aws.amazon.com/cli/).
- The [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html)
- [Yarn](https://yarnpkg.com/)

## Useful commands

- `yarn test` Perform the jest unit tests.
- `cdk synth` emits the synthesized CloudFormation template. This is also good to use on your local
  workstation to make sure your CDK code hangs together. **This doesn't touch the actual AWS
  infrastructure.**
- `cdk deploy DoorwayBuildPipelineStack` This deploys the Doorway application delivery pipeline. **This impacts AWS and will only work if you have the proper access and have configured your AWS credentials file.**
- `cdk deploy  DoorwayAppEnvironmentStack` This deploys a Doorway application. You will likely need to be an AWS admin to run this. You will also need to set an an environment variable named ENVIRONMENT. and a ".env" file named [$ENVIRONMENT].env for the scriot to load. **This impacts AWS and will only work if you have the proper access and have configured your AWS credentials file.**
- `cdk diff` compare deployed stack with current state

