import { SecretValue } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { DoorwayProps } from "../doorway-props";

export class DoorwaySecrets {
  constructor(scope: Construct, id: string, props: DoorwayProps) {

    new Secret(scope, "googleId", {
      secretName: `/doorway/${props.environment}/GOOGLE_API_ID`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "googleEmail", {
      secretName: `/doorway/${props.environment}/GOOGLE_API_EMAIL`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "googleKey", {
      secretName: `/doorway/${props.environment}/GOOGLE_API_KEY`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });
    new Secret(scope, "googleMapsKey", {
      secretName: `/doorway/${props.environment}/GOOGLE_MAPS_API_KEY`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });
    new Secret(scope, "googleMapsMapId", {
      secretName: `/doorway/${props.environment}/GOOGLE_MAPS_MAP_ID`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "govDeliveryURL", {
      secretName: `/doorway/${props.environment}/GOVDELIVERY_API_URL`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "govDeliveryPassword", {
      secretName: `/doorway/${props.environment}/GOVDELIVERY_PASSWORD`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "govDeliveryUsername", {
      secretName: `/doorway/${props.environment}/GOVDELIVERY_USERNAME`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });
    new Secret(scope, "emailApiKey", {
      secretName: `/doorway/${props.environment}/EMAIL_API_KEY`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "cloudinaryKey", {
      secretName: `/doorway/${props.environment}/CLOUDINARY_KEY`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });

    new Secret(scope, "cloudinarySecret", {
      secretName: `/doorway/${props.environment}/CLOUDINARY_SECRET`,
      secretStringValue: SecretValue.unsafePlainText("changeme"),
    });
  }
}