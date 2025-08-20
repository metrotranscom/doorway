import * as cdk from "aws-cdk-lib"
import { Fn } from "aws-cdk-lib"
import { ISecurityGroup, ISubnet, IVpc, Subnet } from "aws-cdk-lib/aws-ec2"
//import * as ecs from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Bucket, IBucket } from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"

import { DoorwayServiceProps } from "./doorway-service-props"

export abstract class DoorwayService {
  protected executionRole: Role
  protected privateSG: ISecurityGroup
  protected publicSG: ISecurityGroup
  protected vpc: IVpc
  protected appsubnets: ISubnet[] = []
  protected publicSubnets: ISubnet[] = []
  protected publicUploads: IBucket
  protected secureUploads: IBucket

  constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    // Initial Execution Role Setup
    // Create the execution role for the doorway API service
    this.executionRole = new Role(scope, "executionRole", {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })
    this.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy")
    )
    this.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMReadOnlyAccess")
    )
    this.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSReadOnlyAccess")
    )
    this.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly")
    )
    // Get Network setup
    const vpcId = cdk.Fn.importValue(`doorway-vpc-id-${props.environment}`)
    const azs = cdk.Fn.importValue(`doorway-azs-${props.environment}`).split(",")
    this.vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(scope, "vpc", {
      vpcId: vpcId,
      availabilityZones: azs,
    })
    // Get the subnets
    const appSubnetIds: string[] = []
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-1-${props.environment}`))
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-2-${props.environment}`))
    appSubnetIds.forEach((id) => {
      this.appsubnets.push(Subnet.fromSubnetId(scope, id, id))
    })
    const appTierPrivateSGId = cdk.Fn.importValue(`doorway-app-sg-${props.environment}`)
    this.privateSG = cdk.aws_ec2.SecurityGroup.fromSecurityGroupId(
      scope,
      "appTierPrivateSG",
      appTierPrivateSGId
    )

    //Uploads Buckets
    this.publicUploads = Bucket.fromBucketArn(
      scope,
      `publicUploadsBucket`,
      Fn.importValue(`doorway-public-uploads-${props.environment}`)
    )
    this.secureUploads = Bucket.fromBucketArn(
      scope,
      `secureUploadsBucket`,
      Fn.importValue(`doorway-secure-uploads-${props.environment}`)
    )
  }
}
