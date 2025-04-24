import { Global, Module } from '@nestjs/common';
import { ApplicationExporterService } from '../services/application-exporter.service';
import { AssetModule } from './asset.module';
import { ListingModule } from './listing.module';
import { MultiselectQuestionModule } from './multiselect-question.module';
import { PermissionModule } from './permission.module';
import { PrismaModule } from './prisma.module';

@Global()
@Module({
  imports: [
    ApplicationExporterModule,
    AssetModule,
    PrismaModule,
    ListingModule,
    MultiselectQuestionModule,
    PermissionModule,
  ],
  providers: [ApplicationExporterService],
  exports: [ApplicationExporterService],
})
export class ApplicationExporterModule {}
