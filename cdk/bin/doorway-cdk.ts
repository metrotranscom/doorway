#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"

import { DoorwayBuildPipelineStack } from "../lib/build-pipeline/doorway-build-pipeline-stack"

const app = new cdk.App()

new DoorwayBuildPipelineStack(app, "DoorwayBuildPipelineStack", {
  githubSecret: "mtc/githubSecret",
  dockerHubSecret: "mtc/dockerHub",
})
