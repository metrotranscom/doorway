import { Fn } from "aws-cdk-lib"
import { ISecurityGroup, Port, Protocol, SecurityGroup } from "aws-cdk-lib/aws-ec2"
import { FargateService, Secret } from "aws-cdk-lib/aws-ecs"
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Bucket } from "aws-cdk-lib/aws-s3"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { Construct } from "constructs"

import { DoorwayProps } from "./doorway-props"
import { DoorwayService } from "./doorway_service"

export class DoorwayPartnersSite {
  public service: FargateService
  constructor(scope: Construct, id: string, props: DoorwayProps) {
    const gitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION?.substring(0, 8) || "candidate"
    const executionRole = new Role(scope, `executionRole-${id}`, {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })

    const publicUploads = Bucket.fromBucketArn(
      scope,
      `partnersUploadsBucket-${id}`,
      Fn.importValue(`doorway-public-uploads-${props.environment}`),
    )
    const secureUploads = Bucket.fromBucketArn(
      scope,
      `secureUploadsBucket-${id}`,
      Fn.importValue(`doorway-secure-uploads-${props.environment}`),
    )
    const port = Number(process.env.PARTNERS_PORTAL_PORT || "3000")
    const appTierPrivateSGId = Fn.importValue(`doorway-app-sg-${props.environment}`)
    const privateSG: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
      scope,
      `appTierPrivateSG-${id}`,
      appTierPrivateSGId,
    )
    const publicSGId = Fn.importValue(`doorway-public-sg-${props.environment}`)
    const publicSG: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
      scope,
      `publicSG-${id}`,
      publicSGId,
    )
    const inboundPort = Number(process.env.BACKEND_API_PORT || 3000)
    privateSG.addIngressRule(publicSG, new Port({
      protocol: Protocol.TCP,
      stringRepresentation: "inbound-backend",
      fromPort: inboundPort,
      toPort: inboundPort
    }), "Allow internal traffic from web app servers")
    const environmentVariables: { [key: string]: string } = {
      BACKEND_API_BASE:
        process.env.BACKEND_API_BASE || `http://backend.${props.environment}.housingbayarea.int`,
      FEATURE_LISTINGS_APPROVAL:
        process.env.FEATURE_LISTINGS_APPROVAL || "TRUE",
      LISTINGS_QUERY: process.env.LISTINGS_QUERY || "/listings",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
      NEXTJS_PORT: String(port),
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || "",
      NODE_ENV: process.env.NODE_ENV || "development",
      SHOW_DUPLICATES: process.env.SHOW_DUPLICATES || "FALSE",
      SHOW_LM_LINKS: process.env.SHOW_LM_LINKS || "TRUE",
      USE_SECURE_DOWNLOAD_PATHWAY: process.env.USE_SECURE_DOWNLOAD_PATHWAY || "TRUE",
    }
    const secretNames = process.env.PARTNERS_PORTAL_SECRETS != undefined ? process.env.PARTNERS_PORTAL_SECRETS.split(",") : []
    const secrets: { [key: string]: Secret } = {}
    secretNames.forEach((secretName) => {
      secrets[secretName] = Secret.fromSecretsManager(
        secret.Secret.fromSecretNameV2(scope, `${secretName}-${id}`, `/doorway/${props.environment}/${secretName}`),
      )
    })
    this.service = new DoorwayService(scope, `${id}-service`, {
      ...props,
      memory: Number(process.env.PARTNERS_PORTAL_MEMORY || 4096),
      cpu: Number(process.env.PARTNERS_PORTAL_CPU || 2),
      instances: Number(process.env.PARTNERS_PORTAL_INSTANCES || 3),
      port: Number(process.env.PARTNERS_PORTAL_PORT || 3000),
      secrets: secrets,
      environmentVariables: environmentVariables,
      serviceConnectServer: false,
      domainName: process.env.PARTNERS_PORTAL_DOMAIN || `partners.${props.environment}.housingbayarea.mtc.ca.gov`,
      executionRole: executionRole,
      publicUploads: publicUploads,
      secureUploads: secureUploads,
      logGroup: props.logGroup,
      apiTargetDomainName: process.env.BACKEND_API_BASE || `http://backend.${props.environment}.housingbayarea.int`,
      apiTargetPort: Number(process.env.BACKEND_API_PORT || 3000),
      container: `doorway/partners:run-${process.env.ENVIRONMENT || "dev2"}-${gitHash}`,
      securityGroup: privateSG,
      serviceName: props.partnersServiceName,
      clusterName: props.clusterName
    }).service

  }
}
