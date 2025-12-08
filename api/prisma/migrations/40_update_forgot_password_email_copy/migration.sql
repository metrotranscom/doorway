UPDATE
  translations
SET
  translations = jsonb_set(translations, '{scriptRunner}', '{"resetRequest": "We received a request to reset your password for your Doorway Housing Portal account. You must click the following link to complete the reset: %{changeMyPassLink}", "ignoreRequest": "This password reset is only valid for the next hour. If you didn’t make this request, please ignore this email."}')
WHERE
  language = 'en';


UPDATE
  translations
SET
  translations = jsonb_set(translations, '{scriptRunner}', '{"resetRequest": "Recibimos una solicitud para restablecer la contraseña de su cuenta del Portal de Vivienda Doorway. Haga clic en el siguiente enlace para completar el restablecimiento: %{changeMyPassLink}", "ignoreRequest": "Este restablecimiento de contraseña solo es válido durante la próxima hora. Si no realizó esta solicitud, ignore este correo electrónico."}')
WHERE
  language = 'es';

UPDATE
  translations
SET
  translations = jsonb_set(translations, '{scriptRunner}', '{"resetRequest": "我們收到您重置 Doorway Housing Portal 帳戶密碼的請求。您必須點擊以下連結完成重設: %{changeMyPassLink}", "ignoreRequest": "此次密碼重設僅在下一小時內有效。如果您並未發起此要求，請忽略此郵件。"}')
WHERE
  language = 'zh';

UPDATE
  translations
SET
  translations = jsonb_set(translations, '{scriptRunner}', '{"resetRequest": "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Doorway Housing Portal của bạn. Bạn phải nhấp vào liên kết sau để hoàn tất việc đặt lại: %{changeMyPassLink}", "ignoreRequest": "Việc đặt lại mật khẩu này chỉ có hiệu lực trong vòng một giờ tới. Nếu bạn không gửi yêu cầu, vui lòng bỏ qua email này."}')
WHERE
  language = 'vi';



-- UPDATE
--   translations
-- SET
--   translations = jsonb_set(translations, '{scriptRunner}', '{"resetRequest": "Nakatanggap kami ng kahilingan na i-reset ang iyong password para sa iyong Doorway Housing Portal account. Dapat mong i-click ang sumusunod na link upang makumpleto ang pag-reset: %{changeMyPassLink}"}, {ignoreRequest: "Ang pag-reset ng password na ito ay may bisa lamang para sa susunod na oras. Kung hindi mo ginawa ang kahilingang ito, mangyaring huwag pansinin ang email na ito."}')
-- WHERE
--   language = 'tl';