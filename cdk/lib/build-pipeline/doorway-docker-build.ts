import { Aws } from "aws-cdk-lib"
import { BuildSpec, Cache, ComputeType, PipelineProject } from "aws-cdk-lib/aws-codebuild"
import { Artifact } from "aws-cdk-lib/aws-codepipeline"
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs/lib/construct"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import * as YAML from "yaml"

export interface DoorwayDockerBuildProps {
  buildspec: string
  imageName: string
  source: Artifact
  dockerHubSecret: string
  buildRole: Role
  environment: string
}
class DoorwayDockerBuild {
  public readonly action: CodeBuildAction
  protected environmentVariables: { [name: string]: { value: string } }




  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    console.log(`Creating Application stack for ${props.environment}`)
    console.log(`Using environment file: ${path.resolve(__dirname, `../../${props.environment}.env`)}`)


    dotenv.config({
      path: path.resolve(__dirname, `../../${props.environment}.env`),
      override: true
    })
    // Create ECR repository


    this.environmentVariables = {
      ECR_REGION: { value: Aws.REGION },
      ECR_ACCOUNT_ID: { value: Aws.ACCOUNT_ID },
      ECR_NAMESPACE: { value: "doorway" },
      IMAGE_NAME: { value: props.imageName },
      DOCKER_HUB_SECRET_ARN: { value: props.dockerHubSecret },
      ENVIRONMENT: { value: props.environment },
      BACKEND_API_BASE: { value: process.env.BACKEND_API_BASE || `http://backend.${props.environment}.housingbayarea.int` },
      CACHE_REVALIDATE: { value: process.env.CACHE_REVALIDATE || "30" },
      LANGUAGES: {
        value: process.env.LANGUAGES || "en,es,zh,vi,tl"
      },
      MAPBOX_TOKEN: { value: process.env.MAPBOX_TOKEN || "" }

    }


    // Create the CodeBuild project
    const project = new PipelineProject(scope, `${id}-Project`, {
      buildSpec: BuildSpec.fromObject(YAML.parse(fs.readFileSync(props.buildspec, "utf8"))),
      environment: {
        computeType: ComputeType.LARGE,
      },
      environmentVariables: this.environmentVariables,
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

export class PartnersDockerBuild extends DoorwayDockerBuild {
  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    super(scope, id, props)
    if (props.environment.startsWith("dev")) {
      // Grant permissions to the provided role
      const repo = new Repository(scope, `${id}-ECRRepository`, {
        repositoryName: `doorway/${props.imageName}`,
      })
      repo.grantPullPush(props.buildRole)
    }
    this.environmentVariables.FEATURE_LISTINGS_APPROVAL = { value: process.env.FEATURE_LISTINGS_APPROVAL || "true" }
    this.environmentVariables.USE_SECURE_DOWNLOAD_PATHWAY = { value: process.env.USE_SECURE_DOWNLOAD_PATHWAY || "true" }
    this.environmentVariables.CLOUDINARY_CLOUD_NAME = { value: process.env.CLOUDINARY_CLOUD_NAME || "exygy" }
  }
}
export class PublicDockerBuild extends DoorwayDockerBuild {
  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    super(scope, id, props)
    if (props.environment.startsWith("dev")) {
      // Grant permissions to the provided role
      const repo = new Repository(scope, `${id}-ECRRepository`, {
        repositoryName: `doorway/${props.imageName}`,
      })
      repo.grantPullPush(props.buildRole)
    }
    this.environmentVariables.SHOW_PROFESSIONAL_PARTNERS = { value: process.env.SHOW_PROFESSIONAL_PARTNERS || "true" }
    this.environmentVariables.BLOOM_API_BASE = { value: process.env.BLOOM_API_BASE || "" }
    this.environmentVariables.JURISDICTION_NAME = {
      value: process.env.JURISDICTION_NAME || "Bay Area"
    }
    this.environmentVariables.MAINTENANCE_WINDOW = { value: process.env.MAINTENANCE_WINDOW || "2024-08-07 10:00 -07:00,2024-08-08 8:00 -07:00" }
    this.environmentVariables.SITE_MESSAGE_WINDOW = { value: process.env.SITE_MESSAGE_WINDOW || "2025-05-05 10:00,2025-08-08 8:00" }
    this.environmentVariables.NOTIFICATIONS_SIGN_UP_URL = { value: process.env.NOTIFICATIONS_SIGN_UP_URL || "https://public.govdelivery.com/accounts/CAMTC/signup/36832" }
    this.environmentVariables.GTM_KEY = { value: process.env.GTM_KEY || "" }
  }
}
export class BackendDockerBuild extends DoorwayDockerBuild {
  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    super(scope, id, props)
    const repo = new Repository(scope, `${id}-ECRRepository`, {
      repositoryName: `doorway/${props.imageName}`,
    })

    // Grant permissions to the provided role
    repo.grantPullPush(props.buildRole)

  }
}
export class ImportDockerBuild extends DoorwayDockerBuild {
  constructor(scope: Construct, id: string, props: DoorwayDockerBuildProps) {
    super(scope, id, props)
    const repo = new Repository(scope, `${id}-ECRRepository`, {
      repositoryName: `doorway/${props.imageName}`,
    })
    // Grant permissions to the provided role
    repo.grantPullPush(props.buildRole)

  }
}