import React, { useContext } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import { t, Breadcrumbs, BreadcrumbLink, AgTable } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import SupportLayout from "../../../layouts/SupportLayout"
import useSWR from "swr"
import { useUserAudit } from "../../../lib/hooks"

const SupportUserPasswordHistory = () => {
  const { userService } = useContext(AuthContext)
  const router = useRouter()
  const userId = router.query.id as string

  // Fetch the user using standard SWR pattern
  const fetcher = () => userService.retrieve({ id: userId })
  const { data: user, error } = useSWR(userId ? `/api/adapter/user/${userId}` : null, fetcher)

  const { auditData, auditLoading } = useUserAudit(userId)

  if (error) return <div>{t("t.errorOccurred")}</div>

  return (
    <SupportLayout
      user={user}
      userId={userId}
      breadcrumbLabel={t("support.passwordHistory")}
      breadcrumbHref={`/support/${userId}/password-history`}
    >
      <div className="flex flex-row gap-8">
        <div className="md:w-9/12 flex flex-col gap-8">
          {!user ? (
            <div className="flex justify-center p-8">{t("t.loading")}</div>
          ) : (
            <AgTable
              id="password-history-table"
              config={{
                columns: [
                  {
                    headerName: t("t.date"),
                    field: "createdAt",
                    valueFormatter: ({ value }) => dayjs(value).format("MM/DD/YYYY hh:mm A"),
                    flex: 1,
                  },
                  {
                    headerName: t("t.action"),
                    field: "action",
                    valueFormatter: () => t("t.updated"),
                    flex: 1,
                  },
                ],
                totalItemsLabel: t("support.totalChanges"),
              }}
              data={{
                items: auditData?.passwordChanges || [],
                loading: auditLoading,
                totalItems: auditData?.passwordChanges?.length || 0,
                totalPages: 1,
              }}
              pagination={{
                perPage: 100,
                setPerPage: () => {
                  /* no-op */
                },
                currentPage: 1,
                setCurrentPage: () => {
                  /* no-op */
                },
              }}
              search={{
                setSearch: () => {
                  /* no-op */
                },
              }}
            />
          )}
        </div>
        <div className="md:w-3/12" />
      </div>
    </SupportLayout>
  )
}

export default SupportUserPasswordHistory
