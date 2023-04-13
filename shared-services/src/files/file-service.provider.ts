import { CloudinaryFileService } from "./cloudinary-file.service"
import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import { FileServiceInterface } from "./file-service.interface"
import { FileConfig, FileServiceTypeEnum } from "./file-config"

export class FileServiceProvider {
  static publicUploadService: FileServiceInterface
  static privateUploadService: FileServiceInterface

  private static configure(): FileConfig {
    const fileConfig: FileConfig = {
      fileServiceType: FileServiceTypeEnum.cloudinary,
      cloudinaryConfig: {
        cloudinaryCloudName: process.env.cloudinaryCloudName || "",
        cloudinaryUploadPreset: process.env.cloudinarySignedPreset || "",
      },
    }
    return fileConfig
  }

  public static create(): void {
    const fileConfig = this.configure()
    switch (fileConfig.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        this.publicUploadService = new CloudinaryFileService(
          new CloudinaryFileUploader(),
          fileConfig.cloudinaryConfig
        )
        this.privateUploadService = new CloudinaryFileService(
          new CloudinaryFileUploader(),
          fileConfig.cloudinaryConfig
        )
        break
      default:
        throw new Error("Unknown file service type")
    }
  }

  public static getPublicUploadService(): FileServiceInterface {
    return this.publicUploadService
  }

  public static getPrivateUploadService(): FileServiceInterface {
    return this.privateUploadService
  }
}
