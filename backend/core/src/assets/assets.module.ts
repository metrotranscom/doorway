import { Module } from "@nestjs/common"
import { AssetsController } from "./assets.controller"
import { AssetsService } from "./services/assets.service"
import { CloudinaryService, UploadService } from "./services/upload.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SharedModule } from "../shared/shared.module"
import { Asset } from "./entities/asset.entity"
import { AuthModule } from "../auth/auth.module"
import { FileServiceProvider } from "../shared/uploads"

@Module({
  controllers: [AssetsController],
  providers: 
    [AssetsService, { provide: UploadService, useClass: CloudinaryService }, FileServiceProvider],
  imports: [TypeOrmModule.forFeature([Asset]), AuthModule, SharedModule],
})
export class AssetsModule {}
