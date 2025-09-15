import { Duration, Fn } from "aws-cdk-lib";
import { ISecurityGroup, ISubnet, SecurityGroup, Subnet } from "aws-cdk-lib/aws-ec2";
import { Cluster, Secret } from "aws-cdk-lib/aws-ecs";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Schedule, ScheduleExpression } from "aws-cdk-lib/aws-scheduler";
import { EcsRunFargateTask } from "aws-cdk-lib/aws-scheduler-targets";
import * as secret from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { DoorwayProps } from "../doorway-props";
import { DoorwayEcsTask } from "./doorway-ecs-task";

export class DoorwayImportListings {
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
      cpu: 1,
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
    const target = new EcsRunFargateTask(cluster, {
      taskDefinition: importListings.task,
      assignPublicIp: false,
      securityGroups: [privateSG],
      vpcSubnets: {
        subnets: appsubnets,
      },

    })
    this.schedule = new Schedule(scope, `import-listings - schedule - ${props.environment} `, {
      target: target,
      schedule: ScheduleExpression.rate(Duration.minutes(30))


    })
  }
}