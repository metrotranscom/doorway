import * as cdk from "aws-cdk-lib"
import { Fn } from "aws-cdk-lib"
import { ISubnet, Subnet } from "aws-cdk-lib/aws-ec2"
import { AppProtocol, Cluster, Compatibility, ContainerImage, FargateService, LogDrivers, NetworkMode, Protocol, TaskDefinition } from "aws-cdk-lib/aws-ecs"
import { DoorwayServiceProps } from "../doorway-props"
import { RestartServicesLambda } from "../utility_lambdas/restart-services-lambda"
//import * as ecs from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

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

    const task = new TaskDefinition(scope, `${id}-task`, {

      compatibility: Compatibility.FARGATE,
      executionRole: props.executionRole,
      taskRole: props.executionRole,
      networkMode: NetworkMode.AWS_VPC,
      cpu: `${props.cpu * 1024}`,
      memoryMiB: `${props.memory}`
    })
    task.addContainer(`${id}-container`, {
      image: ContainerImage.fromRegistry(
        `${cdk.Aws.ACCOUNT_ID}.dkr.ecr.${cdk.Aws.REGION}.amazonaws.com/${props.container}`,
      ),
      cpu: props.cpu,
      memoryLimitMiB: props.memory,
      essential: true,
      logging: LogDrivers.awsLogs({
        streamPrefix: id,
        logGroup: props.logGroup,
      }),
      secrets: props.secrets || {},
      environment: props.environmentVariables,
      entryPoint: [],
      portMappings: [
        {
          name: `${id}-port-mapping`,
          containerPort: props.port,
          protocol: Protocol.TCP,
          appProtocol: AppProtocol.http,
          hostPort: props.port,
        },
      ],
    })


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
