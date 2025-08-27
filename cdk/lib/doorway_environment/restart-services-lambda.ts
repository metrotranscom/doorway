import { Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
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
      secretArns.push(secret.arn);
    }
    const secretRule = new Rule(scope, `${id}-secret-change-rule`, {
      eventPattern: {
        source: ["aws.secretsmanager"],
        detail: {
          "eventSource": ["secretsmanager.amazonaws.com"],
          "eventName": ["PutSecretValue"],
          "secret-id": secretArns,

        },
      },
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