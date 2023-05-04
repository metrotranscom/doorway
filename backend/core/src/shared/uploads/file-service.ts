import { FileUpload } from "./file"

export interface FileService {
  putFile(key: string, file: FileUpload): string
  //getDownloadUrl(key: string): string
}
