import { FileUpload } from "../file";
import { FileService } from "../file-service";

export class NullFileService implements FileService {
  putFile(key: string, file: FileUpload) {
    return `null://${key}/${Math.round(Math.random() * 1000)}/${file.name}`
  }

  /*
  getDownloadUrl(key: string) {
    return `null://${key}`
  }
  */
}
