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
        <FooterSection sectionClassName="">
          <div className="flex-1 text-left">
            <img
              className="h-16 w-16"
              src="/images/bahfa-logo.png"
              alt="Bay Area Housing Finance Authority Logo"
            />
            <img
              className="h-400 w-400"
              src="/images/mtc-abag-logo.svg"
              alt="Association of Bay Area Governments - Metropolitan Transporation Commission Logo"
            />
            <p>
              375 Beale Street, Suite 800
              <br /> San Francisco, CA 94105-2066
              <br /> Monday-Friday 9:00am - 5:00pm
              <br />
              bahfa@bayareametro.gov
            </p>
          </div>
          <div className="flex-1 text-left">
            <FooterNav>
              <Link href="https://mtc.ca.gov/doorway-housing-portal-privacy-policy" target="_blank">
                {t("pageTitle.privacy")}
              </Link>
              <Link href="https://mtc.ca.gov/doorway-housing-portal-terms-use" target="_blank">
                {t("pageTitle.termsOfUse")}
              </Link>
              <Link href="https://mtc.ca.gov/bahfa-non-discrimination-statement" target="_blank">
                {t("pageTitle.bahfaNonDiscriminationStatement")}
              </Link>
              <Link
                href="https://mtc.ca.gov/about-mtc/public-participation/language-assistance"
                target="_blank"
              >
                {t("pageTitle.languageAssistance")}
              </Link>
            </FooterNav>
            <Link href="https://twitter.com/mtcbata" target="_blank">
              <img className="h-8 w-8" src="/images/twitter-logo.svg" alt="Twitter Logo" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/metropolitan-transportation-commission"
              target="_blank"
            >
              <img className="h-8 w-8" src="/images/linkedin-logo.svg" alt="LinkedIn Logo" />
            </Link>
            <Link href="https://www.facebook.com/MTCBATA" target="_blank">
              <img className="h-8 w-8" src="/images/facebook-logo.svg" alt="Facebook Logo" />
            </Link>
            <Link href="https://www.youtube.com/user/mtcabaglibrary" target="_blank">
              <img className="h-8 w-8" src="/images/youtube-logo.svg" alt="YouTube Logo" />
            </Link>
            <Link href="https://www.instagram.com/mtcbata/" target="_blank">
              <img className="h-8 w-8" src="/images/instagram-logo.svg" alt="Instagram Logo" />
            </Link>
          </div>
        </FooterSection>
        <FooterSection className="bg-gray-950" small sectionClassName="space-between">
          <div className="flex-1">{t("footer.bahfaCopyright")}</div>
          <div className="flex-1">
            <img
              className="h-16 w-16"
              src="/images/eho-logo.svg"
              alt="Equal Housing Opportunity Logo"
            />
          </div>
        </FooterSection>
      </SiteFooter>
    </div>
  )
}

export default Layout
