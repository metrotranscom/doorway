import { CloudinaryFileService } from "./cloudinary-file.service"
import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import { FileServiceInterface } from "./file-service.interface"

export enum FileServiceTypeEnum {
  cloudinary = "cloudinary",
}

export interface CloudinaryConfig {
  cloudinaryCloudName: string
}

interface FileConfig {
  fileServiceType: FileServiceTypeEnum
  cloudinaryConfig: CloudinaryConfig
}

export class FileServiceProvider {
  service: FileServiceInterface

  private configure(): FileConfig {
    const fileConfig: FileConfig = {
      fileServiceType: FileServiceTypeEnum.cloudinary,
      cloudinaryConfig: {
        cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      },
    }
    return fileConfig
  }

  private create(): void {
    const fileConfig = this.configure()
    switch (fileConfig.fileServiceType) {
      case FileServiceTypeEnum.cloudinary:
        this.service = new CloudinaryFileService(
          new CloudinaryFileUploader(),
          fileConfig.cloudinaryConfig
        )
    }
  }

  public getService(): FileServiceInterface {
    if (this.service === undefined) {
      this.create()
    }
    return this.service
  }
}
