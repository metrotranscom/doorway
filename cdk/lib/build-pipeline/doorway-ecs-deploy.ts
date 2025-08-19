import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

// Removed fs and YAML imports since we're using BuildSpec.fromSourceFilename

export interface DoorwayECSDeployProps {
  ecrNamespace?: string
  databaseName?: string
  environment: string
  buildspec: string
  source: Artifact
  buildRole: Role
}

export class DoorwayECSDeploy {
  public readonly action: CodeBuildAction
  constructor(scope: Construct, id: string, props: DoorwayECSDeployProps) {
    const project = new PipelineProject(scope, `doorway-dbMigrate-${props.environment}`, {
      buildSpec: BuildSpec.fromSourceFilename(props.buildspec),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.LARGE,
        privileged: true, // Required for Docker commands
      },

      role: props.buildRole,
    })
    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-ECSDeploy`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
    })
  }
}
