import { aws_ec2, Duration, Fn } from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { AllowedMethods, CachePolicy, Distribution, OriginRequestPolicy, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ISubnet, Subnet } from "aws-cdk-lib/aws-ec2";
import { ApplicationListener, ApplicationListenerRule, ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, ListenerAction, ListenerCondition, TargetType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget, LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import { DoorwayProps } from "./doorway-props";

export class DoorwayLoadBalancers {
  public loadBalancer: ApplicationLoadBalancer
  public privateLoadBalancer: ApplicationLoadBalancer
  public publicTargetGroup: ApplicationTargetGroup;
  public partnersTargetGroup: ApplicationTargetGroup;
  public privateTargetGroup: ApplicationTargetGroup;
  constructor(scope: Construct, id: string, props: DoorwayProps) {

    // Get Network setup
    const vpcId = Fn.importValue(`doorway-vpc-id-${props.environment}`)
    const azs = Fn.importValue(`doorway-azs-${props.environment}`).split(",")
    const vpc = aws_ec2.Vpc.fromVpcAttributes(scope, `vpc-${id}`, {
      vpcId: vpcId,
      availabilityZones: azs,
    })
    const sgId = Fn.importValue(`doorway-public-sg-${props.environment}`)

    const sg = aws_ec2.SecurityGroup.fromSecurityGroupId(scope, `doorway-public-sg-${props.environment}`, sgId)
    const publicSubnetIds: string[] = []
    publicSubnetIds.push(Fn.importValue(`doorway-public-subnet-1-${props.environment}`))
    publicSubnetIds.push(Fn.importValue(`doorway-public-subnet-2-${props.environment}`))
    const publicsubnets: ISubnet[] = []
    publicSubnetIds.forEach((id) => {
      publicsubnets.push(Subnet.fromSubnetId(scope, id, id))
    })
    this.loadBalancer = new ApplicationLoadBalancer(scope, id, {
      vpc: vpc,
      internetFacing: true,
      loadBalancerName: id,
      securityGroup: sg,
      vpcSubnets: {
        subnets: publicsubnets,
      },

    });
    const dnsZoneName = StringParameter.fromStringParameterName(scope, `publicDnsZoneId-${props.environment}`, `/doorway/public-hosted-zone`).stringValue;
    const dnsZone = HostedZone.fromLookup(scope, `publicDnsZone-${props.environment}`, {
      domainName: "housingbayarea.mtc.ca.gov",
    });
    const publicDomainName = process.env.PUBLIC_PORTAL_DOMAIN || `${props.environment}.housingbayarea.mtc.ca.gov`
    const partnersDomainName = process.env.PARTNERS_PORTAL_DOMAIN || `partners.${props.environment}.housingbayarea.mtc.ca.gov`
    const backendDomainName = process.env.BACKEND_API_DOMAIN || `backend.${props.environment}.housingbayarea.int`
    const cert = new Certificate(scope, "PublicCertificate", {
      domainName: publicDomainName,
      validation: CertificateValidation.fromDns(dnsZone),
      subjectAlternativeNames: [partnersDomainName]
    })

    const cfCert = Certificate.fromCertificateArn(scope, "CloudFrontCertificate", props.cfCertArn);

    const httpListener = this.loadBalancer.addListener("HttpListener", {
      port: 80,
      open: true,
    });
    const httpsListener = new ApplicationListener(scope, "HttpsListener", {
      loadBalancer: this.loadBalancer,
      port: 443,
      certificates: [cert],
      protocol: ApplicationProtocol.HTTPS,
      open: true
    })
    httpListener.addAction("DefaultAction", {
      action: ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true,

      }),
    })
    httpsListener.addAction("DefaultAction", {
      action: ListenerAction.fixedResponse(403, {
        contentType: "text/plain",
        messageBody: "Forbidden",
      })
    })
    this.publicTargetGroup = new ApplicationTargetGroup(scope, "PublicTargetGroup", {
      port: Number(process.env.PUBLIC_PORTAL_PORT) || 3000,
      protocol: ApplicationProtocol.HTTP,
      vpc: vpc,
      targetGroupName: `public-tg-${props.environment}`,
      targetType: TargetType.IP,



      healthCheck: {
        enabled: true,
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
        path: "/",
        timeout: Duration.seconds(5),
        unhealthyThresholdCount: 2,
      },
    })
    new ApplicationListenerRule(scope, "PublicDomainRule", {
      listener: httpsListener,
      priority: 100,
      action: ListenerAction.forward([this.publicTargetGroup]),
      conditions: [ListenerCondition.hostHeaders([publicDomainName])
      ]
    });

    this.partnersTargetGroup = new ApplicationTargetGroup(scope, "PartnersTargetGroup", {
      port: Number(process.env.PUBLIC_PORTAL_PORT) || 3000,
      protocol: ApplicationProtocol.HTTP,
      vpc: vpc,
      targetGroupName: `partners-tg-${props.environment}`,
      targetType: TargetType.IP,
      healthCheck: {
        enabled: true,
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
        path: "/",
        timeout: Duration.seconds(5),
        unhealthyThresholdCount: 2,
      },
    })
    new ApplicationListenerRule(scope, "PartnersDomainRule", {
      listener: httpsListener,
      priority: 200,
      action: ListenerAction.forward([this.partnersTargetGroup]),
      conditions: [ListenerCondition.hostHeaders([partnersDomainName])
      ]
    });
    const cfOrigin = new LoadBalancerV2Origin(this.loadBalancer)
    const cachePolicy = new CachePolicy(scope, `CachePolicy-images-${props.environment}`, {
      cachePolicyName: `CachePolicy-images-${props.environment}`,
      enableAcceptEncodingGzip: false,
      enableAcceptEncodingBrotli: false,
      minTtl: Duration.seconds(60),
      maxTtl: Duration.seconds(31536000),
      defaultTtl: Duration.seconds(86400),
      headerBehavior: {
        behavior: "whitelist",
        headers: ["Host"],
      },
      queryStringBehavior: {
        behavior: "none",
      },
      cookieBehavior: {
        behavior: "none",
      },
    });

    const cloudfrontDist = new Distribution(scope, `CloudFront-${props.environment}`, {
      domainNames: [publicDomainName, partnersDomainName],
      certificate: cfCert,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      enableIpv6: true,


      defaultRootObject: "",
      logIncludesCookies: true,
      logFilePrefix: "cloudfront",

      comment: `Doorway Cloudfront for ${props.environment}`,

      priceClass: PriceClass.PRICE_CLASS_100,
      geoRestriction: {
        locations: ["US"],
        restrictionType: "whitelist"
      },


      defaultBehavior: {
        origin: cfOrigin,
        cachePolicy: CachePolicy.CACHING_DISABLED, // Disable caching
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER

      },
      additionalBehaviors: {
        "/images/*": {
          origin: cfOrigin,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: cachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,

        }
      }
    })
    new ARecord(scope, "PartnersARecord", {
      zone: dnsZone,
      recordName: partnersDomainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDist)),
    });
    new ARecord(scope, "PublicARecord", {
      zone: dnsZone,
      recordName: publicDomainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDist)),
    });

    const appSGId = Fn.importValue(`doorway-app-sg-${props.environment}`)

    const appSg = aws_ec2.SecurityGroup.fromSecurityGroupId(scope, `doorway-app-sg-${props.environment}`, appSGId)
    const appSubnetIds: string[] = []
    appSubnetIds.push(Fn.importValue(`doorway-public-subnet-1-${props.environment}`))
    appSubnetIds.push(Fn.importValue(`doorway-public-subnet-2-${props.environment}`))
    const appsubnets: ISubnet[] = []
    appSubnetIds.forEach((id) => {
      appsubnets.push(Subnet.fromSubnetId(scope, id, id))
    })

    this.privateLoadBalancer = new ApplicationLoadBalancer(scope, `private-${id}`, {
      vpc: vpc,
      internetFacing: false,
      loadBalancerName: `private-${id}`,
      securityGroup: appSg,
      vpcSubnets: {
        subnets: appsubnets,
      },

    });
    const httpListenerPrivate = this.privateLoadBalancer.addListener("PrivateListener", {

      port: 80,
      open: true,
      protocol: ApplicationProtocol.HTTP,

    })
    this.privateTargetGroup = new ApplicationTargetGroup(scope, "PrivateTargetGroup", {
      port: Number(process.env.BACKEND_API_PORT) || 3100,
      protocol: ApplicationProtocol.HTTP,
      vpc: vpc,

      targetGroupName: `private-tg-${props.environment}`,
      targetType: TargetType.IP,
      healthCheck: {
        enabled: true,
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
        path: "/",
        timeout: Duration.seconds(5),
        unhealthyThresholdCount: 2,
      },
    })
    httpListenerPrivate.addAction("DefaultAction", {
      action: ListenerAction.forward([this.privateTargetGroup]),
    })
    const privateDnsZoneName = StringParameter.fromStringParameterName(scope, `privateDnsZoneId-${props.environment}`, `/doorway/private-hosted-zone`).stringValue;


    const privateDnsZone = HostedZone.fromHostedZoneAttributes(scope, `privateDnsZone-${props.environment}`, {
      hostedZoneId: privateDnsZoneName,
      zoneName: "housingbayarea.int",
    });
    new ARecord(scope, "PrivateARecord", {
      zone: privateDnsZone,
      recordName: backendDomainName,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(this.privateLoadBalancer)),
    });



  }
}