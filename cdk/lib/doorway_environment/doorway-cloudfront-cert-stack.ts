import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export interface CloudFrontCertStackProps extends StackProps {
  environment: string;
  publicDomainName: string;
  partnersDomainName: string;
}

export class DoorwayCloudFrontCertStack extends Stack {
  public cloudFrontCertArn: string;
  constructor(scope: Construct, id: string, props: CloudFrontCertStackProps) {
    super(scope, id, {
      ...props, env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT || "364076391763",
      },
      crossRegionReferences: true
    });

    const dnsZone = HostedZone.fromLookup(this, `publicDnsZone-${props.environment}`, {
      domainName: "housingbayarea.mtc.ca.gov",
    });

    const cert = new Certificate(this, "CloudFrontCertificate", {
      domainName: props.publicDomainName,
      validation: CertificateValidation.fromDns(dnsZone),
      subjectAlternativeNames: [props.partnersDomainName]
    });

    new CfnOutput(this, "CloudFrontCertArn", {
      value: cert.certificateArn,
      exportName: `doorway-cf-cert-arn-${props.environment}`,
      description: `CloudFront certificate ARN for ${props.environment}`,

    });
    this.cloudFrontCertArn = cert.certificateArn;
  }
}