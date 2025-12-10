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
    '{rentalOpportunity, doorwayAccountRequirement}',
   '"Necesitará una cuenta Doorway para poder presentar la solicitud. La recepción de este correo electrónico no equivale a una cuenta Doorway"'
  )
WHERE
  language = 'es';

UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity, doorwayAccountRequirement}',
   '"您需要一個 Doorway 帳戶才能申請。收到此電子郵件並不等於擁有 Doorway 帳戶"'
  )
WHERE
  language = 'zh';

UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity,doorwayAccountRequirement}',
    '"Bạn sẽ cần có tài khoản Doorway để đăng ký. Việc nhận được email này không tương đương với tài khoản Doorway"'
  )
WHERE
  language = 'vi';



UPDATE
  translations
SET
  translations = jsonb_set(
    translations,
    '{rentalOpportunity, doorwayAccountRequirement}',
    '"Kakailanganin mo ng Doorway account para makapag-apply. Ang pagtanggap ng email na ito ay hindi katumbas ng isang Doorway account"'
  )
WHERE
  language = 'tl';