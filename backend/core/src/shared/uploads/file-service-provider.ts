import { Injectable } from "@nestjs/common"
import { FileService } from "./file-service"
import { NullFileService } from "./null/null-file-service"

@Injectable()
export class FileServiceProvider {
  services: Record<string, FileService>

  service: FileService

  construct() {
    this.services = {}
  }

  getFileService() {
    if (!this.service) {
      this.service = new NullFileService()
    }

    return this.service
  }

  registerFileService(name: string, service: FileService) {
    this.services[name] = service
  }

  getFileServiceByName(name: string): FileService {
    return this.services[name]
  }
}

export const fileServiceProvider = new FileServiceProvider()

// register file services
//fileServiceProvider.registerFileService("null", NullFileService)
