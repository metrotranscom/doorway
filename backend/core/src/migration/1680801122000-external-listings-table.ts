import { MigrationInterface, QueryRunner } from "typeorm"

export class externalListingsTable1680801122000 implements MigrationInterface {
  name = "externalListingsTable1680801122000"

  public async up(queryRunner: QueryRunner): Promise<void> {

    // For importing external listings
    await queryRunner.query(
        `CREATE TABLE "external_listings_flat" (
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

    // Create a queryable view combining local and external listings, flattened for searching
    await queryRunner.query(
      `CREATE VIEW "combined_listings_search" (
        "listings_id",
        "listings_assets",
        "listings_units_available",
        "listings_application_due_date",
        "listings_application_open_date",
        "listings_name",
        "listings_waitlist_current_size",
        "listings_waitlist_max_size",
        "listings_status",
        "listings_review_order_type",
        "listings_published_at",
        "listings_closed_at",
        "jurisdiction_id",
        "jurisdiction_name",
        "buildingAddress_city",
        "buildingAddress_state",
        "buildingAddress_street",
        "buildingAddress_street2",
        "buildingAddress_zip_code",
        "buildingAddress_latitude",
        "buildingAddress_longitude",
        "buildingAddress_id",
        "units_id",
        "units_monthly_income_min",
        "units_floor",
        "units_max_occupancy",
        "units_min_occupancy",
        "units_monthly_rent",
        "units_sq_feet",
        "units_monthly_rent_as_percent_of_income",
        "unitType_id",
        "unitType_name",
        "amiChartOverride_id",
        "amiChartOverride_items",
        "reservedCommunityType_id",
        "reservedCommunityType_name",
        "listingImages_ordinal",
        "listingImages_listing_id",
        "listingImages_image_id",
        "listingImagesImage_id",
        "listingImagesImage_file_id",
        "listingImagesImage_label",
        "listingMultiselectQuestions_ordinal",
        "listingMultiselectQuestions_listing_id",
        "listingMultiselectQuestions_multiselect_question_id",
        "listingMultiselectQuestionsMultiselectQuestion_id",
        "features_id",
        "features_elevator",
        "features_wheelchair_ramp",
        "features_service_animals_allowed",
        "features_accessible_parking",
        "features_parking_on_site",
        "features_in_unit_washer_dryer",
        "features_laundry_in_building",
        "features_barrier_free_entrance",
        "features_roll_in_shower",
        "features_grab_bars",
        "features_heating_in_unit",
        "features_ac_in_unit",
        "utilities_id",
        "utilities_water",
        "utilities_gas",
        "utilities_trash",
        "utilities_sewer",
        "utilities_electricity",
        "utilities_cable",
        "utilities_phone",
        "utilities_internet"
      ) AS (
        (
          SELECT
            "listings"."id" AS "listings_id",
            "listings"."assets" AS "listings_assets",
            "listings"."units_available" AS "listings_units_available",
            "listings"."application_due_date" AS "listings_application_due_date",
            "listings"."application_open_date" AS "listings_application_open_date",
            "listings"."name" AS "listings_name",
            "listings"."waitlist_current_size" AS "listings_waitlist_current_size",
            "listings"."waitlist_max_size" AS "listings_waitlist_max_size",
            "listings"."status" AS "listings_status",
            "listings"."review_order_type" AS "listings_review_order_type",
            "listings"."published_at" AS "listings_published_at",
            "listings"."closed_at" AS "listings_closed_at",
            "listings"."jurisdiction_id" AS "jurisdiction_id",
            "jurisdiction"."name" AS "jurisdiction_name",
            "buildingAddress"."city" AS "buildingAddress_city",
            "buildingAddress"."state" AS "buildingAddress_state",
            "buildingAddress"."street" AS "buildingAddress_street",
            "buildingAddress"."street2" AS "buildingAddress_street2",
            "buildingAddress"."zip_code" AS "buildingAddress_zip_code",
            "buildingAddress"."latitude" AS "buildingAddress_latitude",
            "buildingAddress"."longitude" AS "buildingAddress_longitude",
            "buildingAddress"."id" AS "buildingAddress_id",
            "units"."id" AS "units_id",
            "units"."monthly_income_min" AS "units_monthly_income_min",
            "units"."floor" AS "units_floor",
            "units"."max_occupancy" AS "units_max_occupancy",
            "units"."min_occupancy" AS "units_min_occupancy",
            "units"."monthly_rent" AS "units_monthly_rent",
            "units"."sq_feet" AS "units_sq_feet",
            "units"."monthly_rent_as_percent_of_income"
              AS "units_monthly_rent_as_percent_of_income",
            "unitType"."id" AS "unitType_id",
            "unitType"."name" AS "unitType_name",
            "amiChartOverride"."id" AS "amiChartOverride_id",
            "amiChartOverride"."items" AS "amiChartOverride_items",
            "reservedCommunityType"."id" AS "reservedCommunityType_id",
            "reservedCommunityType"."name" AS "reservedCommunityType_name",
            "listingImages"."ordinal" AS "listingImages_ordinal",
            "listingImages"."listing_id" AS "listingImages_listing_id",
            "listingImages"."image_id" AS "listingImages_image_id",
            "listingImagesImage"."id" AS "listingImagesImage_id",
            "listingImagesImage"."file_id" AS "listingImagesImage_file_id",
            "listingImagesImage"."label" AS "listingImagesImage_label",
            "listingMultiselectQuestions"."ordinal"
              AS "listingMultiselectQuestions_ordinal",
            "listingMultiselectQuestions"."listing_id"
              AS "listingMultiselectQuestions_listing_id",
            "listingMultiselectQuestions"."multiselect_question_id"
              AS "listingMultiselectQuestions_multiselect_question_id",
            "listingMultiselectQuestionsMultiselectQuestion"."id"
              AS "listingMultiselectQuestionsMultiselectQuestion_id",
            "features"."id" AS "features_id",
            "features"."elevator" AS "features_elevator",
            "features"."wheelchair_ramp" AS "features_wheelchair_ramp",
            "features"."service_animals_allowed" AS "features_service_animals_allowed",
            "features"."accessible_parking" AS "features_accessible_parking",
            "features"."parking_on_site" AS "features_parking_on_site",
            "features"."in_unit_washer_dryer" AS "features_in_unit_washer_dryer",
            "features"."laundry_in_building" AS "features_laundry_in_building",
            "features"."barrier_free_entrance" AS "features_barrier_free_entrance",
            "features"."roll_in_shower" AS "features_roll_in_shower",
            "features"."grab_bars" AS "features_grab_bars",
            "features"."heating_in_unit" AS "features_heating_in_unit",
            "features"."ac_in_unit" AS "features_ac_in_unit",
            "utilities"."id" AS "utilities_id",
            "utilities"."water" AS "utilities_water",
            "utilities"."gas" AS "utilities_gas",
            "utilities"."trash" AS "utilities_trash",
            "utilities"."sewer" AS "utilities_sewer",
            "utilities"."electricity" AS "utilities_electricity",
            "utilities"."cable" AS "utilities_cable",
            "utilities"."phone" AS "utilities_phone",
            "utilities"."internet" AS "utilities_internet"
          FROM "listings" "listings"
          LEFT JOIN "jurisdictions" "jurisdiction"
            ON "jurisdiction"."id" = "listings"."jurisdiction_id"
          LEFT JOIN "address" "buildingAddress"
            ON "buildingAddress"."id" = "listings"."building_address_id"
          LEFT JOIN "units" "units"
            ON "units"."listing_id" = "listings"."id"
          LEFT JOIN "unit_types" "unitType"
            ON "unitType"."id" = "units"."unit_type_id"
          LEFT JOIN "unit_ami_chart_overrides" "amiChartOverride"
            ON "amiChartOverride"."id" = "units"."ami_chart_override_id"
          LEFT JOIN "reserved_community_types" "reservedCommunityType"
            ON "reservedCommunityType"."id" = "listings"."reserved_community_type_id"
          LEFT JOIN "listing_images" "listingImages"
            ON "listingImages"."listing_id" = "listings"."id"
          LEFT JOIN "assets" "listingImagesImage"
            ON "listingImagesImage"."id" = "listingImages"."image_id"
          LEFT JOIN "listing_multiselect_questions" "listingMultiselectQuestions"
            ON "listingMultiselectQuestions"."listing_id" = "listings"."id"
          LEFT JOIN
            "multiselect_questions" "listingMultiselectQuestionsMultiselectQuestion"
            ON
              "listingMultiselectQuestionsMultiselectQuestion"."id"
              = "listingMultiselectQuestions"."multiselect_question_id"
          LEFT JOIN "listing_features" "features"
            ON "features"."id" = "listings"."features_id"
          LEFT JOIN "listing_utilities" "utilities"
            ON "utilities"."id" = "listings"."utilities_id"
          -- GROUP BY "listings"."id"
          -- ORDER BY "listings"."published_at" DESC NULLS LAST
        ) UNION (
          SELECT 
            "listing_id" AS "listings_id", 
            "listing_assets" AS "listings_assets", 
            "listing_units_available" AS "listings_units_available", 
            "listing_application_due_date" AS "listings_application_due_date", 
            "listing_application_open_date" AS "listings_application_open_date", 
            "listing_name" AS "listings_name", 
            "listing_waitlist_current_size" AS "listings_waitlist_current_size", 
            "listing_waitlist_max_size" AS "listings_waitlist_max_size", 
            CAST("listing_status" AS "listings_status_enum") AS "listings_status", 
            CAST("listing_review_order_type" AS "listings_review_order_type_enum") AS "listings_review_order_type", 
            "listing_published_at" AS "listings_published_at", 
            "listing_closed_at" AS "listings_closed_at", 
            
            "jurisdiction_id", 
            "jurisdiction_name", 
            
            "building_address_city" AS "buildingAddress_city", 
            "building_address_state" AS "buildingAddress_state", 
            "building_address_street" AS "buildingAddress_street", 
            "building_address_street2" AS "buildingAddress_street2",
            "building_address_zip_code" AS "buildingAddress_zip_code", 
            "building_address_latitude" AS "buildingAddress_latitude", 
            "building_address_longitude" AS "buildingAddress_longitude", 
            "building_address_id" AS "buildingAddress_id",
            
            "unit_id" AS "units_id", 
            "unit_monthly_income_min" AS "units_monthly_income_min", 
            "unit_floor" AS "units_floor", 
            "unit_max_occupancy" AS "units_max_occupancy", 
            "unit_min_occupancy" AS "units_min_occupancy", 
            "unit_monthly_rent" AS "units_monthly_rent", 
            "unit_sq_feet" AS "units_sq_feet", 
            "unit_monthly_rent_as_percent_of_income" AS "units_monthly_rent_as_percent_of_income", 
            
            "unit_type_id" AS "unitType_id", 
            "unit_type_name" AS "unitType_name", 
            
            "ami_chart_override_id" AS "amiChartOverride_id", 
            "ami_chart_override_items" AS "amiChartOverride_items", 
            
            "reserved_community_type_id" AS "reservedCommunityType_id", 
            "reserved_community_type_name" AS "reservedCommunityType_name", 
            
            "listing_images_ordinal" AS "listingImages_ordinal", 
            "listing_id" AS "listingImages_listing_id", -- duplicate, but necessary
            "listing_images_image_id" AS "listingImages_image_id",
            "listing_images_image_id" AS "listingImagesImage_id", -- duplicate, but necessary
            "listing_images_image_file_id" AS "listingImagesImage_file_id", 
            "listing_images_image_label" AS "listingImagesImage_label", 
            
            "listing_multiselect_questions_ordinal" AS "listingMultiselectQuestions_ordinal",
            "listing_id" AS "listingMultiselectQuestions_listing_id", -- duplicate, but necessary
            "listing_multiselect_questions_multiselect_question_id" AS "listingMultiselectQuestions_multiselect_question_id", 
            "listing_multiselect_questions_multiselect_question_id" AS "listingMultiselectQuestionsMultiselectQuestion_id", -- duplicate, but necessary
            
            "features_id", 
            "features_elevator", 
            "features_wheelchair_ramp", 
            "features_service_animals_allowed", 
            "features_accessible_parking", 
            "features_parking_on_site", 
            "features_in_unit_washer_dryer", 
            "features_laundry_in_building", 
            "features_barrier_free_entrance", 
            "features_roll_in_shower", 
            "features_grab_bars", 
            "features_heating_in_unit", 
            "features_ac_in_unit", 
            
            "utilities_id", 
            "utilities_water", 
            "utilities_gas", 
            "utilities_trash", 
            "utilities_sewer", 
            "utilities_electricity", 
            "utilities_cable", 
            "utilities_phone", 
            "utilities_internet"

          FROM "external_listings_flat"
        )
      )`
    )  
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "external_listings"`)
    await queryRunner.query(`DROP VIEW "combined_listings_search"`)
  }
}
