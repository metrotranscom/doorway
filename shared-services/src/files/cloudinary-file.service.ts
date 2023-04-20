import { Injectable } from "@nestjs/common"
import { cloudinaryPdfFromId, cloudinaryUrlFromId } from "@bloom-housing/shared-helpers"
import { FileServiceInterface } from "./file-service.interface"
import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import { CloudinaryFileServiceConfig } from "./file-service-config"

@Injectable()
export class CloudinaryFileService implements FileServiceInterface {
  constructor(
    private readonly cloudinaryFileUploader: CloudinaryFileUploader,
    private readonly cloudinaryFileServiceConfig: CloudinaryFileServiceConfig
  ) {}

  async putFile(
    key: string,
    file: File,
    setProgressValue: (value: number) => void
  ): Promise<string> {
    const id = await this.cloudinaryFileUploader.uploadCloudinaryFile(
      file,
      setProgressValue,
      this.cloudinaryFileServiceConfig.cloudinaryCloudName,
      this.cloudinaryFileServiceConfig.cloudinaryUploadPreset
    )
    return id
  }
  getDownloadUrlForPhoto(id: string, size = 400): Promise<string> {
    return Promise.resolve(
      cloudinaryUrlFromId(id, this.cloudinaryFileServiceConfig.cloudinaryCloudName, size)
    )
  }
  getDownloadUrlForPdf(id: string): Promise<string> {
    return Promise.resolve(
      cloudinaryPdfFromId(id, this.cloudinaryFileServiceConfig.cloudinaryCloudName)
    )
  }
}
