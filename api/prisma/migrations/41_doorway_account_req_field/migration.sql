UPDATE translations
SET translations =
  jsonb_set(
    jsonb_set(
      translations,
      '{rentalOpportunity,doorwayAccountRequirement}',
      to_jsonb('You will need a Doorway account in order to apply. Receipt of this email does not equate to a Doorway account'::text),
      true
    ),
    '{rentalOpportunity,viewListingNotice}',
    to_jsonb('THIS INFORMATION MAY CHANGE <br /> - Please view listing for the most updated information'::text),
    true
  )
WHERE language = 'en';


UPDATE translations
SET translations =
  jsonb_set(
    jsonb_set(
      translations,
      '{rentalOpportunity,doorwayAccountRequirement}',
      to_jsonb('Necesitará una cuenta Doorway para poder presentar la solicitud. La recepción de este correo electrónico no equivale a una cuenta Doorway'::text),
      true
    ),
    '{rentalOpportunity,viewListingNotice}',
    to_jsonb('ESTA INFORMACIÓN PUEDE CAMBIAR <br />  consulte la lista para obtener la información más actualizada'::text),
    true
  )
WHERE language = 'es';


UPDATE translations
SET translations =
  jsonb_set(
    jsonb_set(
      translations,
      '{rentalOpportunity,doorwayAccountRequirement}',
      to_jsonb('您需要一個 Doorway 帳戶才能申請。收到此電子郵件並不等於擁有 Doorway 帳戶'::text),
      true
    ),
    '{rentalOpportunity,viewListingNotice}',
    to_jsonb('此資訊可能會更改 <br /> - 請查看列表以獲取最新信息'::text),
    true
  )
WHERE language = 'zh';


UPDATE translations
SET translations =
  jsonb_set(
    jsonb_set(
      translations,
      '{rentalOpportunity,doorwayAccountRequirement}',
      to_jsonb('Bạn sẽ cần có tài khoản Doorway để đăng ký. Việc nhận được email này không tương đương với tài khoản Doorway'::text),
      true
    ),
    '{rentalOpportunity,viewListingNotice}',
    to_jsonb('THÔNG TIN NÀY CÓ THỂ THAY ĐỔI <br /> - Vui lòng xem danh sách để biết thông tin cập nhật nhất'::text),
    true
  )
WHERE language = 'vi';


UPDATE translations
SET translations =
  jsonb_set(
    jsonb_set(
      translations,
      '{rentalOpportunity,doorwayAccountRequirement}',
      to_jsonb('Kakailanganin mo ng Doorway account para makapag-apply. Ang pagtanggap ng email na ito ay hindi katumbas ng isang Doorway account'::text),
      true
    ),
    '{rentalOpportunity,viewListingNotice}',
    to_jsonb('MAAARING MAGBAGO ANG IMPORMASYON NA ITO <br /> - Mangyaring tingnan ang listahan para sa pinakabagong impormasyon'::text),
    true
  )
WHERE language = 'tl';