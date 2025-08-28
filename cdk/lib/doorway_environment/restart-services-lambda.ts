import { Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as secretmgr from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { DoorwayServiceMonitorLambdaProps } from "./doorway-lambda-props";
import { DoorwayLambdaBaseClass } from "./lambda-base-class";

export interface ServiceRestartDetail {
  eventSource: string;
  eventName: string;
  requestParameters: {
    secretId: string;
    clientRequestToken: string;
  };
  responseElements: null;
}

/** this lambda will restart an ecs service whenever the secrets change for that service. This allows the environment variables running in the containers to get the new values.  */
export class RestartServicesLambda {
  constructor(scope: Construct, id: string, props: DoorwayServiceMonitorLambdaProps) {



    let secretArns: string[] = [];

    for (const [key, secret] of Object.entries(props.secrets)) {
      console.log("Processing secret: ", key, secret);
      // The service setup uses the secret definition from ECS. unfortunately it doesn't include the secret name, so we have to re-create the secret from the arn to get the name.
      const secretArn = secretmgr.Secret.fromSecretPartialArn(scope, `${id}-secret-${key}`, secret.arn).secretArn;
      secretArns.push(secretArn);
    }
    const secretRule = new Rule(scope, `${id}-secret-change-rule`, {
      enabled: true,
      description: `Rule to trigger a restart of the ${props.service.serviceName} service when a secret is changed`,
      eventPattern: {
        "source": ["aws.secretsmanager"],
        "detailType": ["AWS API Call via CloudTrail"],
        "detail": {
          "eventSource": ["secretsmanager.amazonaws.com"],
          "eventName": ["PutSecretValue"],
          "requestParameters": {
            "secretId": secretArns
          }
        }
      }
    });
    const dwLambda = new DoorwayLambdaBaseClass(scope, `${id}-restart-lambda`, {
      name: `${id}-function`,
      environment: props.environment,
      environmentVariables: {
        SERVICE_NAME: props.service.serviceName,
        CLUSTER_NAME: props.service.cluster.clusterName,
      },
      timeoutInMinutes: 15,
      memory: 1024,
      storage: 512,
      handler: "lib/doorway_environment/restart-services.handler.ts",
      bundling: {}
    })
    dwLambda.lambdaRole.addToPolicy(new PolicyStatement({
      actions: ["ecs:UpdateService", "ecs:DescribeServices"],
      resources: [props.service.serviceArn],
      effect: Effect.ALLOW,
    }));
    secretRule.addTarget(new LambdaFunction(dwLambda.lambdaFunction));
  }
}