import { CacheModule, Logger, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import type { RedisClientOptions } from "redis"
import * as redisStore from "cache-manager-redis-store"
import { ListingsService } from "./listings.service"
import { ListingsController } from "./listings.controller"
import { Listing } from "./entities/listing.entity"
import { Unit } from "../units/entities/unit.entity"
import { MultiselectQuestion } from "../multiselect-question/entities/multiselect-question.entity"
import { AuthModule } from "../auth/auth.module"
import { User } from "../auth/entities/user.entity"
import { TranslationsModule } from "../translations/translations.module"
import { AmiChart } from "../ami-charts/entities/ami-chart.entity"
import { ListingFeatures } from "./entities/listing-features.entity"
import { ActivityLogModule } from "../activity-log/activity-log.module"
import { ListingRepository } from "./db/listing.repository"
import { ListingUtilities } from "./entities/listing-utilities.entity"
import { ApplicationFlaggedSetsModule } from "../application-flagged-sets/application-flagged-sets.module"
import { ListingsCronService } from "./listings-cron.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Listing,
      MultiselectQuestion,
      Unit,
      User,
      AmiChart,
      ListingRepository,
      ListingFeatures,
      ListingUtilities,
    ]),
    AuthModule,
    TranslationsModule,
    ActivityLogModule,
    ApplicationFlaggedSetsModule,
    // TODO make global  https://docs.nestjs.com/techniques/caching#global-cache-overrides
    // todo use redis not memory
    // CacheModule.register({
    //   ttl: 3600000, // 1 hour
    //   max: 3, // 3 items in cache?
    // }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      host: "localhost", //default host
      port: 6379, //default port
      ttl: 3600000, // 1 hour
      max: 3, // 3 items in cache?
    }),
  ],
  providers: [ListingsService, ListingsCronService, Logger],
  exports: [ListingsService],
  controllers: [ListingsController],
})
export class ListingsModule {}
