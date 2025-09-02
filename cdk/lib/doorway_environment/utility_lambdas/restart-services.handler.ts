import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";
import { EventBridgeEvent } from "aws-lambda";

import { ServiceRestartDetail } from "./restart-services-lambda";

export const handler = async function (event: EventBridgeEvent<string, ServiceRestartDetail>) {
  const serviceName = process.env.SERVICE_NAME;
  const cluster = process.env.CLUSTER_NAME;
  const ecsClient = new ECSClient({ region: process.env.AWS_REGION })
  const restart = new UpdateServiceCommand(
    {
      service: serviceName,
      forceNewDeployment: true,
      cluster: cluster,
    }
  )
  try {
    const response = await ecsClient.send(restart);
    console.log("Service updated successfully:", response.service?.serviceArn);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Service is restarting" }),
    };
  } catch (error) {
    console.error("Error updating service:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Service Restart Failed!" }),
    };
  }

}