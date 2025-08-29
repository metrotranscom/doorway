import { Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
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
      console.log("Processing secret key:", key);
      console.log("Secret ARN:", secret.arn);
      console.log("Secret object:", JSON.stringify(secret, null, 2));
      secretArns.push(secret.arn);
    }
    console.log("All secret ARNs:", secretArns);

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
    dwLambda.lambdaRole.assumeRolePolicy!.addStatements(new PolicyStatement({
      actions: ["sts:AssumeRole"],
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal("events.amazonaws.com")]
    }))
    dwLambda.lambdaFunction.grantInvoke(new ServicePrincipal("events.amazonaws.com"));

    const secretRule = new Rule(scope, `${id}-secret-change-rule`, {
      role: dwLambda.lambdaRole,
      enabled: true,
      description: `Rule to trigger a restart of the ${props.service.serviceName} service when a secret is changed`,
      eventPattern: {
        "source": ["aws.secretsmanager"],
        "detailType": ["AWS API Call via CloudTrail"],
        "detail": {
          "eventSource": ["secretsmanager.amazonaws.com"],
          "eventName": ["PutSecretValue"],
          "requestParameters": {
            "secretId": secretArns.map(arn => ({ "prefix": arn }))
          }
        }
      }
    });
    secretRule.addTarget(new LambdaFunction(dwLambda.lambdaFunction));
  }
}