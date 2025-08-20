import { Aws, aws_logs, Duration, Fn, RemovalPolicy } from "aws-cdk-lib"
import {
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  LogDrivers,
  NetworkMode,
  Protocol,
  Secret,
  TaskDefinition,
} from "aws-cdk-lib/aws-ecs"
import {
  CompositePrincipal,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery"
import { EmailIdentity } from "aws-cdk-lib/aws-ses"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

import { DoorwayService } from "./doorway_services"
import { DoorwayServiceProps } from "./doorway-service-props"

export class DoorwayApiService extends DoorwayService {
  public constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    super(scope, id, props)
    const environmentVariables = {
      ASSET_FILE_SERVICE: process.env.ASSET_FILE_SERVICE || "s3",
      LISTINGS_PROCESSING_QUERY: process.env.LISTINGS_PROCESSING_QUERY || "/listings",
      PORT: process.env.API_LOCAL_PORT || "3100",
      SHOW_LM_LINKS: process.env.SHOW_LM_LINKS || "TRUE",
      TIME_ZONE: process.env.TIME_ZONE || "America/Los_Angeles",
      SHOW_DUPLICATES: process.env.SHOW_DUPLICATES || "FALSE",
      NO_COLOR: process.env.NO_COLOR || "TRUE",
      ASSET_FS_CONFIG_s3_PATH_PREFIX: process.env.ASSET_FS_CONFIG_s3_PATH_PREFIX || "",
      ASSET_FS_PRIVATE_CONFIG_s3_BUCKET: this.secureUploads.bucketName,
      ASSET_FS_CONFIG_s3_BUCKET: this.publicUploads.bucketName,
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
        process.env.CORS_ORIGINS ||
        "https://housingbayarea.mtc.ca.gov, https://partners.housingbayarea.mtc.ca.gov",
      DUPLICATES_CLOSE_DATE: process.env.DUPLICATES_CLOSE_DATE || "2024-10-08 00:00 -08:00",
      HTTPS_OFF: process.env.HTTPS_OFF || "TRUE",
      SAME_SITE: process.env.SAME_SITE || "false",
      API_KEY: process.env.API_KEY || "doorway-api-key",
    }
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)
    const dbSecret = secret.Secret.fromSecretCompleteArn(scope, "dbSecret", dbSecretArn)
    dbSecret.grantRead(this.executionRole)
    const secrets: { [key: string]: Secret } = {
      PGUSER: Secret.fromSecretsManager(dbSecret, "username"),
      PGPASSWORD: Secret.fromSecretsManager(dbSecret, "password"),
      PGPORT: Secret.fromSecretsManager(dbSecret, "port"),
      PGHOST: Secret.fromSecretsManager(dbSecret, "host"),
      PGDATABASE: Secret.fromSecretsManager(dbSecret, "dbname"),
    }
    process.env.BACKEND_SECRETS ||
      "".split(",").forEach((secretName) => {
        secrets[secretName] = Secret.fromSecretsManager(
          secret.Secret.fromSecretNameV2(scope, secretName, `/doorway/${secretName}`),
        )
      })
    // Grant write access to the uploads buckets.
    this.publicUploads.grantReadWrite(this.executionRole)
    this.publicUploads.grantPut(this.executionRole)
    this.secureUploads.grantReadWrite(this.executionRole)
    this.secureUploads.grantPut(this.executionRole)
    // Get the SES Email Information
    const sesIdentity = EmailIdentity.fromEmailIdentityName(
      scope,
      "sesIdentity",
      "housingbayarea2.org",
    )
    sesIdentity.grantSendEmail(this.executionRole)
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
    this.executionRole.addToPolicy(policy)

    const logGroup = new LogGroup(scope, `doorway-${props.environment}-tasks`, {
      logGroupName: `doorway-${props.environment}-tasks`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.ONE_WEEK,
    })
    logGroup.grantWrite(this.executionRole)
    // Now we're down to business! Set up the fargate container task for the api
    // Notice the load of environment variables we add to it below
    const task = new TaskDefinition(scope, "apiTask", {
      compatibility: Compatibility.FARGATE,
      cpu: process.env.API_CPUS || "2048",
      memoryMiB: process.env.API_MEMORY || "4096",
      executionRole: this.executionRole,
      taskRole: this.executionRole,
      networkMode: NetworkMode.AWS_VPC,
    })

    task.addContainer("internal-api", {
      image: ContainerImage.fromRegistry(
        `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/doorway/backend:run-candidate`,
      ),
      cpu: 1,
      memoryLimitMiB: 1024,
      essential: true,
      logging: LogDrivers.awsLogs({
        streamPrefix: "internal-api",
        logGroup: LogGroup.fromLogGroupName(
          scope,
          "logGroup",
          `doorway-${props.environment}-tasks`,
        ),
      }),
      secrets: secrets,
      environment: environmentVariables,
      entryPoint: [],
      portMappings: [
        {
          name: "internal-api-port",
          containerPort: Number(process.env.API_LOCAL_PORT) || 3100,
          protocol: Protocol.TCP,
          hostPort: Number(process.env.API_LOCAL_PORT) || 3100,
        },
      ],
    })
    //Setting up ServiceConnect which will allow the partenr and public services
    // to connect to the internal api service directly through ECS
    // without a load balancer.
    const namespace = new PrivateDnsNamespace(
      scope,
      `doorway-${props.environment}-internal-api-namespace`,
      {
        vpc: this.vpc,
        name: `doorway-${props.environment}-internal-api`,
        description: `Private DNS namespace for the Doorway ${props.environment} internal API`,
      },
    )
    // The private CA is used for TLS encryption of ServiceConnect traffic.
    const privateCAArn = StringParameter.fromStringParameterAttributes(scope, "privateCAArn", {
      parameterName: `/doorway/privateCertAuthority`,
    }).stringValue
    const scRole = new Role(scope, `doorway-${props.environment}-internal-api-sc-role`, {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("ecs.amazonaws.com"),
        new ServicePrincipal("ecs-tasks.amazonaws.com"),
      ),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSInfrastructureRolePolicyForServiceConnectTransportLayerSecurity",
        ),
      ],
      inlinePolicies: {
        pcaAuth: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["acm-pca:*"],
              resources: [privateCAArn],
            }),
          ],
        }),
      },
    })

    // Create the service in ECS
    const service = new FargateService(scope, `doorway-${props.environment}-internal-api`, {
      taskDefinition: task,
      serviceName: `doorway-${props.environment}-internal-api`,
      cluster: Cluster.fromClusterAttributes(scope, "ecsCluster", {
        clusterName: Fn.importValue(`doorway-ecs-cluster-${props.environment}`),
        vpc: this.vpc,
      }),
      vpcSubnets: {
        subnets: this.appsubnets,
      },
      securityGroups: [this.privateSG],

      desiredCount: Number(process.env.API_INSTANCES) || 3,
      serviceConnectConfiguration: {
        namespace: namespace.namespaceArn,
        logDriver: LogDrivers.awsLogs({
          streamPrefix: "internal-api-service-connect",
          logGroup: logGroup,
        }),
        services: [
          {
            portMappingName: "internal-api-port",
            dnsName: `backend.${props.environment}.housingbayarea.int`,

            tls: {
              awsPcaAuthorityArn: privateCAArn,
              role: scRole,
            },
          },
        ],
      },
    })

    // Ensure the namespace is created before the service
    service.node.addDependency(namespace)

    const scaling = service.autoScaleTaskCount({
      minCapacity: Number(process.env.API_INSTANCES) || 3,
      maxCapacity: Number(process.env.API_MAX_INSTANCES) || 10,
    })
    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: Number(process.env.API_AUTOSCALE_CPU) || 80,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60),
    })
  }
}
