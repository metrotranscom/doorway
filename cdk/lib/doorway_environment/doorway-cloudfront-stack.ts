import { Duration, Fn, Stack, StackProps } from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { AllowedMethods, CachePolicy, Distribution, OriginRequestPolicy, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as dotenv from 'dotenv';
import * as path from 'path';

export interface CloudFrontCertStackProps extends StackProps {
  environment: string;
  publicDomainName: string;
  partnersDomainName: string;
  loadBalancerDnsName?: string;
}

export class DoorwayCloudFrontStack extends Stack {
  public cloudFrontCertArn: string;
  constructor(scope: Construct, id: string, environment: string) {
    super(scope, id, {
      env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT || "364076391763",
      },
      crossRegionReferences: true
    });
    console.log(`Creating Application stack for ${environment}`)
    console.log(`Using environment file: ${path.resolve(__dirname, `../../${environment}.env`)}`)



    dotenv.config({
      path: path.resolve(__dirname, `../../${environment}.env`),
      override: true
    })
    console.log(process.env)




    const dnsZone = HostedZone.fromLookup(this, `publicDnsZone-${environment}`, {
      domainName: "housingbayarea.mtc.ca.gov",
    });
    const publicDomainName = process.env.PUBLIC_PORTAL_DOMAIN || `${environment}.housingbayarea.mtc.ca.gov`
    const partnersDomainName = process.env.PARTNERS_PORTAL_DOMAIN || `partners.${environment}.housingbayarea.mtc.ca.gov`


    const cert = new Certificate(this, "CloudFrontCertificate", {
      domainName: publicDomainName,
      validation: CertificateValidation.fromDns(dnsZone),
      subjectAlternativeNames: [partnersDomainName]
    });

    // Get load balancer DNS from SSM parameter (cross-region compatible)
    const loadBalancerDnsName = StringParameter.fromStringParameterName(
      this, 
      `lb-dns-param-${environment}`, 
      `/doorway/${environment}/public-lb-dns`
    ).stringValue;
    
    const cfOrigin = new LoadBalancerV2Origin(ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, `PublicLB-${environment}`, {
      loadBalancerArn: `arn:aws:elasticloadbalancing:us-west-2:364076391763:loadbalancer/app/doorway-lbs-${environment}/dummy`,
      securityGroupId: 'sg-dummy',
      loadBalancerDnsName: loadBalancerDnsName
    }))
    const cachePolicy = new CachePolicy(this, `CachePolicy-images-${environment}`, {
      cachePolicyName: `CachePolicy-images-${environment}`,
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

    new Distribution(this, `CloudFront-${environment}`, {
      domainNames: [publicDomainName, partnersDomainName],
      certificate: cert,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      enableIpv6: true,


      defaultRootObject: "",
      logIncludesCookies: true,
      logFilePrefix: "cloudfront",

      comment: `Doorway Cloudfront for ${environment}`,

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
    this.cloudFrontCertArn = cert.certificateArn;
    // Only create CloudFront A records if environment variable is set



  }
}
