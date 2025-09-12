import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2"
import { FargateService, Secret } from "aws-cdk-lib/aws-ecs"
import { Role } from "aws-cdk-lib/aws-iam"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { IBucket } from "aws-cdk-lib/aws-s3"

export interface DoorwayProps {
  environment: string,
  logGroup: LogGroup
  serviceConnectLogGroup: LogGroup
  clusterName: string
  backendServiceName: string
  publicServiceName: string
  partnersServiceName: string
  vpc: IVpc
}

export interface DoorwayServiceProps extends DoorwayProps {
  memory: number
  cpu: number
  instances: number
  port: number
  secrets: { [key: string]: Secret }
  environmentVariables: { [key: string]: string }
  serviceConnectServer: boolean
  domainName: string
  apiTargetDomainName?: string
  apiTargetPort?: number
  executionRole: Role
  publicUploads: IBucket
  secureUploads: IBucket
  container: string
  securityGroup: ISecurityGroup
  serviceName: string
  clusterName: string
}
export interface DoorwayLoadBalancerProps extends DoorwayProps {
  publicService: FargateService,
  partnersService: FargateService,
}


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