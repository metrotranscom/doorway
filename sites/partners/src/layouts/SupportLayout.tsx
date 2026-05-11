import React, { useContext, useEffect, useMemo } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import {
  t,
  Breadcrumbs,
  BreadcrumbLink,
  PageHeader,
  TabNav,
  TabNavItem,
  AppearanceSizeType,
} from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import Layout from "./index"
import { SupportStatusBar } from "../components/shared/SupportStatusBar"
import { getSupportTabs } from "../lib/helpers"
import { User } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import headerStyles from "../components/shared/NavigationHeader.module.scss"

interface SupportLayoutProps {
  children: React.ReactNode
  user?: User
  userId: string
  breadcrumbLabel?: string
  breadcrumbHref?: string
}

const SupportLayout = ({
  children,
  user,
  userId,
  breadcrumbLabel,
  breadcrumbHref,
}: SupportLayoutProps) => {
  const { profile } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (profile && !profile.userRoles?.isAdmin) {
      void router.push("/")
    }
  }, [profile, router])

  const tabNavItems = useMemo(() => {
    return (
      <TabNav className="relative -bottom-8 md:-bottom-10">
        {getSupportTabs(userId, t).map((tab) => (
          <TabNavItem
            key={tab.path}
            tagContent={tab?.content}
            current={tab.activePaths.includes(router.asPath)}
            href={tab.path}
            tagSize={AppearanceSizeType.small}
          >
            {tab.label}
          </TabNavItem>
        ))}
      </TabNav>
    )
  }, [router.asPath, userId])

  if (profile && !profile.userRoles?.isAdmin) {
    return null
  }

  const userName = user ? `${user.firstName} ${user.lastName}` : ""

  return (
    <Layout>
      <Head>
        <title>{`${t("nav.support")} - ${t("nav.siteTitlePartners")}`}</title>
      </Head>
      <PageHeader
        className={`${headerStyles["navigation-header"]} relative !mb-0`}
        title={userName || t("nav.support")}
        tabNav={tabNavItems}
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbLink href="/support">{t("nav.support")}</BreadcrumbLink>
            {breadcrumbLabel ? (
              <>
                <BreadcrumbLink href={`/support/${userId}`}>
                  {userName || t("users.viewUser")}
                </BreadcrumbLink>
                <BreadcrumbLink href={breadcrumbHref} current>
                  {breadcrumbLabel}
                </BreadcrumbLink>
              </>
            ) : (
              <BreadcrumbLink href={`/support/${userId}`} current>
                {userName || t("users.viewUser")}
              </BreadcrumbLink>
            )}
          </Breadcrumbs>
        }
      />
      <SupportStatusBar confirmedAt={user?.confirmedAt} />
      <section className="bg-primary-lighter pt-4 pb-8 min-h-screen">
        <article className="max-w-screen-xl mx-auto px-4">{children}</article>
      </section>
    </Layout>
  )
}

export default SupportLayout
