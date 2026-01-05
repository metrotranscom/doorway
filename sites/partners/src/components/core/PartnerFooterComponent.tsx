import { FooterNav, LocalizedLink, SiteFooter } from "@bloom-housing/ui-components"

type PartnerFooterLink = {
  hrerf: string
  text: string
}

export type PartnerFooterProps = {
  links: PartnerFooterLink[]
}

const currentYear = new Date().getFullYear()
const copyRight = `Copyright @ ${currentYear} Bay Area Housing Finance Authority. All rights reserved`
const footerData: PartnerFooterProps = {
  links: [
    {
      text: "Doorway Partners Manual",
      hrerf: "https://docs.google.com/document/d/1W4tIMtUMwz4KqdcO5f4yZi0R5AU74P3B/edit",
    },
    {
      text: "Privacy Policy",
      hrerf: "https://mtc.ca.gov/doorway-housing-portal-privacy-policy",
    },
    {
      text: "Terms of Use",
      hrerf: "https://mtc.ca.gov/doorway-housing-portal-terms-use",
    },
  ],
}

const PartnersFooter = () => {
  return (
    <SiteFooter>
      <FooterNav copyright={copyRight}>
        {footerData.links.map((footerLik) => (
          <LocalizedLink key={footerLik.text} href={footerLik.hrerf}>
            {footerLik.text}
          </LocalizedLink>
        ))}
      </FooterNav>
    </SiteFooter>
  )
}

export default PartnersFooter
