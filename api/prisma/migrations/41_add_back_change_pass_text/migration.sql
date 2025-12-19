UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{forgotPassword, changePassword}',
   '"Change my password"'
  )
WHERE
  language = 'en';
