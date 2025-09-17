import { CfnOutput, Stack } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { DoorwayProps } from "../doorway-props";

export class DoorwayS3Stack extends Stack {
  constructor(scope: Construct, id: string, props: DoorwayProps) {
    super(scope, id);

    const secureUploadsBucket = new Bucket(this, "secureUploadsBucket", {
      bucketName: `doorway-secure-uploads-${props.environment}`,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      enforceSSL: true,
    });


    // Output the bucket name
    new CfnOutput(this, "SecureBucketName", {
      exportName: `doorway-secure-uploads-${props.environment}`,
      value: secureUploadsBucket.bucketArn,
      description: `Doorway Secure Uploads Bucket ARN for the ${props.environment} environment`,
    });
    const publicUploadsBucket = new Bucket(this, "publicUploadsBucket", {
      bucketName: `doorway-public-uploads-${props.environment}`,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      enforceSSL: true,
    });
    publicUploadsBucket.grantPublicAccess();
    publicUploadsBucket.addCorsRule({
      allowedMethods: [
        HttpMethods.GET
      ],
      allowedOrigins: [
        `https://${process.env.PUBLIC_PORTAL_DOMAIN || `${props.environment}.housingbayarea.mtc.ca.gov`}`,
      ],
      allowedHeaders: ["*"],
      exposedHeaders: [],
    })

    // Output the bucket name
    new CfnOutput(this, "PublicBucketName", {
      exportName: `doorway-public-uploads-${props.environment}`,
      value: publicUploadsBucket.bucketArn,
      description: `Doorway Public Uploads Bucket ARN for the ${props.environment} environment`,
    });
  }
}
