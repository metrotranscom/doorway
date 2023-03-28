import { Module } from "@nestjs/common"
import { SharedModule } from "../../../backend/core/src/shared/shared.module"
import { CloudinaryFileService } from "./cloudinary-file.service"

@Module({
  imports: [SharedModule],
  providers: [CloudinaryFileService],
  exports: [CloudinaryFileService],
})
export class CloudinaryFileModule {}
