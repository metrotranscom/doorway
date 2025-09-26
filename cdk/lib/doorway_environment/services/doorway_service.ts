import * as cdk from "aws-cdk-lib"
import { Fn } from "aws-cdk-lib"
import { ISubnet, Subnet } from "aws-cdk-lib/aws-ec2"
import { Cluster, FargateService } from "aws-cdk-lib/aws-ecs"
//import * as ecs from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

import { DoorwayServiceProps } from "../doorway-props"
import { RestartServicesLambda } from "../utility_lambdas/restart-services-lambda"
import { DoorwayEcsTask } from "./doorway-ecs-task"

/**
 * @class
 * Base Class for Doorway Services (API, Public, Partners, etc)
 * This really shouldn't change all that much. Most configuration settings are in the classes that use this.
 * @see DoorwayBackendService
 * @see DoorwayPublicSite
 * @see DoorwayPartnersSite
 * @see DoorwayImportListings
 */
export class DoorwayService {
  public service: FargateService

  constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    // Initial Execution Role Setup
    // Create the execution role for the doorway API service
    props.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
    )
    props.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMReadOnlyAccess"),
    )
    props.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSReadOnlyAccess"),
    )
    props.executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
    )

    // Get the subnets
    const appSubnetIds: string[] = []
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-1-${props.environment}`))
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-2-${props.environment}`))
    const appsubnets: ISubnet[] = []
    appSubnetIds.forEach((id) => {
      appsubnets.push(Subnet.fromSubnetId(scope, id, id))
    })

    // Set up the ECS Task
    const task = new DoorwayEcsTask(scope, id, props).task
    // Set up the fargate service
    this.service = new FargateService(scope, `${id}-fargate-service`, {
      taskDefinition: task,
      serviceName: props.serviceName,
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
      cluster: Cluster.fromClusterAttributes(scope, `ecsCluster-${id}`, {
        clusterName: Fn.importValue(`doorway-ecs-cluster-${props.environment}`),
        vpc: props.vpc,
      }),
      vpcSubnets: {
        subnets: appsubnets,
      },
      securityGroups: [props.securityGroup],
      desiredCount: props.instances,
    })
    // If the service has secrets associated with it,
    // create a lambda to restart the service when the secrets are updated
    const secrets = Object.keys(props.secrets)
    if (Object.keys(props.secrets).length > 0) {
      new RestartServicesLambda(scope, `restart-${id}-${props.environment}`, {
        service: this.service,
        secrets: props.secrets,
        environment: props.environment,
      })
    }
    props.logGroup.grantWrite(props.executionRole)
    this.service.autoScaleTaskCount({
      minCapacity: 3,
      maxCapacity: 10,

    }).scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    })


  }

}
