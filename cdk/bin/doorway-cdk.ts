import * as cdk from "aws-cdk-lib"
import { DoorwayBuildPipelineStack } from "../lib/build-pipeline/doorway-build-pipeline-stack"
import { DoorwayAppEnvironmentStack } from "../lib/doorway_environment/doorway-app-environment-stack"
import { DoorwayCloudFrontStack } from "../lib/doorway_environment/doorway-cloudfront-stack"

/**
 * This script is really just a wrapper to execute the various
 * stacks that make up the Doorway Application infrastructure and build pipeline.
 **/
const app = new cdk.App()
const environment = process.env.ENVIRONMENT || "dev2"


/** This stack creates the doorway application build pipeline **/
new DoorwayBuildPipelineStack(app, "DoorwayBuildPipelineStack", {
  githubSecret: "mtc/githubSecret",
  dockerHubSecret: "mtc/dockerHub",
})
/** This stack creates the cert used by the cloudfront distribution. It sits in it's own stack because cloudfront certs have to be created in us-east-1  **/
const cfCertStack = new DoorwayCloudFrontStack(app, `DoorwayCloudFrontStack-${environment}`, environment)

/** This  stack actually creates a doorway environment. */

new DoorwayAppEnvironmentStack(app, `DoorwayAppEnvironmentStack-${environment}`, environment)

