import { aws_logs, Fn, RemovalPolicy, Stack } from "aws-cdk-lib"
import { Vpc } from "aws-cdk-lib/aws-ec2"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"
import * as dotenv from "dotenv"
import path from "path"

import { DoorwayLoadBalancers } from "./doorway-load-balancers"
import { DoorwayProps } from "./doorway-props"
import { DoorwayBackendService } from "./services/doorway-backend-service"
import { DoorwayImportListings } from "./services/doorway-import-listings"
import { DoorwayPartnersSite } from "./services/doorway-partners-site"
import { DoorwayPublicSite } from "./services/doorway-public-site"
import { DoorwayS3Stack } from "./services/doorway-s3-stack"
import { DoorwaySecrets } from "./services/doorway-secrets-stack"

export class DoorwayAppEnvironmentStack extends Stack {
  constructor(scope: Construct, id: string, environment: string) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || "364076391763",
        region: process.env.CDK_DEFAULT_REGION || "us-west-2",
      },
      crossRegionReferences: true
    })
    console.log(`Creating Application stack for ${environment}`)
    console.log(`Using environment file: ${path.resolve(__dirname, `../../${environment}.env`)}`)


    dotenv.config({
      path: path.resolve(__dirname, `../../${environment}.env`),
      override: true
    })

    const logGroup = new LogGroup(this, `doorway-${environment}-tasks`, {
      logGroupName: `doorway-${environment}-tasks`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.ONE_WEEK,
    })
    const scLogGroup = new LogGroup(this, `${id}-service-connect-log-group`, {
      logGroupName: `/doorway/${environment}/service-connect`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.ONE_WEEK,
    })
    const vpcId = Fn.importValue(`doorway-vpc-id-${environment}`)
    const azs = Fn.importValue(`doorway-azs-${environment}`).split(",")
    const vpc = Vpc.fromVpcAttributes(this, `vpc-${id}`, {
      vpcId: vpcId,
      availabilityZones: azs,
    })

    const dwProps: DoorwayProps = {
      environment: environment,
      serviceConnectLogGroup: scLogGroup,
      logGroup: logGroup,
      backendServiceName: `doorway-backend-${environment}`,
      publicServiceName: `doorway-public-${environment}`,
      partnersServiceName: `doorway-partners-${environment}`,
      clusterName: Fn.importValue(`doorway-ecs-cluster-${environment}`),
      vpc: vpc
    }
    const s3stack = new DoorwayS3Stack(this, `doorway-s3-${environment}`, dwProps)
    const secrets = new DoorwaySecrets(this, `doorway-secrets-${environment}`, dwProps)
    const api = new DoorwayBackendService(this, `doorway-api-service-${environment}`, dwProps)
    api.service.node.addDependency(s3stack)
    const lb = new DoorwayLoadBalancers(this, `doorway-lbs-${environment}`, dwProps);
    lb.loadBalancer.node.addDependency(s3stack)
    const publicSite = new DoorwayPublicSite(this, `doorway-public-${environment}`, dwProps)
    publicSite.service.node.addDependency(lb.loadBalancer)
    publicSite.service.node.addDependency(api.service)
    lb.publicTargetGroup.addTarget(publicSite.service)
    const partnersSite = new DoorwayPartnersSite(this, `doorway-partners-${environment}`, dwProps)
    partnersSite.service.node.addDependency(lb.loadBalancer)
    partnersSite.service.node.addDependency(api.service)
    lb.partnersTargetGroup.addTarget(partnersSite.service)
    lb.privateTargetGroup.addTarget(api.service)
    const scheduler = new DoorwayImportListings(this, `doorway-import-listings-scheduler-${environment}`, dwProps)
    scheduler.schedule.node.addDependency(api.service)

  }
}
