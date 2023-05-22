import * as React from "react"
import { LinkButton } from "../../actions/LinkButton"
import { t } from "../../helpers/translator"
import { ZeroListingsItem } from "./ZeroListingsItem"
import { InfoCard } from "../../blocks/InfoCard"
import { Button } from "../../actions/Button"

type ListingsListProps = {
  listingCards: JSX.Element[]
}

const ListingsList = (props: ListingsListProps) => {
  const listingsDiv =
    props.listingCards.length > 0 ? (
      <div className="listingsList">{props.listingCards}</div>
    ) : (
      <ZeroListingsItem title={t("t.noMatchingListings")} description={t("t.tryRemovingFilters")}>
        <Button>{t("t.clearAllFilters")}</Button>
      </ZeroListingsItem>
    )
  return (
    <div>
      {listingsDiv}
      {/* TODO: once pagination is implemented for listings, the following should only show on the last page. */}
      <InfoCard
        title={t("t.signUpForAlerts")}
        subtitle={t("t.subscribeToNewsletter")}
        className="is-normal-primary-lighter"
      >
        <Button className="is-primary">{t("t.signUp")}</Button>
      </InfoCard>
      <InfoCard
        title={t("t.needHelp")}
        subtitle={t("t.emergencyShelter")}
        className="is-normal-secondary-lighter"
      >
        <Button className="is-secondary">{t("t.helpCenter")}</Button>
      </InfoCard>
      <InfoCard
        title={t("t.housingInSanFrancisco")}
        subtitle={t("t.seeSanFranciscoListings")}
        className="is-normal-secondary-lighter"
      >
        <LinkButton href="https://housing.sfgov.org/" newTab={true} className="is-secondary">
          {t("t.seeListings")}
        </LinkButton>
      </InfoCard>
    </div>
  )
}
export { ListingsList as default, ListingsList }
