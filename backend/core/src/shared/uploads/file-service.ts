import { FileUpload } from "./"
import { FileServiceConfig, FileUploadResult } from "./types"

export interface FileService {
  isConfigured: boolean
  config: FileServiceConfig
  configure(config: FileServiceConfig): void
  putFile(prefix: string, key: string, file: FileUpload): Promise<FileUploadResult>
  generateDownloadUrl(id: string): Promise<string>
}
