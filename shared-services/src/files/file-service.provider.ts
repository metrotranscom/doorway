import { CloudinaryFileService } from "./cloudinary-file.service"
import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import { FileServiceInterface } from "./file-service.interface"
import {
  AwsS3FileServiceConfig,
  CloudinaryFileServiceConfig,
  FileProviderConfig,
  FileServiceTypeEnum,
} from "./file-service-config"
import { AwsS3FileService } from "./aws-s3-file.service"
import { AwsS3FileUploader } from "./aws-s3-file-uploader"
import { S3Client } from "@aws-sdk/client-s3"

export class FileServiceProvider {
  static publicUploadService: FileServiceInterface
  static privateUploadService: FileServiceInterface

  public static configure(fileProviderConfig: FileProviderConfig): void {
    if (this.privateUploadService !== undefined || this.publicUploadService !== undefined) {
      console.log("File service is already configured")
      return
    }
    this.validate(fileProviderConfig)
    switch (fileProviderConfig.publicService.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        // We explicitly have to check if the config is set, even if we have
        // already validated it above, otherwise the parameter we pass is of type
        // CloudinaryFileServiceConfig | undefined
        if (fileProviderConfig.publicService.cloudinaryConfig) {
          this.publicUploadService = new CloudinaryFileService(
            new CloudinaryFileUploader(),
            fileProviderConfig.publicService.cloudinaryConfig
          )
        } else {
          throw new Error("Cloudinary config should be specified")
        }
        break
      case FileServiceTypeEnum.aws_s3:
        if (fileProviderConfig.publicService.awsS3Config) {
          this.publicUploadService = new AwsS3FileService(
            new AwsS3FileUploader(),
            fileProviderConfig.publicService.awsS3Config,
            new S3Client({
              region: fileProviderConfig.publicService.awsS3Config.region,
              credentials: {
                accessKeyId: fileProviderConfig.publicService.awsS3Config.accessKey,
                secretAccessKey: fileProviderConfig.publicService.awsS3Config.secretKey,
              },
            })
          )
        } else {
          throw new Error("AWS S3 config should be specified")
        }
        break
      default:
        throw new Error("Unknown file service type for public service")
    }
    switch (fileProviderConfig.privateService.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        if (fileProviderConfig.privateService.cloudinaryConfig) {
          this.privateUploadService = new CloudinaryFileService(
            new CloudinaryFileUploader(),
            fileProviderConfig.privateService.cloudinaryConfig
          )
        } else {
          throw new Error("Cloudinary config should be specified")
        }
        break
      case FileServiceTypeEnum.aws_s3:
        if (fileProviderConfig.privateService.awsS3Config) {
          this.privateUploadService = new AwsS3FileService(
            new AwsS3FileUploader(),
            fileProviderConfig.privateService.awsS3Config,
            new S3Client({
              region: fileProviderConfig.privateService.awsS3Config.region,
              credentials: {
                accessKeyId: fileProviderConfig.privateService.awsS3Config.accessKey,
                secretAccessKey: fileProviderConfig.privateService.awsS3Config.secretKey,
              },
            })
          )
        } else {
          throw new Error("AWS S3 config should be specified")
        }
        break
      default:
        throw new Error("Unknown file service type for private service")
    }
    console.log("Configured file service with " + fileProviderConfig.publicService.fileServiceType)
  }

  private static validate(fileProviderConfig: FileProviderConfig): void {
    // Validate overall config
    if (fileProviderConfig.publicService === undefined) {
      throw new Error("Public service not defined")
    }
    if (fileProviderConfig.privateService === undefined) {
      throw new Error("Private service not defined")
    }
    if (
      (fileProviderConfig.privateService.fileServiceType !== FileServiceTypeEnum.cloudinary &&
        fileProviderConfig.privateService.fileServiceType !== FileServiceTypeEnum.aws_s3) ||
      (fileProviderConfig.publicService.fileServiceType !== FileServiceTypeEnum.cloudinary &&
        fileProviderConfig.publicService.fileServiceType !== FileServiceTypeEnum.aws_s3)
    ) {
      throw new Error("Only supported file services are cloudinary and AWS S3")
    }
    // Validate public service
    if (fileProviderConfig.publicService.fileServiceType === FileServiceTypeEnum.cloudinary) {
      if (fileProviderConfig.publicService.cloudinaryConfig === undefined) {
        throw new Error("Public service cloudinary config should be specified")
      }
      this.validateCloudinaryConfig(fileProviderConfig.publicService.cloudinaryConfig)
    } else {
      if (fileProviderConfig.publicService.awsS3Config === undefined) {
        throw new Error("Public service AWS S3 config should be specified")
      }
      this.validateAwsS3Config(fileProviderConfig.publicService.awsS3Config)
    }
    // Validate private service
    if (fileProviderConfig.privateService.fileServiceType === FileServiceTypeEnum.cloudinary) {
      if (fileProviderConfig.privateService.cloudinaryConfig === undefined) {
        throw new Error("Private service cloudinary config should be specified")
      }
      this.validateCloudinaryConfig(fileProviderConfig.privateService.cloudinaryConfig)
    } else {
      if (fileProviderConfig.privateService.awsS3Config === undefined) {
        throw new Error("Private service AWS S3 config should be specified")
      }
      this.validateAwsS3Config(fileProviderConfig.privateService.awsS3Config)
    }
  }

  private static validateCloudinaryConfig(
    cloudinaryFileServiceConfig: CloudinaryFileServiceConfig
  ): void {
    if (
      cloudinaryFileServiceConfig.cloudinaryCloudName === undefined ||
      cloudinaryFileServiceConfig.cloudinaryCloudName === ""
    ) {
      throw new Error("Cloudinary cloud name should be specified")
    }
  }

  private static validateAwsS3Config(awsS3FileServiceConfig: AwsS3FileServiceConfig): void {
    if (
      awsS3FileServiceConfig.bucketName === undefined ||
      awsS3FileServiceConfig.bucketName === ""
    ) {
      throw new Error("AWS S3 bucket name should be specified")
    }
    if (awsS3FileServiceConfig.region === undefined || awsS3FileServiceConfig.region === "") {
      throw new Error("AWS S3 region should be specified")
    }
    if (awsS3FileServiceConfig.accessKey === undefined || awsS3FileServiceConfig.accessKey === "") {
      throw new Error("AWS S3 access key should be specified")
    }
    if (awsS3FileServiceConfig.secretKey === undefined || awsS3FileServiceConfig.secretKey === "") {
      throw new Error("AWS S3 secret key should be specified")
    }
  }

  public static getPublicUploadService(): FileServiceInterface {
    return this.publicUploadService
  }

  public static getPrivateUploadService(): FileServiceInterface {
    return this.privateUploadService
  }
}
