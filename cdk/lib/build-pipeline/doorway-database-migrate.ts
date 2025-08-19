import { Aws, Fn } from "aws-cdk-lib"
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2"
import { Role } from "aws-cdk-lib/aws-iam"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"
import { Construct } from "constructs"

// Removed fs and YAML imports since we're using BuildSpec.fromSourceFilename

export interface DoorwayDatabaseMigrateProps {
  ecrNamespace?: string
  databaseName?: string
  environment: string
  buildspec: string
  source: Artifact
  buildRole: Role
}

export class DoorwayDatabaseMigrate {
  public readonly action: CodeBuildAction
  constructor(scope: Construct, id: string, props: DoorwayDatabaseMigrateProps) {
    const vpcId = Fn.importValue(`doorway-vpc-id-${props.environment}`)
    const subnetId = Fn.importValue(`doorway-app-subnet-1-${props.environment}`)
    const securityGroupId = Fn.importValue(`doorway-app-sg-${props.environment}`)
    const dbSecretArn = Fn.importValue(`doorwayDBSecret-${props.environment}`)
    const azs = Fn.importValue(`doorway-azs-${props.environment}`).split(", ")
    const vpc = Vpc.fromVpcAttributes(scope, "vpc", {
      vpcId: vpcId,
      availabilityZones: azs,
    })
    const subnet = Subnet.fromSubnetAttributes(scope, "subnet", {
      subnetId: subnetId,
    })
    const sg = SecurityGroup.fromSecurityGroupId(scope, "sg", securityGroupId)
    Secret.fromSecretCompleteArn(scope, "dbSecret", dbSecretArn).grantRead(props.buildRole)

    const project = new PipelineProject(scope, `doorway-dbMigrate-${props.environment}`, {
      vpc: vpc,
      subnetSelection: { subnets: [subnet] },
      securityGroups: [sg],
      buildSpec: BuildSpec.fromSourceFilename(props.buildspec),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.LARGE,
        privileged: true, // Required for Docker commands
      },
      environmentVariables: {
        DB_CREDS_ARN: { value: dbSecretArn },
        ECR_REGION: { value: Aws.REGION },
        ECR_ACCOUNT_ID: { value: Aws.ACCOUNT_ID },
        ECR_NAMESPACE: { value: props.ecrNamespace || "doorway" },
        PGDATABASE: { value: props.databaseName || "bloom" },
        SKIP_MIGRATIONS: { value: "TRUE" }, // Set to true to skip migrations
      },
      role: props.buildRole,
    })
    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-DBMigrate`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
    })
  }
}
