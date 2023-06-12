import React from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Head from "next/head"
import { getSiteHeader } from "../lib/helpers"
import { t } from "@bloom-housing/ui-components"
import { SiteFooter, FooterNav, FooterSection } from "@bloom-housing/doorway-ui-components"

const Layout = (props) => {
  const router = useRouter()
  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("nav.siteTitle")}</title>
        </Head>
        {getSiteHeader(router)}
        <main id="main-content" className="md:overflow-x-hidden">
          {props.children}
        </main>
      </div>

      <SiteFooter>
        <FooterNav>
          <Link href="/privacy">{t("pageTitle.privacy")}</Link>
          <Link href="/disclaimer">{t("pageTitle.termsOfUse")}</Link>
          <Link href="/disclaimer">{t("pageTitle.bahfaNonDiscriminationStatement")}</Link>
          <Link href="/disclaimer">{t("pageTitle.languageAssistance")}</Link>
        </FooterNav>
        <FooterSection className="bg-gray-950" small>
          {t("footer.bahfaCopyright")}
        </FooterSection>
      </SiteFooter>
    </div>
  )
}

export default Layout
