import { Stack, StackProps } from "aws-cdk-lib"
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline"
import { GitHubSourceAction, GitHubTrigger } from "aws-cdk-lib/aws-codepipeline-actions"
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"
import { Construct } from "constructs"

import { DoorwayDatabaseMigrate } from "./doorway-database-migrate"
import { DoorwayDockerBuild } from "./doorway-docker-build"
import { DoorwayECSDeploy } from "./doorway-ecs-deploy"

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
      }),
    )
    const buildRole = new Role(this, `${id}-doorway-app-build-role`, {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [
        {
          managedPolicyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess",
        },
        {
          managedPolicyArn: "arn:aws:iam::aws:policy/AmazonS3FullAccess",
        },
      ],
      inlinePolicies: {
        ECRPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchCheckLayerAvailability",
              ],
              resources: [`arn:aws:ecr:${this.region}:${this.account}:repository/*`],
            }),
            new PolicyStatement({
              actions: ["secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:mtc/dockerHub*`,
              ],
            }),
            new PolicyStatement({
              actions: [
                "cloudformation:*",
                "ec2:*",
                "ssm:*",
                "codebuild:*",
                "logs:*",
                "iam:AssumeRole",
                "iam:PassRole",
                "ecs:*",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    })

    const dockerSecret = Secret.fromSecretNameV2(
      this,
      "dockerSecret",
      props.dockerHubSecret,
    ).secretArn

    const githubSecret = Secret.fromSecretNameV2(
      this,
      "githubSecret",
      props.githubSecret,
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
      trigger: GitHubTrigger.WEBHOOK,
    })
    pipeline.addStage({
      stageName: "Source",
      actions: [doorwaySource],
    })
    pipeline.addStage({
      stageName: "Build-Dev",
      actions: [
        new DoorwayDockerBuild(this, `doorway-backend`, {
          buildspec: "../ci/buildspec/build_backend.yml",
          imageName: "backend",
          source: sourceArtifact,
          dockerHubSecret: dockerSecret,
          buildRole: buildRole,
          environment: "dev2"
        }).action,
        new DoorwayDockerBuild(this, "doorway-import-listings", {
          buildspec: "../ci/buildspec/build_import_listings.yml",
          imageName: "import-listings",
          source: sourceArtifact,
          dockerHubSecret: dockerSecret,
          buildRole: buildRole,
          environment: "dev2"
        }).action,
        new DoorwayDockerBuild(this, `doorway-partners`, {
          buildspec: "../ci/buildspec/build_partners.yml",
          imageName: "partners",
          source: sourceArtifact,
          dockerHubSecret: dockerSecret,
          buildRole: buildRole,
          environment: "dev2"
        }).action,
        new DoorwayDockerBuild(this, "doorway-public", {
          buildspec: "../ci/buildspec/build_public.yml",
          imageName: "public",
          source: sourceArtifact,
          dockerHubSecret: dockerSecret,
          buildRole: buildRole,
          environment: "dev2"
        }).action,
      ],
    })
    const dbmigrate = new DoorwayDatabaseMigrate(this, "doorway-database-migrate-dev", {
      environment: "dev2",
      buildspec: "./ci/buildspec/migrate_stop_backend.yml",
      source: sourceArtifact,
      buildRole: buildRole,
    }).action
    const ecsDeploy = new DoorwayECSDeploy(this, "doorway-ecs-deploy-dev", {
      buildspec: "./ci/buildspec/update_ecs.yml",
      source: sourceArtifact,
      buildRole: buildRole,
      environment: "dev2",
    }).action

    pipeline.addStage({
      stageName: "Dev",
      actions: [dbmigrate, ecsDeploy],
    })
  }
}
export interface PipelineProps extends StackProps {
  githubSecret: string
  dockerHubSecret: string
}
