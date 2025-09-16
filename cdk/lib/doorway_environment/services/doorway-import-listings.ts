/** @fileoverview Doorway Import Listings scheduled task configuration */
import { Duration, Fn } from "aws-cdk-lib";
import { ISecurityGroup, ISubnet, SecurityGroup, Subnet } from "aws-cdk-lib/aws-ec2";
import { Cluster, Secret } from "aws-cdk-lib/aws-ecs";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Schedule, ScheduleExpression } from "aws-cdk-lib/aws-scheduler";
import { EcsRunFargateTask } from "aws-cdk-lib/aws-scheduler-targets";
import * as secret from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { DoorwayProps } from "../doorway-props";
import { DoorwayEcsTask } from "./doorway-ecs-task";

/**
  * Creates a new DoorwayImportListings construct.
  *
  * @param scope - The parent construct (typically a Stack or Stage)
  * @param id - Unique identifier for this construct within the scope
  * @param props - Configuration properties including VPC, environment, and cluster settings
  * @param props.environment - Deployment environment (e.g., 'staging', 'production')
  * @param props.vpc - VPC where the ECS task will run
  * @param props.clusterName - Name of the existing ECS cluster to use
  */
export class DoorwayImportListings {
  /**
   *
   * It sets up an EventBridge schedule that triggers the import listings ECS task every 30 minutes.
   * Configured to run the task in private subnets with database access for importing
   * housing listings from San Jose, San Mateo, and Alameda jurisdictions.
   *
   * @public
   * @property {Schedule}
   * @see {@link https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_scheduler.Schedule.html | AWS CDK Schedule}
   * @see {@link https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_scheduler_targets.EcsRunFargateTask.html | EcsRunFargateTask}
   */
  public schedule: Schedule
  constructor(scope: Construct, id: string, props: DoorwayProps) {
    const executionRole = new Role(scope, `executionRole-${id}`, {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)
    const dbSecret = secret.Secret.fromSecretCompleteArn(scope, "dbSecret-import-listings", dbSecretArn)
    dbSecret.grantRead(executionRole)
    const secrets: { [key: string]: Secret } = {
      PGUSER: Secret.fromSecretsManager(dbSecret, "username"),
      PGPASSWORD: Secret.fromSecretsManager(dbSecret, "password"),
      PGPORT: Secret.fromSecretsManager(dbSecret, "port"),
      PGHOST: Secret.fromSecretsManager(dbSecret, "host"),
      PGDATABASE: Secret.fromSecretsManager(dbSecret, "dbname"),
    }
    const appTierPrivateSGId = Fn.importValue(`doorway-app-sg-${props.environment}`)
    const privateSG: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
      scope,
      `appTierPrivateSG-${id}`,
      appTierPrivateSGId,
    )
    const importListings = new DoorwayEcsTask(scope, `doorway-import-listings-${props.environment}`, {
      ...props,
      memory: 1024,
      cpu: .5,
      instances: 1,
      port: 10246,
      secrets: secrets,
      environmentVariables: {
        JURISDICTION_INCLUDE_LIST: "San Jose,San Mateo,Alameda",
        EXTERNAL_API_BASE: "https://proxy.housingbayarea.org",
        LISTING_VIEW: "base"
      },
      serviceConnectServer: false,
      domainName: "",
      executionRole: executionRole,
      container: `doorway/import-listings:run-${process.env.GIT_HASH}`,
      securityGroup: privateSG,
      serviceName: `doorway-import-listings-${props.environment}`,
      clusterName: props.clusterName,
    })
    const cluster = Cluster.fromClusterAttributes(scope, `import-listings-cluster-${props.environment}`, {
      clusterName: props.clusterName,
      vpc: props.vpc
    })
    // Get the subnets
    const appSubnetIds: string[] = []
    appSubnetIds.push(Fn.importValue(`doorway-app-subnet-1-${props.environment}`))
    appSubnetIds.push(Fn.importValue(`doorway-app-subnet-2-${props.environment}`))
    const appsubnets: ISubnet[] = []
    appSubnetIds.forEach((id) => {
      appsubnets.push(Subnet.fromSubnetId(scope, id, id))
    })
    const schedulerRole = new Role(scope, `scheduler-role-${id}`, {
      assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
    });

    schedulerRole.addToPolicy(new PolicyStatement({
      actions: [
        "ecs:RunTask",
        "ecs:DescribeTaskDefinition",
        "iam:PassRole"
      ],
      resources: ["*"]
    }));

    // Allow passing the execution role to ECS
    schedulerRole.addToPolicy(new PolicyStatement({
      actions: ["iam:PassRole"],
      resources: [executionRole.roleArn]
    }));

    const target = new EcsRunFargateTask(cluster, {
      taskDefinition: importListings.task,
      assignPublicIp: false,
      securityGroups: [privateSG],
      vpcSubnets: {
        subnets: appsubnets,
      },
      role: schedulerRole,
    })

    this.schedule = new Schedule(scope, `import-listings-schedule-${props.environment}`, {
      scheduleName: `import-listings-schedule-${props.environment}`,
      target: target,
      schedule: ScheduleExpression.rate(Duration.minutes(30))
    })
  }
}