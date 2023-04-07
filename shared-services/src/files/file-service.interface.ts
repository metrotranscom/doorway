import { CloudinaryFileUploader } from "./cloudinary-file-uploader"
import { CloudinaryConfig } from "./file-service.provider"

export interface FileServiceInterface {
  cloudinaryFileUploader: CloudinaryFileUploader
  cloudinaryConfig: CloudinaryConfig

  putFile(key: string, file: File, setProgressValue: (value: number) => void): Promise<string>
  getDownloadUrlForPhoto(id: string, size?: number): string
  getDownloadUrlForPdf(id: string): string
}
