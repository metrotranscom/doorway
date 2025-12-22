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


UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{forgotPassword, changePassword}',
   '"Cambiar mi contraseña"'
  )
WHERE
  language = 'es';


  UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{forgotPassword, changePassword}',
   '"更改我的密碼"'
  )
WHERE
  language = 'zh';


  UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{forgotPassword, changePassword}',
   '"Thay đổi mật khẩu của tôi"'
  )
WHERE
  language = 'vi';



  UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{forgotPassword, changePassword}',
   '"Baguhin ang aking password"'
  )
WHERE
  language = 'tl';