import { Aws } from "aws-cdk-lib"
import { BuildSpec, Cache, ComputeType, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs/lib/construct"
import fs from "fs"
import * as YAML from "yaml"

export interface DoorwayDockerBuildProps {
  buildspec: string
  imageName: string
  source: Artifact
  dockerHubSecret: string
  buildRole: Role
  environment: string
}

export class DoorwayDockerBuild {
  public readonly action: CodeBuildAction

  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    // Create ECR repository
    const repo = new Repository(scope, `${id}-ECRRepository`, {
      repositoryName: `doorway/${props.imageName}`,
    })

    // Grant permissions to the provided role
    repo.grantPullPush(props.buildRole)

    // Create the CodeBuild project
    const project = new PipelineProject(scope, `${id}-Project`, {
      buildSpec: BuildSpec.fromObject(YAML.parse(fs.readFileSync(props.buildspec, "utf8"))),
      environment: {
        computeType: ComputeType.LARGE,
      },
      environmentVariables: {
        ECR_REGION: { value: Aws.REGION },
        ECR_ACCOUNT_ID: { value: Aws.ACCOUNT_ID },
        ECR_NAMESPACE: { value: "doorway" },
        IMAGE_NAME: { value: props.imageName },
        DOCKER_HUB_SECRET_ARN: { value: props.dockerHubSecret },
        ENVIRONMENT: { value: props.environment },
      },
      role: props.buildRole,
      cache: Cache.none(),
    })

    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-DockerBuild`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
    })
  }
}
