#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"

import { DoorwayBuildPipelineStack } from "../lib/build-pipeline/doorway-build-pipeline-stack"
import { DoorwayAppEnvironmentStack } from "../lib/doorway_environment/doorway-app-environment-stack"
import { DoorwayCloudFrontCertStack } from "../lib/doorway_environment/doorway-cloudfront-cert-stack"

/**
 * This script is really just a wrapper to execute the various
 * stacks that make up the Doorway Application infrastructure and build pipeline.
 **/
const app = new cdk.App()

const environment = process.env.ENVIRONMENT || "dev2"

new DoorwayBuildPipelineStack(app, "DoorwayBuildPipelineStack", {
  githubSecret: "mtc/githubSecret",
  dockerHubSecret: "mtc/dockerHub",
})

const cfCertStack = new DoorwayCloudFrontCertStack(app, `DoorwayCloudFrontCertStack-${environment}`, {
  environment,
  publicDomainName: process.env.PUBLIC_PORTAL_DOMAIN || `${environment}.housingbayarea.mtc.ca.gov`,
  partnersDomainName: process.env.PARTNERS_PORTAL_DOMAIN || `partners.${environment}.housingbayarea.mtc.ca.gov`,
})

new DoorwayAppEnvironmentStack(app, "DoorwayAppEnvironmentStack", {
  cfCertArn: cfCertStack.cloudFrontCertArn,
})

