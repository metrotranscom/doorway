import React, { useContext } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import Link from "next/link"
import { t, Breadcrumbs, BreadcrumbLink, AgTable } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import SupportLayout from "../../../layouts/SupportLayout"
import useSWR from "swr"
import { useUserAudit } from "../../../lib/hooks"

const SupportUserApplications = () => {
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
      breadcrumbLabel={t("support.appSubmissions")}
      breadcrumbHref={`/support/${userId}/applications`}
    >
      <div className="flex flex-row gap-8">
        <div className="md:w-9/12 flex flex-col gap-8">
          {!user ? (
            <div className="flex justify-center p-8">{t("t.loading")}</div>
          ) : (
            <AgTable
              id="app-submissions-table"
              config={{
                columns: [
                  {
                    headerName: t("t.submissionDate"),
                    field: "submissionDate",
                    valueFormatter: ({ value }) =>
                      value ? dayjs(value).format("MM/DD/YYYY hh:mm A") : "n/a",
                    flex: 1,
                  },
                  {
                    headerName: t("listings.listingName"),
                    field: "listingName",
                    flex: 2,
                    cellRendererFramework: (params) => {
                      const submission = params.data
                      if (!submission.listingId) return params.value
                      return (
                        <Link
                          href={`/listings/${submission.listingId}`}
                          className="text-blue-700 underline font-medium"
                        >
                          {params.value}
                        </Link>
                      )
                    },
                  },
                  {
                    headerName: t("application.details.number"),
                    field: "confirmationCode",
                    flex: 1,
                    cellRendererFramework: (params) => {
                      const submission = params.data
                      if (!submission.applicationId) return params.value
                      return (
                        <Link
                          href={`/application/${submission.applicationId}`}
                          className="text-blue-700 underline font-medium"
                        >
                          {params.value}
                        </Link>
                      )
                    },
                  },
                  {
                    headerName: t("support.ranking"),
                    field: "ranking",
                    valueFormatter: ({ value }) => value || "n/a",
                    flex: 1,
                  },
                ],
                totalItemsLabel: t("support.totalApplications"),
              }}
              data={{
                items: auditData?.appSubmissions || [],
                loading: auditLoading,
                totalItems: auditData?.appSubmissions?.length || 0,
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

export default SupportUserApplications
