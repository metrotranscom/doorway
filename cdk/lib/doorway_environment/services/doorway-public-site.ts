import { Fn } from "aws-cdk-lib"
import { ISecurityGroup, Port, Protocol, SecurityGroup } from "aws-cdk-lib/aws-ec2"
import { FargateService, Secret } from "aws-cdk-lib/aws-ecs"
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Bucket } from "aws-cdk-lib/aws-s3"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { Construct } from "constructs"

import { DoorwayProps } from "../doorway-props"
import { DoorwayService } from "./doorway_service"

/**
 * Builds the Doorway Public Site
 * @class
 * @see DoorwayService
 */
export class DoorwayPublicSite {
  public service: FargateService
  constructor(scope: Construct, id: string, props: DoorwayProps) {
    const gitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION?.substring(0, 8) || "candidate"
    const executionRole = new Role(scope, `executionRole-${id}`, {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })
    const publicUploads = Bucket.fromBucketName(
      scope,
      `publicUploadsBucket-${id}`,

      `doorway-public-uploads-${props.environment}`,
    )
    const secureUploads = Bucket.fromBucketArn(
      scope,
      `secureUploadsBucket-${id}`,
      Fn.importValue(`doorway-secure-uploads-${props.environment}`),
    )
    const port = Number(process.env.PUBLIC_PORTAL_PORT || "3000")
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
      BLOOM_API_BASE: process.env.BLOOM_API_BASE || "https://proxy.housingbayarea.org",
      CACHE_REVALIDATE: process.env.CACHE_REVALIDATE || "60",
      GTM_KEY: process.env.GTM_KEY || "GTM-KF22FJP",
      IDLE_TIMEOUT: process.env.IDLE_TIMEOUT || "5",
      JURISDICTION_NAME: process.env.JURISDICTION_NAME || "Bay Area",
      LANGUAGES: process.env.LANGUAGES || "en,es,zh,vi,tl",
      LISTINGS_QUERY: process.env.LISTINGS_QUERY || "/listings",
      NEXTJS_PORT: String(port),
      NODE_ENV: process.env.NODE_ENV || "dev2elopment",
      NOTIFICATIONS_SIGNUP_URL:
        process.env.NOTIFICATIONS_SIGNUP_URL ||
        "https://public.govdelivery.com/accounts/CAMTC/signup/36832",
      SHOW_ALL_MAP_PINS: process.env.SHOW_ALL_MAP_PINS || "true",
      SHOW_PROFESSIONAL_PARTNERS: process.env.SHOW_PROFESSIONAL_PARTNERS || "true",
    }
    const secretNames = (process.env.PUBLIC_PORTAL_SECRETS || "").split(",")
    const secrets: { [key: string]: Secret } = {}
    secretNames.forEach((secretName) => {
      secrets[secretName] = Secret.fromSecretsManager(
        secret.Secret.fromSecretNameV2(scope, `${secretName}-${id}`, `/doorway/${props.environment}/${secretName}`),
      )
    })
    this.service = new DoorwayService(scope, `${id}-service`, {
      ...props,
      memory: Number(process.env.PUBLIC_PORTAL_MEMORY || 4096),
      cpu: Number(process.env.PUBLIC_PORTAL_CPUS || 2),
      instances: Number(process.env.PUBLIC_PORTAL_INSTANCES || 3),
      port: Number(process.env.PUBLIC_PORTAL_PORT || 3000),
      secrets: secrets,
      environmentVariables: environmentVariables,
      serviceConnectServer: false,
      domainName: process.env.PUBLIC_PORTAL_DOMAIN || `${props.environment}.housingbayarea.mtc.ca.gov`,
      executionRole: executionRole,
      publicUploads: publicUploads,
      secureUploads: secureUploads,
      logGroup: props.logGroup,
      apiTargetDomainName: process.env.BACKEND_API_BASE || `http://backend.${props.environment}.housingbayarea.int`,
      apiTargetPort: Number(process.env.BACKEND_API_PORT || 3000),
      container: `doorway/public:run-${props.environment}-${gitHash}`,
      securityGroup: privateSG,
      serviceName: props.publicServiceName,
      clusterName: props.clusterName,
    }).service

  }
}
