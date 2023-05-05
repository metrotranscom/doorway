import { BaseFileService } from "../base-file-service";
import { MissingConfigItemError } from "../errors";
import { FileUpload } from "../";
import { FileService } from "../file-service";
import { FileServiceConfig } from "../types";

export class NullFileService extends BaseFileService implements FileService {
  validateConfig(config: FileServiceConfig) {
    /*
    if (!config.uri_prefix) {
      throw new MissingConfigItemError('uri_prefix')
    }
    */
  }

  async putFile(prefix: string, key: string, file: FileUpload) {
    const id = `null:${prefix}:${key}:${Math.round(Math.random() * 1000)}:${file.name}`

    return Promise.resolve({
      id: id,
      url: await this.generateDownloadUrl(id)
    })
  }

  generateDownloadUrl(id: string) {
    const parts = id.split(':')

    const prefix = parts[1]
    const key = parts[2]
    const rand = parts[3]
    const filename = parts[3]

    return Promise.resolve(`null://${prefix}${key}/${rand}/${filename}`)
  }
}
