import { Aws, Fn, Stack } from "aws-cdk-lib"
import {
  BuildSpec,
  ComputeType,
  LinuxBuildImage,
  PipelineProject,
  PipelineProjectProps,
} from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2"
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"

// Removed fs and YAML imports since we're using BuildSpec.fromSourceFilename

export interface DoorwayBuildJobProps {
  ecrNamespace?: string
  databaseName?: string
  buildInVpc?: boolean
  environment: string
  buildspec: string
  source: Artifact
}

export class DoorwayBuildJobBase {
  public readonly action: CodeBuildAction
  constructor(stack: Stack, id: string, props: DoorwayBuildJobProps) {
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)

    const buildRole = new Role(stack, "doorway-app-build-role", {
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
              actions: ["ecr:*"],
              resources: [`arn:aws:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/*`],
            }),
            new PolicyStatement({
              actions: ["secretsmanager:GetSecretValue"],
              resources: [dbSecretArn],
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
    let projectProps: PipelineProjectProps = {
      buildSpec: BuildSpec.fromSourceFilename(props.buildspec),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.LARGE,
        privileged: true, // Required for Docker commands
      },
      environmentVariables: {
        DB_SECRET_ARN: { value: dbSecretArn },
        ECR_REGION: { value: Aws.REGION },
        ECR_ACCOUNT_ID: { value: Aws.ACCOUNT_ID },
        ECR_NAMESPACE: { value: props.ecrNamespace || "doorway" },
        PGDATABASE: { value: props.databaseName || "bloom" },
      },
      role: buildRole,
    }
    if (props.buildInVpc) {
      const vpcId = Fn.importValue(`doorway-vpc-id-${props.environment}`)
      const subnetId = Fn.importValue(`doorway-app-subnet-1-${props.environment}`)
      const securityGroupId = Fn.importValue(`doorway-app-sg-${props.environment}`)

      const azs = Fn.importValue(`doorway-azs-${props.environment}`).split(", ")
      const vpc = Vpc.fromVpcAttributes(stack, "vpc", {
        vpcId: vpcId,
        availabilityZones: azs,
      })
      const subnet = Subnet.fromSubnetAttributes(stack, "subnet", {
        subnetId: subnetId,
      })
      const sg = SecurityGroup.fromSecurityGroupId(stack, "sg", securityGroupId)
      projectProps = {
        ...projectProps,
        vpc: vpc,
        subnetSelection: { subnets: [subnet] },
        securityGroups: [sg],
      }
    }

    const project = new PipelineProject(
      stack,
      `doorway-dbMigrate-${props.environment}`,
      projectProps
    )
    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-DBMigrate`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
    })
  }
}
