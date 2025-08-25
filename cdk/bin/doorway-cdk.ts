#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"

import { DoorwayBuildPipelineStack } from "../lib/build-pipeline/doorway-build-pipeline-stack"
import { DoorwayAppEnvironmentStack } from "../lib/doorway_environment/doorway-app-environment-stack"
/**
 * This script is really just a wrapper to execute the various
 * stacks that make up the Doorway Application infrastructure and build pipeline.
 **/
const app = new cdk.App()

new DoorwayBuildPipelineStack(app, "DoorwayBuildPipelineStack", {
  githubSecret: "mtc/githubSecret",
  dockerHubSecret: "mtc/dockerHub",
})
new DoorwayAppEnvironmentStack(app, "DoorwayAppEnvironmentStack")
