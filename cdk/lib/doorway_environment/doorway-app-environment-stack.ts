import { aws_logs, Fn, RemovalPolicy, Stack } from "aws-cdk-lib"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"
import dotenv from "dotenv"
import path from "path"

import { DoorwayProps } from "./doorway-props"
import { DoorwayPublicLoadBalancer } from "./doorway-public-load-balancer"
import { DoorwayBackendService } from "./services/doorway-backend-service"
import { DoorwayPartnersSite } from "./services/doorway-partners-site"
import { DoorwayPublicSite } from "./services/doorway-public-site"

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
    const scLogGroup = new LogGroup(this, `${id}-service-connect-log-group`, {
      logGroupName: `/doorway/${environment}/service-connect`
    })
    const props: DoorwayProps = {
      environment: environment,
      serviceConnectLogGroup: scLogGroup,
      logGroup: logGroup,
      backendServiceName: `doorway-backend-${environment}`,
      publicServiceName: `doorway-public-${environment}`,
      partnersServiceName: `doorway-partners-${environment}`,
      clusterName: Fn.importValue(`doorway-ecs-cluster-${environment}`),
    }

    const api = new DoorwayBackendService(this, `doorway-api-service-${environment}`, props)
    const lb = new DoorwayPublicLoadBalancer(this, `doorway-public-lb-${environment}`, props);
    const publicSite = new DoorwayPublicSite(this, `doorway-public-${environment}`, props)
    publicSite.service.node.addDependency(lb.loadBalancer)
    lb.publicTargetGroup.addTarget(publicSite.service)
    const partnersSite = new DoorwayPartnersSite(this, `doorway-partners-${environment}`, props)
    partnersSite.service.node.addDependency(lb.loadBalancer)
    lb.partnersTargetGroup.addTarget(partnersSite.service)




  }
}
