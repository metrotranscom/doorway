import { Stack, StackProps } from "aws-cdk-lib"
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline"
import { GitHubSourceAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"
import { Construct } from "constructs"

import { DoorwayDatabaseMigrate } from "./doorway-database-migrate"
import { DoorwayDockerBuild } from "./doorway-docker-build"

export class DoorwayBuildPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props)

    // No need to create a repository for docker-hub if using pull-through cache
    // The pull-through cache repository should already be configured in the AWS console

    const pipelineRole = new Role(this, "doorway-app-pipeline-role", {
      assumedBy: new ServicePrincipal("codepipeline.amazonaws.com"),
    })
    pipelineRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "cloudformation:*",
          "ec2:*",
          "ssm:*",
          "codebuild:*",
          "logs:*",
          "iam:AssumeRole",
          "iam:PassRole",
        ],
        resources: ["*"],
      })
    )

    const dockerSecret = Secret.fromSecretNameV2(
      this,
      "dockerSecret",
      props.dockerHubSecret
    ).secretArn

    const githubSecret = Secret.fromSecretNameV2(
      this,
      "githubSecret",
      props.githubSecret
    ).secretValue
    const pipeline = new Pipeline(this, "doorway-app-pipeline", {
      role: pipelineRole,
      pipelineName: "doorway-app-pipeline",
    })
    const sourceArtifact = new Artifact("SourceArtifact")
    const doorwaySource = new GitHubSourceAction({
      actionName: "Source",
      oauthToken: githubSecret,
      owner: "metrotranscom",
      repo: "doorway",
      branch: "feat/tf_to_cdk",
      output: sourceArtifact,
    })
    const configSourceArtifact = new Artifact("ConfigSourceArtifact")
    const doorwayConfigSource = new GitHubSourceAction({
      actionName: "ConfigSource",
      oauthToken: githubSecret,
      owner: "metrotranscom",
      repo: "doorway-config",
      branch: "feat/cdk-terraform",
      output: configSourceArtifact,
    })

    pipeline.addStage({
      stageName: "Source",
      actions: [doorwaySource, doorwayConfigSource],
    })
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new DoorwayDockerBuild(this, `doorway-backend`, {
          buildspec: "../ci/buildspec/build_backend.yml",
          imageName: "backend",
          source: sourceArtifact,
          configSource: configSourceArtifact,
          dockerHubSecret: dockerSecret,
        }).action,
        new DoorwayDockerBuild(this, "doorway-import-listings", {
          buildspec: "../ci/buildspec/build_import_listings.yml",
          imageName: "import-listings",
          source: sourceArtifact,
          configSource: configSourceArtifact,
          dockerHubSecret: dockerSecret,
        }).action,
        new DoorwayDockerBuild(this, `doorway-partners`, {
          buildspec: "../ci/buildspec/build_partners.yml",
          imageName: "partners",
          source: sourceArtifact,
          configSource: configSourceArtifact,
          dockerHubSecret: dockerSecret,
        }).action,
        new DoorwayDockerBuild(this, "doorway-public", {
          buildspec: "../ci/buildspec/build_public.yml",
          imageName: "public",
          source: sourceArtifact,
          configSource: configSourceArtifact,
          dockerHubSecret: dockerSecret,
        }).action,
      ],
    })
    pipeline.addStage({
      stageName: "Dev",
      actions: [
        new DoorwayDatabaseMigrate(this, "doorway-database-migrate-dev", {
          ecrNamespace: "doorway/backend",
          environment: "dev2",
          buildspec: "./ci/buildspec/migrate_stop_backend.yml",
          source: sourceArtifact,
        }).action,
      ],
    })
  }
}
export interface PipelineProps extends StackProps {
  githubSecret: string
  dockerHubSecret: string
}
