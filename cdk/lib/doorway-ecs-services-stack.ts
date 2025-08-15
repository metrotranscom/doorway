import { Fn, Stack } from "aws-cdk-lib"
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager"
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { AwsLogDriver, Cluster, ContainerImage, Secret } from "aws-cdk-lib/aws-ecs"
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns"
import { SslPolicy } from "aws-cdk-lib/aws-elasticloadbalancingv2"
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { PublicHostedZone } from "aws-cdk-lib/aws-route53"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

import { DoorwayStackProps } from "./doorway-stack-props"

export class DoorwayEcsServicesStack extends Stack {
  constructor(scope: Construct, id: string, props: DoorwayStackProps) {
    super(scope, id, props)
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
    const hostedZone = PublicHostedZone.fromHostedZoneAttributes(
      this,
      `doorway-public-hosted-zone-${props.environment}`,
      {
        hostedZoneId: StringParameter.valueForStringParameter(this, `/doorway/public-hosted-zone`),
        zoneName: `housingbayarea.mtc.ca.gov`,
      }
    )
    const cert = new Certificate(this, "doorwayPublicCert", {
      domainName: `${props.environment}.housingbayarea.mtc.ca.gov`,
      validation: {
        method: CertificateValidation.fromDns().method,
        props: {
          hostedZone: hostedZone,
        },
      },
    })

    new ApplicationLoadBalancedFargateService(
      this,
      `doorway-public-portal-service-${props.environment}`,
      {
        cluster: Cluster.fromClusterAttributes(this, `doorway-ecs-cluster-${props.environment}`, {
          clusterName: `doorway-ecs-cluster-${props.environment}`,
          vpc: Vpc.fromVpcAttributes(this, "vpc", {
            vpcId: Fn.importValue(`doorway-vpc-id-${props.environment}`),
            availabilityZones: Fn.importValue(`doorway-azs-${props.environment}`).split(","),
            publicSubnetIds: [
              Fn.importValue(`doorway-public-subnet-1-${props.environment}`),
              Fn.importValue(`doorway-public-subnet-2-${props.environment}`),
            ],
          }),
          securityGroups: [
            SecurityGroup.fromSecurityGroupId(
              this,
              `doorway-app-sg-${props.environment}`,
              Fn.importValue(`doorway-app-sg-${props.environment}`)
            ),
          ],
        }),
        taskSubnets: {
          subnets: [
            Subnet.fromSubnetId(
              this,
              `doorway-app-subnet-1-${props.environment}`,
              Fn.importValue(`doorway-app-subnet-1-${props.environment}`)
            ),
            Subnet.fromSubnetId(
              this,
              `doorway-app-subnet-2-${props.environment}`,
              Fn.importValue(`doorway-app-subnet-2-${props.environment}`)
            ),
          ],
        },

        assignPublicIp: true,
        publicLoadBalancer: true,
        taskImageOptions: {
          image: ContainerImage.fromEcrRepository(
            Repository.fromRepositoryName(
              this,
              `doorway-public-portal-repo-${props.environment}`,
              `doorway/public`
            ),
            "run-f21478f5"
          ),
          enableLogging: true,
          containerPort: 3000,
          executionRole: executionRole,
          taskRole: executionRole,
          secrets: {
            BLOOM_API_BASE: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "BLOOM_API_BASE",
                `/doorway/${props.environment}/public-portal/BLOOM_API_BASE`
              )
            ),
            CACHE_REVALIDATE: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "CACHE_REVALIDATE",
                `/doorway/${props.environment}/public-portal/CACHE_REVALIDATE`
              )
            ),
            GOOGLE_API_KEY: Secret.fromSecretsManager(
              secret.Secret.fromSecretNameV2(this, "googleApiKey", "/doorway/GOOGLE_API_KEY")
            ),
            GOOGLE_MAPS_API_KEY: Secret.fromSecretsManager(
              secret.Secret.fromSecretNameV2(
                this,
                "googleMapsApiKey",
                "/doorway/GOOGLE_MAPS_API_KEY"
              )
            ),
            GOOGLE_MAPS_MAP_ID: Secret.fromSecretsManager(
              secret.Secret.fromSecretNameV2(this, "googleMapsMapId", "/doorway/GOOGLE_MAPS_MAP_ID")
            ),
            GTM_KEY: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "GTM_KEY",
                `/doorway/${props.environment}/public-portal/GTM_KEY`
              )
            ),
            IDLE_TIMEOUT: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "IDLE_TIMEOUT",
                `/doorway/${props.environment}/public-portal/IDLE_TIMEOUT`
              )
            ),
            JURISDICTION_NAME: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "JURISDICTION_NAME",
                `/doorway/${props.environment}/public-portal/JURISDICTION_NAME`
              )
            ),
            LANGUAGES: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "LANGUAGES",
                `/doorway/${props.environment}/public-portal/LANGUAGES`
              )
            ),
            LISTINGS_QUERY: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "LISTINGS_QUERY",
                `/doorway/${props.environment}/public-portal/LISTINGS_QUERY`
              )
            ),
            NEXTJS_PORT: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "NEXTJS_PORT",
                `/doorway/${props.environment}/public-portal/NEXTJS_PORT`
              )
            ),
            NOTIFICATIONS_SIGN_UP_URL: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "NOTIFICATIONS_SIGN_UP_URL",
                `/doorway/${props.environment}/public-portal/NOTIFICATIONS_SIGN_UP_URL`
              )
            ),
            SHOW_ALL_MAP_PINS: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "SHOW_ALL_MAP_PINS",
                `/doorway/${props.environment}/public-portal/SHOW_ALL_MAP_PINS`
              )
            ),
            SHOW_ALL_PROFESSIONAL_PARTNERS: Secret.fromSsmParameter(
              StringParameter.fromStringParameterName(
                this,
                "SHOW_PROFESSIONAL_PARTNERS",
                `/doorway/${props.environment}/public-portal/SHOW_PROFESSIONAL_PARTNERS`
              )
            ),
          },
          environment: {
            BACKEND_API_BASE: `http://backend.${props.environment}.housingbayarea.int`,
          },
          logDriver: AwsLogDriver.awsLogs({
            streamPrefix: "doorway-public-portal",
            logGroup: new LogGroup(this, `doorway-${props.environment}-tasks`, {
              logGroupName: `/doorway/${props.environment}/ecs/doorway-public-portal`,
            }),
          }),
        },

        certificate: cert,
        listenerPort: 443,
        redirectHTTP: true,
        sslPolicy: SslPolicy.RECOMMENDED,
        serviceName: `doorway-public-portal-service-${props.environment}`,
        loadBalancerName: `doorway-public-lb-${props.environment}`,
        cpu: 1024,
        memoryLimitMiB: 2048,
        domainName: `${props.environment}.housingbayarea.mtc.ca.gov`,
        domainZone: hostedZone,
      }
    )
  }
}
