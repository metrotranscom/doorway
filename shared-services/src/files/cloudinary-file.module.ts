import { Module } from "@nestjs/common"
import { CloudinaryFileService } from "./cloudinary-file.service"

@Module({
  providers: [CloudinaryFileService],
  exports: [CloudinaryFileService],
})
export class CloudinaryFileModule {}
