import { Aws, Fn } from "aws-cdk-lib"
import { BuildSpec, Cache, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2"
import { PolicyStatement, Role } from "aws-cdk-lib/aws-iam"
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
    const ecsClusterName = `doorway-ecs-cluster-${props.environment}`
    const backendServiceName = `doorway-backend-${props.environment}`
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
        CLOUDINARY_CLOUD_NAME: { value: "exygy" },
        CACHE_REVALIDATE: { value: "60" },
        LANGUAGES: { value: "en,es,zh,vi,tl" },
        IDLE_TIMEOUT: { value: "5" },
        PGPORT: { value: "5432" },
        ECS_BACKEND_SERVICE: {
          value: backendServiceName,
        },
        ECS_BACKEND_CLUSTER: {
          value: ecsClusterName,
        },
        MIGRATION_CMD: {
          value: "db:reseed:ci",
        },
      },
      cache: Cache.none(),
    })

    // Grant permissions to the auto-created role
    Secret.fromSecretCompleteArn(scope, "dbSecret", dbSecretArn).grantRead(project.role!)
    project.addToRolePolicy(new PolicyStatement({
      actions: ["ecs:*", "ecr:*"],
      resources: ["*"]
    }))
    project.addToRolePolicy(new PolicyStatement({

      actions: ["secretsmanager:GetSecretValue"],
      resources: [
        `arn:aws:secretsmanager:${Aws.REGION}:${Aws.ACCOUNT_ID}:secret:mtc/dockerHub*`,
        `arn:aws:secretsmanager::${Aws.REGION}:${Aws.ACCOUNT_ID}:secret:doorwayDBSecret-*`,
      ],
    }))
    project.addToRolePolicy(new PolicyStatement({
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
    }))

    // Create the CodeBuild action
    this.action = new CodeBuildAction({
      actionName: `${id}-DBMigrate`,
      input: props.source,
      outputs: [new Artifact(`${id}-BuildOutput`)],
      project,
      runOrder: 1,
    })
  }
}
