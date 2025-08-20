import { Fn } from "aws-cdk-lib"
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager"
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { AwsLogDriver, Cluster, ContainerImage, Secret } from "aws-cdk-lib/aws-ecs"
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns"
import { SslPolicy } from "aws-cdk-lib/aws-elasticloadbalancingv2"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { PublicHostedZone } from "aws-cdk-lib/aws-route53"
import * as secret from "aws-cdk-lib/aws-secretsmanager"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

import { DoorwayServiceProps } from "./doorway-service-props"
import { DoorwayService } from "./doorway_services"

export class DoorwayPublicSite extends DoorwayService {
  constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    super(scope, id, props)
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
      NEXTJS_PORT: process.env.PUBLIC_PORT || "3000",
      NODE_ENV: process.env.NODE_ENV || "development",
      NOTIFICATIONS_SIGNUP_URL:
        process.env.NOTIFICATIONS_SIGNUP_URL ||
        "https://public.govdelivery.com/accounts/CAMTC/signup/36832",
      SHOW_ALL_MAP_PINS: process.env.SHOW_ALL_MAP_PINS || "true",
      SHOW_PROFESSIONAL_PARTNERS: process.env.SHOW_PROFESSIONAL_PARTNERS || "true",
    }
    const secrets: { [key: string]: Secret } = {}
    process.env.PUBLIC_SITE_SECRETS ||
      "".split(",").forEach((secretName) => {
        secrets[secretName] = Secret.fromSecretsManager(
          secret.Secret.fromSecretNameV2(scope, secretName, `/doorway/${secretName}`),
        )
      })

    const hostedZone = PublicHostedZone.fromHostedZoneAttributes(
      scope,
      `doorway-public-hosted-zone-${props.environment}`,
      {
        hostedZoneId: StringParameter.valueForStringParameter(scope, `/doorway/public-hosted-zone`),
        zoneName: `housingbayarea.mtc.ca.gov`,
      },
    )
    const cert = new Certificate(scope, "doorwayPublicCert", {
      domainName:
        process.env.PUBLIC_DOMAIN_NAME || `${props.environment}.housingbayarea.mtc.ca.gov`,
      validation: {
        method: CertificateValidation.fromDns().method,
        props: {
          hostedZone: hostedZone,
        },
      },
    })

    const publicService = new ApplicationLoadBalancedFargateService(
      scope,
      `doorway-public-portal-service-${props.environment}`,
      {
        cluster: Cluster.fromClusterAttributes(scope, `doorway-ecs-cluster-${props.environment}`, {
          clusterName: `doorway-ecs-cluster-${props.environment}`,
          vpc: Vpc.fromVpcAttributes(scope, "vpc", {
            vpcId: Fn.importValue(`doorway-vpc-id-${props.environment}`),
            availabilityZones: Fn.importValue(`doorway-azs-${props.environment}`).split(","),
            publicSubnetIds: [
              Fn.importValue(`doorway-public-subnet-1-${props.environment}`),
              Fn.importValue(`doorway-public-subnet-2-${props.environment}`),
            ],
          }),
          securityGroups: [
            SecurityGroup.fromSecurityGroupId(
              scope,
              `doorway-app-sg-${props.environment}`,
              Fn.importValue(`doorway-app-sg-${props.environment}`),
            ),
          ],
        }),
        taskSubnets: {
          subnets: [
            Subnet.fromSubnetId(
              scope,
              `doorway-app-subnet-1-${props.environment}`,
              Fn.importValue(`doorway-app-subnet-1-${props.environment}`),
            ),
            Subnet.fromSubnetId(
              scope,
              `doorway-app-subnet-2-${props.environment}`,
              Fn.importValue(`doorway-app-subnet-2-${props.environment}`),
            ),
          ],
        },

        assignPublicIp: true,
        publicLoadBalancer: true,
        taskImageOptions: {
          image: ContainerImage.fromEcrRepository(
            Repository.fromRepositoryName(
              scope,
              `doorway-public-portal-repo-${props.environment}`,
              `doorway/public`,
            ),
            "run-f21478f5",
          ),
          enableLogging: true,
          containerPort: 3000,
          executionRole: this.executionRole,
          taskRole: this.executionRole,
          secrets: secrets,
          environment: environmentVariables,
          logDriver: AwsLogDriver.awsLogs({
            streamPrefix: "doorway-public-portal",
            logGroup: new LogGroup(scope, `doorway-${props.environment}-tasks`, {
              logGroupName: `doorway-${props.environment}-tasks`,
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
      },
    )

    // Configure Service Connect on the underlying Fargate service
    const cfnService = publicService.service.node.defaultChild as any
    cfnService.serviceConnectConfiguration = {
      enabled: true,
      namespace: `doorway-${props.environment}-internal-api`,
      services: [
        {
          clientAliases: [
            {
              dnsName: `backend.${props.environment}.housingbayarea.int`,
              port: 3100,
            },
          ],
        },
      ],
    }
  }
}
