#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"

import { DoorwayBuildPipelineStack } from "../lib/build-pipeline/doorway-build-pipeline-stack"
import { DoorwayAppEnvironmentStack } from "../lib/doorway_environment/doorway-app-environment-stack"

const app = new cdk.App()

new DoorwayBuildPipelineStack(app, "DoorwayBuildPipelineStack", {
  githubSecret: "mtc/githubSecret",
  dockerHubSecret: "mtc/dockerHub",
})
new DoorwayAppEnvironmentStack(app, "DoorwayAppEnvironmentStack")
