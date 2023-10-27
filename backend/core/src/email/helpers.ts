/* eslint-disable @typescript-eslint/restrict-template-expressions */
export const xmlEmailBuilder = (emailBody: string) =>
  "<bulletin>" +
  `<header>Test Header</header>` +
  `<subject>Test Subject</subject>` +
  "<body>" +
  "<![CDATA[" +
  `${emailBody}` +
  "]]></body>" +
  `<sms_body nil='true'></sms_body>` +
  `<publish_rss type='boolean'>false</publish_rss>` +
  `<open_tracking type='boolean'>true</open_tracking>` +
  `<click_tracking type='boolean'>true</click_tracking>` +
  `<share_content_enabled type='boolean'>true</share_content_enabled>` +
  `<topics type='array'>` +
  `<topic>` +
  `<code>doorway-listings</code>` +
  `</topic>` +
  `</topics>` +
  `<categories type='array' />` +
  `</bulletin>`
