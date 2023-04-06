import { MigrationInterface, QueryRunner } from "typeorm"

export class externalListingsTable1680801122000 implements MigrationInterface {
  name = "externalListingsTable1680801122000"

  public async up(queryRunner: QueryRunner): Promise<void> {

    // For importing external listings
    await queryRunner.query(
        `CREATE TABLE "external_listings" (
          "listing_id" uuid NOT NULL, 
          "listing_assets" jsonb NOT NULL, 
          "listing_units_available" integer, 
          "listing_application_due_date" TIMESTAMP WITH TIME ZONE, 
          "listing_application_open_date" TIMESTAMP WITH TIME ZONE, 
          "listing_name" text NOT NULL, 
          "listing_waitlist_current_size" integer, 
          "listing_waitlist_max_size" integer, 
          "listing_status" text NOT NULL DEFAULT 'active', 
          "listing_review_order_type" text, 
          "listing_published_at" TIMESTAMP WITH TIME ZONE, 
          "listing_closed_at" TIMESTAMP WITH TIME ZONE, 
  
          "jurisdiction_id" uuid, 
          "jurisdiction_name" text, 
  
          "building_address_id" uuid,
          "building_address_street" text, 
          "building_address_street2" text, 
          "building_address_city" text, 
          "building_address_state" text, 
          "building_address_zip_code" text, 
          "building_address_latitude" numeric, 
          "building_address_longitude" numeric, 
  
          "unit_id" uuid, 
          "unit_monthly_income_min" text, 
          "unit_floor" integer, 
          "unit_max_occupancy" integer, 
          "unit_min_occupancy" integer, 
          "unit_monthly_rent" text, 
          "unit_sq_feet" numeric(8,2), 
          "unit_monthly_rent_as_percent_of_income" numeric(8,2), 
  
          "unit_type_id" uuid, 
          "unit_type_name" text, 
  
          "ami_chart_override_id" uuid, 
          "ami_chart_override_items" jsonb, 
  
          "reserved_community_type_id" uuid, 
          "reserved_community_type_name" text, 
  
          "listing_images_ordinal" integer, 
          --"listing_images_listing_id" uuid, -- Redundant with listing_id
          "listing_images_image_id" uuid, 
          "listing_images_image_file_id" text, 
          "listing_images_image_label" text, 
  
          "listing_multiselect_questions_ordinal" integer, 
          --"listing_multiselect_questions_listing_id" uuid, -- Redundant with listing_id
          "listing_multiselect_questions_multiselect_question_id" uuid, 
  
          "features_id" uuid, 
          "features_elevator" boolean, 
          "features_wheelchair_ramp" boolean, 
          "features_service_animals_allowed" boolean, 
          "features_accessible_parking" boolean, 
          "features_parking_on_site" boolean, 
          "features_in_unit_washer_dryer" boolean, 
          "features_laundry_in_building" boolean, 
          "features_barrier_free_entrance" boolean, 
          "features_roll_in_shower" boolean, 
          "features_grab_bars" boolean, 
          "features_heating_in_unit" boolean, 
          "features_ac_in_unit" boolean, 
  
          "utilities_id" uuid, 
          "utilities_water" boolean, 
          "utilities_gas" boolean, 
          "utilities_trash" boolean, 
          "utilities_sewer" boolean, 
          "utilities_electricity" boolean, 
          "utilities_cable" boolean, 
          "utilities_phone" boolean, 
          "utilities_internet" boolean
        )`
      )  
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "external_listings"`)
  }
}
