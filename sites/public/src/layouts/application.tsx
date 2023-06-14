import React from "react"
import { useRouter } from "next/router"
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
        <FooterSection sectionClassName="justify-around" small>
          <div className="text-left">
            <img
              className="h-20 w-20 mr-3"
              src="/images/bahfa-logo.png"
              alt="Bay Area Housing Finance Authority Logo"
            />
            <img
              className="h-24 w-96"
              src="/images/mtc-abag-logo.svg"
              alt="Association of Bay Area Governments - Metropolitan Transporation Commission Logo"
            />
            <p className="mt-8 text-white">
              375 Beale Street, Suite 800
              <br /> San Francisco, CA 94105-2066
              <br /> {t("footer.mondayToFriday")}
              <br />
              <a href="mailto: bahfa@bayareametro.gov" className="underline">
                bahfa@bayareametro.gov
              </a>
            </p>
          </div>
          <div className="text-left">
            <FooterNav>
              <a href="https://mtc.ca.gov/doorway-housing-portal-privacy-policy" target="_blank">
                {t("pageTitle.privacy")}
              </a>
              <a href="https://mtc.ca.gov/doorway-housing-portal-terms-use" target="_blank">
                {t("pageTitle.termsOfUse")}
              </a>
              <a href="https://mtc.ca.gov/bahfa-non-discrimination-statement" target="_blank">
                {t("pageTitle.bahfaNonDiscriminationStatement")}
              </a>
              <a
                href="https://mtc.ca.gov/about-mtc/public-participation/language-assistance"
                target="_blank"
              >
                {t("pageTitle.languageAssistance")}
              </a>
            </FooterNav>
            <a href="https://twitter.com/mtcbata" target="_blank">
              <img className="h-10 w-10 mr-4" src="/images/twitter-logo.svg" alt="Twitter Logo" />
            </a>
            <a
              href="https://www.linkedin.com/company/metropolitan-transportation-commission"
              target="_blank"
            >
              <img className="h-10 w-10 mr-4" src="/images/linkedin-logo.svg" alt="LinkedIn Logo" />
            </a>
            <a href="https://www.facebook.com/MTCBATA" target="_blank">
              <img className="h-10 w-10 mr-4" src="/images/facebook-logo.svg" alt="Facebook Logo" />
            </a>
            <a href="https://www.youtube.com/user/mtcabaglibrary" target="_blank">
              <img className="h-10 w-10 mr-4" src="/images/youtube-logo.svg" alt="YouTube Logo" />
            </a>
            <a href="https://www.instagram.com/mtcbata/" target="_blank">
              <img
                className="h-10 w-10 mr-4"
                src="/images/instagram-logo.svg"
                alt="Instagram Logo"
              />
            </a>
          </div>
        </FooterSection>
        <FooterSection
          className="bg-gray-950"
          small
          sectionClassName="items:start md:items-center justify-start md:justify-between"
        >
          <div>{t("footer.bahfaCopyright")}</div>
          <div>
            <img
              className="h-20 w-20"
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
