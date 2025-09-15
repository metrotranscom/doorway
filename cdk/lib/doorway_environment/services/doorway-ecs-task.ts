import { Aws } from "aws-cdk-lib";
import { AppProtocol, Compatibility, ContainerImage, LogDrivers, NetworkMode, Protocol, TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

import { DoorwayServiceProps } from "../doorway-props";

export class DoorwayEcsTask {
  public task: TaskDefinition
  constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    this.task = new TaskDefinition(scope, `${id}-task`, {

      compatibility: Compatibility.FARGATE,
      executionRole: props.executionRole,
      taskRole: props.executionRole,
      networkMode: NetworkMode.AWS_VPC,
      cpu: `${props.cpu * 1024}`,
      memoryMiB: `${props.memory}`

    })
    this.task.addContainer(`${id}-container`, {
      image: ContainerImage.fromRegistry(
        `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${props.container}`,
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
  }
}