import { Duration, Size } from 'aws-cdk-lib';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

import { DoorwayLambdaProps } from './doorway-lambda-props';

export class DoorwayLambdaBaseClass extends Construct {
  lambdaFunction: Function;
  lambdaRole: Role;
  constructor(scope: Construct, id: string, props: DoorwayLambdaProps) {
    super(scope, id);
    const environment = props.environment;

    this.lambdaRole = new Role(this, `${props.name}-${environment}`, {
      roleName: `${props.name}-${environment}`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    this.lambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    this.lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: ['ec2:*'],
        effect: Effect.ALLOW,
        resources: ['*'],
      })
    );
    this.lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        effect: Effect.ALLOW,
        resources: ['*'],
      })
    );


    this.lambdaFunction = new NodejsFunction(this, 'function', {
      runtime: Runtime.NODEJS_LATEST,
      role: this.lambdaRole,
      handler: 'handler',
      entry: props.handler,
      timeout: Duration.minutes(props.timeoutInMinutes),
      environment: props.environmentVariables,
      bundling: props.bundling,
      memorySize: props.memory == undefined ? 128 : props.memory,
      ephemeralStorageSize: Size.mebibytes(props.storage == undefined ? 512 : props.storage),
      functionName: `${props.name}-${environment}`,
      description: `${props.name}-${environment}`,
    });
    const dwSecret = Secret.fromSecretNameV2(
      this,
      `DWSecret-${environment}`,
      `doorway-lambdas-svcaccount/${environment}`
    );
    dwSecret.grantRead(this.lambdaRole);
    this.lambdaRole.addToPrincipalPolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        effect: Effect.ALLOW,
        resources: [dwSecret.secretArn],
      })
    );
  }
}
