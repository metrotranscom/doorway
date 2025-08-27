import { FargateService, Secret } from "aws-cdk-lib/aws-ecs";

export interface DoorwayLambdaProps {
  environment: string;
  name: string;
  timeoutInMinutes: number;
  handler: string;
  memory?: number;
  storage?: number;
  bundling: {};

  environmentVariables?: { [key: string]: string };

}
export interface DoorwayServiceMonitorLambdaProps {
  secrets: { [key: string]: Secret };
  service: FargateService;
  environment: string

}