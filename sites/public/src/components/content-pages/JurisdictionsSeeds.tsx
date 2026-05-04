import React, { useEffect, useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../lib/constants"
import Layout from "../../layouts/application"
import { professionalsPartnersJurisdictionsCards } from "../../tsx_content/professional-partners-jurisdictions-cards"
import { DoorwayLinkableCardGroup } from "../../components/shared/DoorwayLinkableCardGroup"
import { PageHeaderLayout } from "../../patterns/PageHeaderLayout"

const JurisdictionsSeeds = () => {
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "jurisdictions",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <Layout>
      <PageHeaderLayout heading={t("pageTitle.jurisdictions")}>
        <DoorwayLinkableCardGroup
          cards={professionalsPartnersJurisdictionsCards()}
          className="m-auto"
        ></DoorwayLinkableCardGroup>
      </PageHeaderLayout>
    </Layout>
  )
}

export default JurisdictionsSeeds
