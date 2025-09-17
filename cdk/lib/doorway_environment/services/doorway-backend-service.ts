import { Aws, Fn } from "aws-cdk-lib"
import { ISecurityGroup, Port, Protocol, SecurityGroup } from "aws-cdk-lib/aws-ec2"
import { FargateService, Secret } from "aws-cdk-lib/aws-ecs"
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Bucket } from "aws-cdk-lib/aws-s3"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { EmailIdentity } from "aws-cdk-lib/aws-ses"
import { Construct } from "constructs"

import { DoorwayProps } from "../doorway-props"
import { DoorwayService } from "./doorway_service"

/**
 * The Backend API Service for Doorway
 * @class
 * @see DoorwayService
 */
export class DoorwayBackendService {
  public service: FargateService
  public constructor(scope: Construct, id: string, props: DoorwayProps) {
    const gitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION?.substring(0, 8) || "candidate"
    const executionRole = new Role(scope, `executionRole-${id}`, {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })
    const publicUploads = Bucket.fromBucketArn(
      scope,
      `publicUploadsBucket-${id}`,
      Fn.importValue(`doorway-public-uploads-${props.environment}`),
    )
    const secureUploads = Bucket.fromBucketArn(
      scope,
      `secureUploadsBucket-${id}`,
      Fn.importValue(`doorway-secure-uploads-${props.environment}`),
    )

    const environmentVariables = {
      ASSET_FILE_SERVICE: process.env.ASSET_FILE_SERVICE || "s3",
      LISTINGS_PROCESSING_QUERY: process.env.LISTINGS_PROCESSING_QUERY || "/listings",
      PORT: process.env.BACKEND_API_PORT || "3100",
      SHOW_LM_LINKS: process.env.SHOW_LM_LINKS || "TRUE",
      TIME_ZONE: process.env.TIME_ZONE || "America/Los_Angeles",
      SHOW_DUPLICATES: process.env.SHOW_DUPLICATES || "FALSE",
      NO_COLOR: process.env.NO_COLOR || "TRUE",
      ASSET_FS_CONFIG_s3_PATH_PREFIX: process.env.ASSET_FS_CONFIG_s3_PATH_PREFIX || "",
      ASSET_FS_PRIVATE_CONFIG_s3_BUCKET: secureUploads.bucketName,
      ASSET_FS_CONFIG_s3_BUCKET: publicUploads.bucketName,
      ASSET_FS_CONFIG_s3_REGION: Aws.REGION,
      ASSET_FS_CONFIG_s3_URL_FORMAT: process.env.ASSET_FS_CONFIG_s3_URL_FORMAT || "public",
      THROTTLE_LIMIT: process.env.THROTTLE_LIMIT || "100",
      THROTTLE_TTL: process.env.THROTTLE_TTL || "180000",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
      LISTING_PROCESSING_CRON_STRING: process.env.LISTING_PROCESSING_CRON_STRING || "0 * * * *",
      LOTTERY_PROCESSING_CRON_STRING: process.env.LOTTERY_PROCESSING_CRON_STRING || "0 * * * *",
      LOTTERY_PUBLISH_PROCESSING_CRON_STRING:
        process.env.LOTTERY_PUBLISH_PROCESSING_CRON_STRING || "58 23 * * *",
      AFS_PROCESSING_CRON_STRING: process.env.AFS_PROCESSING_CRON_STRING || "15 * * * *",
      TEMP_FILE_CLEAR_CRON_STRING: process.env.TEMP_FILE_CLEAR_CRON_STRING || "30 * * * *",
      DUPLICATES_PROCESSING_CRON_STRING:
        process.env.DUPLICATES_PROCESSING_CRON_STRING || "5 * * * *",
      LOTTERY_DAYS_TILL_EXPIRY: process.env.LOTTERY_DAYS_TILL_EXPIRY || "45",
      MFA_CODE_LENGTH: process.env.MFA_CODE_LENGTH || "5",
      MFA_CODE_VALID: process.env.MFA_CODE_VALID || "600000",
      GOVDELIVERY_TOPIC: process.env.GOVDELIVERY_TOPIC || "5 * * * *",
      PARTNERS_PORTAL_URL:
        process.env.PARTNERS_PORTAL_URL ||
        `https://partners.${props.environment}.housingbayarea.mtc.ca.gov`,
      PARTNERS_BASE_URL:
        process.env.PARTNERS_BASE_URL ||
        `https://partners.${props.environment}.housingbayarea.mtc.ca.gov/api`,
      ASSET_UPLOAD_MAX_SIZE: process.env.ASSET_UPLOAD_MAX_SIZE || "5",
      AUTH_LOCK_LOGIN_COOLDOWN: process.env.AUTH_LOCK_LOGIN_COOLDOWN || "1800000",
      AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS:
        process.env.AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS || "5",
      CORS_ORIGINS:
        process.env.CORS_ORIGINS || "*",
      DUPLICATES_CLOSE_DATE: process.env.DUPLICATES_CLOSE_DATE || "2024-10-08 00:00 -08:00",
      // Doorway has started using serviceconnect which uses TLS internally, so we can turn HTTPS_OFF on for all environments.
      HTTPS_OFF: process.env.HTTPS_OFF || "true",
      // We can also turn off same site cookies and CORS since we're using serviceconnect because the incoming traffic looks like it's coming from localhost
      SAME_SITE: process.env.SAME_SITE || "true",
      DISABLE_CORS: process.env.DISABLE_CORS || "TRUE",
      APP_SECRET: process.env.APP_SECRET || "<fake key that is over 16 characters long>",
    }
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)
    const dbSecret = secret.Secret.fromSecretCompleteArn(scope, "dbSecret", dbSecretArn)
    dbSecret.grantRead(executionRole)
    const secrets: { [key: string]: Secret } = {
      PGUSER: Secret.fromSecretsManager(dbSecret, "username"),
      PGPASSWORD: Secret.fromSecretsManager(dbSecret, "password"),
      PGPORT: Secret.fromSecretsManager(dbSecret, "port"),
      PGHOST: Secret.fromSecretsManager(dbSecret, "host"),
      PGDATABASE: Secret.fromSecretsManager(dbSecret, "dbname"),
    }
    const secretNames = process.env.BACKEND_API_SECRETS || ""
    console.log(`SECRETS: ${secretNames}`)
    secretNames.split(",").forEach((secretName) => {
      secrets[secretName] = Secret.fromSecretsManager(
        secret.Secret.fromSecretNameV2(scope, secretName, `/doorway/${props.environment}/${secretName}`),
      )
    })

    // Grant write access to the uploads buckets.
    publicUploads.grantReadWrite(executionRole)
    publicUploads.grantPut(executionRole)
    secureUploads.grantReadWrite(executionRole)
    secureUploads.grantPut(executionRole)
    // Get the SES Email Information
    const sesIdentity = EmailIdentity.fromEmailIdentityName(
      scope,
      "sesIdentity",
      "housingbayarea2.org",
    )
    sesIdentity.grantSendEmail(executionRole)
    // Add a bunch of random SES grants that grantSendEmail doesn't set up
    const policy = new PolicyStatement({
      actions: [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:SendTemplatedEmail",
        "ses:SendRawTemplatedEmail",
        "ses:SendBulkTemplatedEmail",
        "ses:UseConfiguration",
        "ses:SendBulkEmail",
      ],
      resources: [
        sesIdentity.emailIdentityArn,
        `arn:aws:ses:${Aws.REGION}:${Aws.ACCOUNT_ID}:configuration-set/dway-config-set`,
        `arn:aws:ses:${Aws.REGION}:${Aws.ACCOUNT_ID}:identity/*`,
      ],
    })
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
    const inboundPort = Number(process.env.BACKEND_API_PORT || 3100)
    privateSG.addIngressRule(privateSG, new Port({
      protocol: Protocol.TCP,
      stringRepresentation: "inbound-backend",
      fromPort: inboundPort,
      toPort: inboundPort


    }), "Allow internal traffic from web app servers")
    executionRole.addToPolicy(policy)


    this.service = new DoorwayService(scope, `doorway-api-service-${props.environment}`, {
      ...props,
      memory: Number(process.env.BACKEND_MEMORY || 4096),
      cpu: Number(process.env.BACKEND_CPUS || 2),
      instances: Number(process.env.BACKEND_INSTANCES || 3),
      port: Number(process.env.BACKEND_API_PORT || 3100),
      secrets: secrets,
      environmentVariables: environmentVariables,
      serviceConnectServer: true,
      domainName: `backend.${props.environment}.housingbayarea.int`,
      executionRole: executionRole,
      publicUploads: publicUploads,
      secureUploads: secureUploads,
      environment: props.environment,
      container: `doorway/backend:run-${gitHash}`,
      securityGroup: privateSG,
      serviceName: props.backendServiceName,
      clusterName: props.clusterName,


    }).service


  }
}
