UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity, doorwayAccountRequirement}',
   '"You will need a Doorway account in order to apply. Receipt of this email does not equate to a Doorway account"'
  )
WHERE
  language = 'en';


UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity, viewListingNotice, line1}',
   '"THIS INFORMATION MAY CHANGE"',
   true
  )
WHERE
  language = 'en';



UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity, viewListingNotice, line2}',
    '"- Please view listing for the most updated information"',
    true
  )
WHERE
  language = 'en';