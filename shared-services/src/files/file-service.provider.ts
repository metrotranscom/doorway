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
    this.validate(fileProviderConfig)
    switch (fileProviderConfig.publicService.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        this.publicUploadService = new CloudinaryFileService(
          new CloudinaryFileUploader(),
          fileProviderConfig.publicService.cloudinaryConfig
        )
        break
      case FileServiceTypeEnum.aws_s3:
        this.publicUploadService = new AwsS3FileService(
          new AwsS3FileUploader(),
          fileProviderConfig.publicService.awsS3Config,
          new S3Client({})
        )
        break
      default:
        throw new Error("Unknown file service type for public service")
    }
    switch (fileProviderConfig.privateService.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        this.privateUploadService = new CloudinaryFileService(
          new CloudinaryFileUploader(),
          fileProviderConfig.privateService.cloudinaryConfig
        )
        break
      case FileServiceTypeEnum.aws_s3:
        this.privateUploadService = new AwsS3FileService(
          new AwsS3FileUploader(),
          fileProviderConfig.privateService.awsS3Config,
          new S3Client({})
        )
        break
      default:
        throw new Error("Unknown file service type for private service")
    }
  }

  private static validate(fileProviderConfig: FileProviderConfig): void {
    if (this.privateUploadService !== undefined || this.publicUploadService !== undefined) {
      console.log("File service is already configured")
      return
    }
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
  }

  public static getPublicUploadService(): FileServiceInterface {
    return this.publicUploadService
  }

  public static getPrivateUploadService(): FileServiceInterface {
    return this.privateUploadService
  }
}
