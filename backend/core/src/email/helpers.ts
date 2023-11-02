/* eslint-disable @typescript-eslint/restrict-template-expressions */
export const govEmailBuilder = (emailBody?: string, emailHead?: string) => {
  console.log("boink", emailHead)
  return `<bulletin>\n   <header>Test Header</header>\n   <subject>Test email send</subject>\n  <body><![CDATA[\n     ${emailBody}\n   ]]></body>\n   <footer>ENTER FOOTER</footer>\n   <sms_body nil='true'></sms_body>\n   <publish_rss type='boolean'>false</publish_rss>\n   <open_tracking type='boolean'>true</open_tracking>\n   <click_tracking type='boolean'>true</click_tracking>\n   <share_content_enabled type='boolean'>true</share_content_enabled>\n   <topics type='array'>\n     <topic>\n       <code>doorway-listings</code>\n     </topic>\n   </topics>\n   <categories type='array' />\n </bulletin>`
}

export const templateDeconstructor = (compiledEmail: string) => {
  console.log(compiledEmail)
  const headRegEx = /<head>([\s\S]*?)<\/head>/
  const headText = headRegEx.exec(compiledEmail)?.[1]
  const bodyRegEx = /<body.*([\s\S]*?)<\/body>/
  const bodyText = bodyRegEx.exec(compiledEmail)?.[1]
  console.log({ head: headText, body: bodyText })
  return { head: headText, body: bodyText }
}
