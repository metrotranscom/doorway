import { Stack } from "aws-cdk-lib"
import { Construct } from "constructs"
import dotenv from "dotenv"

import { DoorwayApiService } from "./doorway-api-service"
import { DoorwayPublicService } from "./doorway-public-service"

export class DoorwayAppEnvironmentStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id)
    const environment = process.env.ENVIRONMENT || "dev2"
    dotenv.config({ path: `${environment}.env` })

    new DoorwayApiService(this, `doorway-api-service-${environment}`, {
      environment: environment,
    })
    new DoorwayPublicService(this, `doorway-public-service-${environment}`, {
      environment: environment,
    })
  }
}
