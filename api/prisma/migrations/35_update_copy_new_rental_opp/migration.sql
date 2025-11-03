UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity}',
    '{"viewListingNotice": "THIS INFORMATION MAY CHANGE - Please view listing for the most updated information"}'
  )
WHERE
  language = 'en';


UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity}',
   '{"viewListingNotice": "ESTA INFORMACIÓN PUEDE CAMBIAR: consulte la lista para obtener la información más actualizada"}'
  )
WHERE
  language = 'es';

UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity}',
   '{"viewListingNotice": "قد تتغير هذه المعلومات - يرجى الاطلاع على القائمة للحصول على أحدث المعلومات"}'
  )
WHERE
  language = 'ar';

UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity}',
    '{"viewListingNotice": "এই তথ্যটি পরিবর্তিত হতে পারে - অনুগ্রহ করে সবচেয়ে আপডেট হওয়া তথ্যের জন্য তালিকা দেখুন}'
  )
WHERE
  language = 'bn';