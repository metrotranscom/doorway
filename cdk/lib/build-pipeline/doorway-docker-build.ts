import { Stack } from "aws-cdk-lib"
import { BuildSpec, ComputeType, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import fs from "fs"
import * as YAML from "yaml"

export interface DoorwayDockerBuildProps {
  buildspec: string
  imageName: string
  source: Artifact
  configSource?: Artifact
  dockerHubSecret: string
}

export class DoorwayDockerBuild {
  public readonly action: CodeBuildAction

  constructor(stack: Stack, id: string, props: DoorwayDockerBuildProps) {
    // Create ECR repository
    const repo = new Repository(stack, `${id}-ECRRepository`, {
      repositoryName: `doorway/${props.imageName}`,
    })
    const role = new Role(stack, `${id}-doorway-app-build-role`, {
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
              resources: [`arn:aws:ecr:${stack.region}:${stack.account}:repository/*`],
            }),
            new PolicyStatement({
              actions: ["secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:mtc/dockerHub*`,
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
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    })

    // Grant permissions to the provided role
    repo.grantPullPush(role)

    // Create the CodeBuild project
    const project = new PipelineProject(stack, `${id}-Project`, {
      buildSpec: BuildSpec.fromObject(YAML.parse(fs.readFileSync(props.buildspec, "utf8"))),
      environment: {
        computeType: ComputeType.LARGE,
      },
      environmentVariables: {
        ECR_REGION: { value: stack.region },
        ECR_ACCOUNT_ID: { value: stack.account },
        ECR_NAMESPACE: { value: "doorway" },
        IMAGE_NAME: { value: props.imageName },
        DOCKER_HUB_SECRET_ARN: { value: props.dockerHubSecret },
      },
      role: role,
    })

    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-DockerBuild`,
      input: props.source,
      extraInputs: props.configSource ? [props.configSource] : undefined,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
    })
  }
}
