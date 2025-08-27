import { aws_logs, RemovalPolicy, Stack } from "aws-cdk-lib"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"
import dotenv from "dotenv"
import path from "path"
import { DoorwayBackendService } from "./doorway-backend-service"
import { DoorwayPublicLoadBalancer } from "./doorway-public-load-balancer"
import { DoorwayPublicSite } from "./doorway-public-site"

export class DoorwayAppEnvironmentStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || "364076391763",
        region: process.env.CDK_DEFAULT_REGION || "us-west-2",
      },
    })
    const environment = process.env.ENVIRONMENT || "dev2"
    dotenv.config({ path: path.resolve(__dirname, `../../${environment}.env`) })


    const logGroup = new LogGroup(this, `doorway-${environment}-tasks`, {
      logGroupName: `doorway-${environment}-tasks`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.ONE_WEEK,
    })

    const api = new DoorwayBackendService(this, `doorway-api-service-${environment}`, {
      environment: environment,
      logGroup: logGroup,

    })
    const lb = new DoorwayPublicLoadBalancer(this, `doorway-public-lb-${environment}`, {
      environment: environment,
      logGroup: logGroup
    });
    const publicSite = new DoorwayPublicSite(this, `doorway-public-${environment}`, {
      environment: environment,
      logGroup: logGroup
    })
    publicSite.service.node.addDependency(api.service)
    publicSite.service.node.addDependency(lb.loadBalancer)
    lb.targetGroup.addTarget(publicSite.service)




  }
}
