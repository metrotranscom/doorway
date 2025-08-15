import * as cdk from "aws-cdk-lib"
import { Fn } from "aws-cdk-lib"
import { ISubnet, Subnet } from "aws-cdk-lib/aws-ec2"
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
//import * as ecs from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { Bucket } from "aws-cdk-lib/aws-s3"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { EmailIdentity } from "aws-cdk-lib/aws-ses"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

import { DoorwayStackProps } from "./doorway-stack-props"

export class DoorwayApiServiceStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: DoorwayStackProps = {
      environment: "dev2",
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || "none",
        region: process.env.CDK_DEFAULT_REGION || "none",
      },
    }
  ) {
    super(scope, id, props)

    const vpcId = cdk.Fn.importValue(`doorway-vpc-id-${props.environment}`)
    const azs = cdk.Fn.importValue(`doorway-azs-${props.environment}`).split(",")
    const vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(this, "vpc", {
      vpcId: vpcId,
      availabilityZones: azs,
    })

    // Get the subnets
    const appSubnetIds: string[] = []
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-1-${props.environment}`))
    appSubnetIds.push(cdk.Fn.importValue(`doorway-app-subnet-2-${props.environment}`))
    const appSubnets: ISubnet[] = []
    appSubnetIds.forEach((id) => {
      appSubnets.push(Subnet.fromSubnetId(this, id, id))
    })
    const appTierPrivateSGId = cdk.Fn.importValue(`doorway-app-sg-${props.environment}`)
    const appTierPrivateSG = cdk.aws_ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "appTierPrivateSG",
      appTierPrivateSGId
    )

    const publicUploadsBucket = Bucket.fromBucketArn(
      this,
      `publicUploadsBucket`,
      Fn.importValue(`doorway-public-uploads-${props.environment}`)
    )
    const secureUploadsBucket = Bucket.fromBucketArn(
      this,
      `secureUploadsBucket`,
      Fn.importValue(`doorway-secure-uploads-${props.environment}`)
    )
    // Get the SES Email Information
    const sesIdentity = EmailIdentity.fromEmailIdentityName(
      this,
      "sesIdentity",
      "housingbayarea2.org"
    )

    // Create the execution role for the doorway API service
    const executionRole = new Role(this, "executionRole", {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    })
    executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy")
    )
    executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMReadOnlyAccess")
    )
    executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSReadOnlyAccess")
    )
    executionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly")
    )
    publicUploadsBucket.grantReadWrite(executionRole)
    publicUploadsBucket.grantPut(executionRole)
    secureUploadsBucket.grantReadWrite(executionRole)
    secureUploadsBucket.grantPut(executionRole)
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
        `arn:aws:ses:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:configuration-set/dway-config-set`,
        `arn:aws:ses:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:identity/*`,
      ],
    })
    executionRole.addToPolicy(policy)
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)
    const dbSecret = secret.Secret.fromSecretCompleteArn(this, "dbSecret", dbSecretArn)
    dbSecret.grantRead(executionRole)
    const logGroup = new LogGroup(this, `doorway-${props.environment}-tasks`, {
      logGroupName: `doorway-${props.environment}-tasks`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    })
    logGroup.grantWrite(executionRole)

    // Now we're down to business! Set up the fargate container task for the api
    // Notice the load of environment variables we add to it below
    const task = new TaskDefinition(this, "apiTask", {
      compatibility: Compatibility.FARGATE,
      cpu: "2048",
      memoryMiB: "4096",
      executionRole: executionRole,
      taskRole: executionRole,
      networkMode: NetworkMode.AWS_VPC,
    })
    task.addContainer("internal-api", {
      image: ContainerImage.fromRegistry(
        `${cdk.Aws.ACCOUNT_ID}.dkr.ecr.${cdk.Aws.REGION}.amazonaws.com/doorway/backend:run-candidate`
      ),
      cpu: 1,
      memoryLimitMiB: 1024,
      essential: true,
      logging: LogDrivers.awsLogs({
        streamPrefix: "internal-api",
        logGroup: LogGroup.fromLogGroupName(this, "logGroup", `doorway-${props.environment}-tasks`),
      }),

      secrets: {
        GOOGLE_API_ID: Secret.fromSecretsManager(
          secret.Secret.fromSecretNameV2(this, "googleApiId", "/doorway/GOOGLE_API_ID")
        ),
        GOOGLE_API_EMAIL: Secret.fromSecretsManager(
          secret.Secret.fromSecretNameV2(this, "googleApiEmail", "/doorway/GOOGLE_API_EMAIL")
        ),
        GOOGLE_API_KEY: Secret.fromSecretsManager(
          secret.Secret.fromSecretNameV2(this, "googleApiKey", "/doorway/GOOGLE_API_KEY")
        ),

        PGUSER: Secret.fromSecretsManager(dbSecret, "username"),
        PGPASSWORD: Secret.fromSecretsManager(dbSecret, "password"),
        PGPORT: Secret.fromSecretsManager(dbSecret, "port"),
        PGHOST: Secret.fromSecretsManager(dbSecret, "host"),
        THROTTLE_LIMIT: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "THROTTLE_LIMIT", {
            parameterName: `/doorway/${props.environment}/internal-api/THROTTLE_LIMIT`,
          })
        ),
        LOG_LEVEL: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "LOG_LEVEL", {
            parameterName: `/doorway/${props.environment}/internal-api/LOG_LEVEL`,
          })
        ),

        LISTING_PROCESSING_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "LISTING_PROCESSING_CRON_STRING", {
            parameterName: `/doorway/${props.environment}/internal-api/LISTING_PROCESSING_CRON_STRING`,
          })
        ),
        LOTTERY_PROCESSING_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "LOTTERY_PROCESSING_CRON_STRING", {
            parameterName: `/doorway/${props.environment}/internal-api/LOTTERY_PROCESSING_CRON_STRING`,
          })
        ),
        LOTTERY_PUBLISH_PROCESSING_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(
            this,
            "LOTTERY_PUBLISH_PROCESSING_CRON_STRING",
            {
              parameterName: `/doorway/${props.environment}/internal-api/LOTTERY_PUBLISH_PROCESSING_CRON_STRING`,
            }
          )
        ),
        AFS_PROCESSING_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "AFS_PROCESSING_CRON_STRING", {
            parameterName: `/doorway/${props.environment}/internal-api/AFS_PROCESSING_CRON_STRING`,
          })
        ),
        TEMP_FILE_CLEAR_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "TEMP_FILE_CLEAR_CRON_STRING", {
            parameterName: `/doorway/${props.environment}/internal-api/TEMP_FILE_CLEAR_CRON_STRING`,
          })
        ),
        LOTTERY_DAYS_TILL_EXPIRY: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "LOTTERY_DAYS_TILL_EXPIRY", {
            parameterName: `/doorway/${props.environment}/internal-api/LOTTERY_DAYS_TILL_EXPIRY`,
          })
        ),
        MFA_CODE_LENGTH: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "MFA_CODE_LENGTH", {
            parameterName: `/doorway/${props.environment}/internal-api/MFA_CODE_LENGTH`,
          })
        ),
        MFA_CODE_VALID: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "MFA_CODE_VALID", {
            parameterName: `/doorway/${props.environment}/internal-api/MFA_CODE_VALID`,
          })
        ),

        GOVDELIVERY_TOPIC: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "GOVDELIVERY_TOPIC", {
            parameterName: `/doorway/${props.environment}/internal-api/GOVDELIVERY_TOPIC`,
          })
        ),

        PARTNERS_PORTAL_URL: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "PARTNERS_PORTAL_URL", {
            parameterName: `/doorway/${props.environment}/internal-api/PARTNERS_PORTAL_URL`,
          })
        ),
        PARTNERS_BASE_URL: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "PARTNERS_PORTAL_BASE_URL", {
            parameterName: `/doorway/${props.environment}/internal-api/PARTNERS_BASE_URL`,
          })
        ),
        THROTTLE_TTL: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "THROTTLE_TTL", {
            parameterName: `/doorway/${props.environment}/internal-api/THROTTLE_TTL`,
          })
        ),

        ASSET_UPLOAD_MAX_SIZE: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "ASSET_UPLOAD_MAX_SIZE", {
            parameterName: `/doorway/${props.environment}/internal-api/ASSET_UPLOAD_MAX_SIZE`,
          })
        ),
        AUTH_LOCK_LOGIN_COOLDOWN: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "AUTH_LOCK_LOGIN_COOLDOWN", {
            parameterName: `/doorway/${props.environment}/internal-api/AUTH_LOCK_LOGIN_COOLDOWN`,
          })
        ),
        AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(
            this,
            "AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS",
            {
              parameterName: `/doorway/${props.environment}/internal-api/AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS`,
            }
          )
        ),
        CORS_ORIGINS: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "CORS_ORIGINS", {
            parameterName: `/doorway/${props.environment}/internal-api/CORS_ORIGINS`,
          })
        ),
        DUPLICATES_CLOSE_DATE: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "DUPLICATES_CLOSE_DATE", {
            parameterName: `/doorway/${props.environment}/internal-api/DUPLICATES_CLOSE_DATE`,
          })
        ),
        DUPLICATES_PROCESSING_CRON_STRING: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "DUPLICATES_PROCESSING_CRON_STRING", {
            parameterName: `/doorway/${props.environment}/internal-api/DUPLICATES_PROCESSING_CRON_STRING`,
          })
        ),
        HTTPS_OFF: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "HTTPS_OFF", {
            parameterName: `/doorway/${props.environment}/internal-api/HTTPS_OFF`,
          })
        ),
        SAME_SITE: Secret.fromSsmParameter(
          StringParameter.fromStringParameterAttributes(this, "SAME_SITE", {
            parameterName: `/doorway/${props.environment}/internal-api/SAME_SITE`,
          })
        ),
      },
      environment: {
        APP_SECRET: "<reallylongdummyvaluethathisnotused>",
        ASSET_FILE_SERVICE: "s3",
        LISTINGS_PROCESSING_QUERY: "/listings",
        PORT: "3100",
        SHOW_LM_LINKS: "TRUE",
        TIME_ZONE: "America/Los_Angeles",
        SHOW_DUPLICATES: "FALSE",
        NO_COLOR: "TRUE",
        ASSET_FS_CONFIG_s3_PATH_PREFIX: "",
        ASSET_FS_PRIVATE_CONFIG_s3_BUCKET: secureUploadsBucket.bucketName,
        ASSET_FS_CONFIG_s3_BUCKET: publicUploadsBucket.bucketName,
        ASSET_FS_CONFIG_s3_REGION: cdk.Aws.REGION,
        ASSET_FS_CONFIG_s3_URL_FORMAT: "public",
        PGDATABASE: "bloom",
      },
      entryPoint: [],
      portMappings: [
        {
          containerPort: 3100,
          protocol: Protocol.TCP,
          hostPort: 3100,
        },
      ],
    })

    // Create the service in ECS
    const service = new FargateService(this, `doorway-${props.environment}-internal-api`, {
      taskDefinition: task,
      serviceName: `doorway-${props.environment}-internal-api`,
      cluster: Cluster.fromClusterAttributes(this, "ecsCluster", {
        clusterName: Fn.importValue(`doorway-ecs-cluster-${props.environment}`),
        vpc: vpc,
      }),
      vpcSubnets: {
        subnets: appSubnets,
      },
      securityGroups: [appTierPrivateSG],
      desiredCount: 3,
    })

    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10,
    })
    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    })
  }
}
