import { aws_ec2, Duration, Fn } from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { ISubnet, Subnet } from "aws-cdk-lib/aws-ec2";
import { ApplicationListenerRule, ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, ListenerAction, ListenerCondition, TargetType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import { DoorwayLoadBalancerProps } from "./doorway-props";

export class DoorwayPublicLoadBalancer {
  public loadBalancer: ApplicationLoadBalancer
  constructor(scope: Construct, id: string, props: DoorwayLoadBalancerProps) {

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
    const dnsZone = StringParameter.fromStringParameterName(scope, `publicDnsZoneId-${props.environment}`, `/doorway/public-hosted-zone`).stringValue;
    new ARecord(scope, `publicDnsName-${props.environment}`, {
      zone: HostedZone.fromHostedZoneAttributes(scope, `publicDnsZone-${props.environment}`, {
        hostedZoneId: dnsZone,
        zoneName: 'housingbayarea.mtc.ca.gov',
      }),
      recordName: process.env.PUBLIC_PORTAL_DOMAIN || `public.${props.environment}.housingbayarea.mtc.ca.gov`,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(this.loadBalancer, {
        evaluateTargetHealth: true
      }))
    })
    const httpListener = this.loadBalancer.addListener("HttpListener", {
      port: 80,
      open: true,
    });
    const httpsListener = this.loadBalancer.addListener("HttpsListener", {
      port: 443,
      open: true,
      certificates: [new Certificate(scope, "PublicCertificate", {
        domainName: process.env.PUBLIC_PORTAL_DOMAIN || `public.${props.environment}.housingbayarea.mtc.ca.gov`,
        validation: CertificateValidation.fromDns()
      })]
    });
    httpListener.addAction("DefaultAction", {
      action: ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true,

      }),
    })
    httpsListener.addAction("DefaultAction", {
      action: ListenerAction.fixedResponse(200, {
        contentType: "text/plain",
        messageBody: "OK",
      })
    })
    new ApplicationListenerRule(scope, "PublicDomainRule", {
      listener: httpsListener,
      priority: 1,
      action: ListenerAction.forward([new ApplicationTargetGroup(scope, "PublicTargetGroup", {
        port: Number(process.env.PUBLIC_PORTAL_PORT) || 3000,
        protocol: ApplicationProtocol.HTTP,
        vpc: vpc,
        targetGroupName: `public-tg-${props.environment}`,
        targetType: TargetType.IP,
        targets: [props.publicService],
        healthCheck: {
          enabled: true,
          healthyThresholdCount: 2,
          interval: Duration.seconds(10),
          path: "/",
          timeout: Duration.seconds(5),
          unhealthyThresholdCount: 2,
        },
      })]),
      conditions: [ListenerCondition.hostHeaders([process.env.PUBLIC_PORTAL_DOMAIN || `public.${props.environment}.housingbayarea.mtc.ca.gov`])
      ]


    });
  }
}