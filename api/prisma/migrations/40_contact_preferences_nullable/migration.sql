-- Remove NULL requirement
ALTER TABLE
    "applications"
ALTER COLUMN
    "contact_preferences" DROP NOT NULL;