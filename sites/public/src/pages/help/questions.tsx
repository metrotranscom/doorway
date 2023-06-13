import React, { useEffect, useContext } from "react"
import { MarkdownSection, t } from "@bloom-housing/ui-components"
import { PageHeader } from "@bloom-housing/doorway-ui-components"
import Markdown from "markdown-to-jsx"
import { PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../lib/constants"
import Layout from "../../layouts/application"
import pageContent from "../../md_content/privacy_policy.md"

const FrequentlyAskedQuestions = () => {
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "FrequentlyAskedQuestions",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  const pageTitle = <>{t("pageTitle.questions")}</>

  return (
    <Layout>
      <PageHeader title={pageTitle} />
      <MarkdownSection>
        <Markdown>{pageContent}</Markdown>
      </MarkdownSection>
    </Layout>
  )
}

export default FrequentlyAskedQuestions
