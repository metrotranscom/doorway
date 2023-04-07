import { Injectable } from "@nestjs/common"
import { cloudinaryPdfFromId, cloudinaryUrlFromId } from "@bloom-housing/shared-helpers"
import { FileServiceInterface } from "./file-service.interface"
import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import type { CloudinaryConfig } from "./file-service.provider"

@Injectable()
export class CloudinaryFileService implements FileServiceInterface {
  constructor(
    readonly cloudinaryFileUploader: CloudinaryFileUploader,
    readonly cloudinaryConfig: CloudinaryConfig
  ) {}

  async putFile(
    key: string,
    file: File,
    setProgressValue: (value: number) => void
  ): Promise<string> {
    const id = await this.cloudinaryFileUploader.uploadCloudinaryFile(file, setProgressValue)
    return id
  }
  getDownloadUrlForPhoto(id: string, size = 400): string {
    return cloudinaryUrlFromId(id, size)
  }
  getDownloadUrlForPdf(id: string): string {
    return cloudinaryPdfFromId(id)
  }
}
