import { ISecurityGroup } from "aws-cdk-lib/aws-ec2"
import { FargateService, Secret } from "aws-cdk-lib/aws-ecs"
import { Role } from "aws-cdk-lib/aws-iam"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { IBucket } from "aws-cdk-lib/aws-s3"

export interface DoorwayProps {
  environment: string,
  logGroup: LogGroup
  serviceConnectLogGroup: LogGroup
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

}
export interface DoorwayLoadBalancerProps extends DoorwayProps {
  publicService: FargateService,
  partnersService: FargateService,
}
