import { aws_logs, RemovalPolicy, Stack } from "aws-cdk-lib"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"
import dotenv from "dotenv"

import { DoorwayApiService } from "./doorway-api-service"
import { DoorwayPublicSite } from "./doorway-public-site"

export class DoorwayAppEnvironmentStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id)
    const environment = process.env.ENVIRONMENT || "dev2"
    dotenv.config({ path: `${environment}.env` })
    const logGroup = new LogGroup(this, `doorway-${environment}-tasks`, {
      logGroupName: `doorway-${environment}-tasks`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.ONE_WEEK,
    })

    const api = new DoorwayApiService(this, `doorway-api-service-${environment}`, {
      environment: environment,
      logGroup: logGroup,

    })
    const publicSite = new DoorwayPublicSite(this, `doorway-public-service-${environment}`, {
      environment: environment,
      logGroup: logGroup
    })
    publicSite.service.node.addDependency(api.service)
  }
}
