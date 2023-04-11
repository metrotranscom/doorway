import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm"
import { Expose, Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"
import { ReservedCommunityType } from "../../reserved-community-type/entities/reserved-community-type.entity"
import { AssetCreateDto } from "../../assets/dto/asset.dto"
import { Address } from "../../shared/entities/address.entity"
import { UnitsSummarized } from "../../units/types/units-summarized"
import { ListingFeatures } from "../entities/listing-features.entity"
import { ListingImage } from "../entities/listing-image.entity"
import { ListingUtilities } from "../entities/listing-utilities.entity"
import { Unit } from "../../units/entities/unit.entity"
import { ListingMultiselectQuestion } from "../../multiselect-question/entities/listing-multiselect-question.entity"

@Entity({ name: "external_listings" })
class ExternalListing extends BaseEntity {

  // BEGIN LISTING FIELDS

  @PrimaryColumn("uuid")
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsUUID(4, { groups: [ValidationsGroupsEnum.default] })
  id: string

  @Column("jsonb")
  @Expose()
  //@ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  //@Type(() => AssetCreateDto)
  assets: AssetCreateDto[]

  @Column({ type: "integer", name: "household_size_min", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  householdSizeMin?: number | null

  @Column({ type: "integer", name: "household_size_max", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  householdSizeMax?: number | null

  @Column({ type: "integer", name: "units_available", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  unitsAvailable?: number | null

  @Column({ type: "timestamptz", name: "application_due_date", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  applicationDueDate?: Date | null

  @Column({ type: "timestamptz", name: "application_open_date", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  applicationOpenDate?: Date | null

  @Column({ type: "text" })
  @Index()
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  name: string

  @Column({ type: "integer", name: "waitlist_current_size", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  waitlistCurrentSize?: number | null

  @Column({ type: "integer", name: "waitlist_max_size", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  waitlistMaxSize?: number | null

  @Column({ type: "boolean", name: "is_waitlist_open", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  isWaitlistOpen?: boolean | null

  @Column({ type: "text" })
  @Index()
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  status: string

  @Column({ type: "text", name: "review_order_type" })
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  reviewOrderType?: string | null

  @Column({ type: "timestamptz", name: "published_at", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  publishedAt?: Date | null

  @Column({ type: "timestamptz", name: "closed_at", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  closedAt?: Date | null

  @Column({ type: "timestamptz", name: "last_application_update_at", nullable: true, default: "1970-01-01" })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  lastApplicationUpdateAt?: Date | null

  // END LISTING FIELDS
  // BEGIN SEARCH FIELDS

  @Column({ type: "text", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  county?: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  city?: string | null

  @Column({ type: "text", nullable: true })
  @Index()
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  neighborhood?: string | null

  @Column({ type: "text", name: "reserved_community_type_name", nullable: true})
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(4096, { groups: [ValidationsGroupsEnum.default] })
  reservedCommunityTypeName?: string | null

  @Column({ type: "text", name: "url_slug" })
  @Expose()
  urlSlug?: string | null

  // END SEARCH FIELDS
  // BEGIN COMPOSITE FIELDS

  @Column({ type: "jsonb", name: "units_summarized" })
  @Expose()
  unitsSummarized: UnitsSummarized | undefined

  /*
  @Column("jsonb")
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default], each: true })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => UnitsSummary)
  unitsSummary: UnitsSummary[]
  */

  @Column({ type: "jsonb" })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => ListingImage)
  images?: ListingImage[] | null

  @Column({ type: "jsonb", name: "multiselect_questions" })
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingMultiselectQuestion)
  multiselectQuestions?: ListingMultiselectQuestion[]

  @Column({ type: "jsonb" })
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Jurisdiction)
  jurisdiction: Jurisdiction

  @Column({ type: "jsonb", name: "reserved_community_type" })
  @Expose()
  @Type(() => ReservedCommunityType)
  reservedCommunityType?: ReservedCommunityType

  @Column({ type: "jsonb" })
  //units: any[]
  units: Unit[]

  @Column({ type: "jsonb", name: "building_address" })
  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  buildingAddress: Address

  @Column({ type: "jsonb" })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default], each: true })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingFeatures)
  features?: ListingFeatures

  @Column({ type: "jsonb" })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default], each: true })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingUtilities)
  utilities?: ListingUtilities
}

export { ExternalListing }
