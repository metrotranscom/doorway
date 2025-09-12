import { BuildSpec, Cache, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

// Removed fs and YAML imports since we're using BuildSpec.fromSourceFilename

export interface DoorwayECSDeployProps {
  environment: string
  buildspec: string
  source: Artifact
  buildRole: Role
}

export class DoorwayECSDeploy {
  public readonly action: CodeBuildAction
  constructor(scope: Construct, id: string, props: DoorwayECSDeployProps) {
    const project = new PipelineProject(scope, `doorway-ecsDeploy-${props.environment}`, {
      buildSpec: BuildSpec.fromSourceFilename(props.buildspec),
      environmentVariables: {
        ENVIRONMENT: {
          value: props.environment,
        },
      },
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.LARGE,
        privileged: true, // Required for Docker commands
      },

      role: props.buildRole,
      cache: Cache.none(),
    })
    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-ECSDeploy`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
      runOrder: 2,
    })
  }
}
