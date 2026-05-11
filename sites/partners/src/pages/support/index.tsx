import React, { useContext, useMemo, useState } from "react"
import Head from "next/head"
import dayjs from "dayjs"
import { AgTable, useAgTable, t, AlertBox } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import Layout from "../../layouts"
import { useUserList } from "../../lib/hooks"
import { NavigationHeader } from "../../components/shared/NavigationHeader"
import { useRouter } from "next/router"

const Support = () => {
  const { profile } = useContext(AuthContext)
  const router = useRouter()
  const [errorAlert, setErrorAlert] = useState(false)

  const tableOptions = useAgTable()

  const columns = useMemo(() => {
    return [
      {
        headerName: t("t.name"),
        field: "",
        flex: 1,
        minWidth: 150,
        valueGetter: ({ data }) => {
          const { firstName, lastName } = data
          return `${firstName} ${lastName}`
        },
        cellRendererFramework: (params) => {
          const user = params.data
          return (
            <button
              className="text-blue-700 underline font-medium cursor-pointer"
              onClick={() => {
                void router.push(`/support/${user.id}`)
              }}
            >
              {params.value}
            </button>
          )
        },
      },
      {
        headerName: t("t.email"),
        field: "email",
        flex: 1,
        minWidth: 250,
      },
      {
        headerName: t("listings.details.createdDate"),
        field: "createdAt",
        valueFormatter: ({ value }) => dayjs(value).format("MM/DD/YYYY"),
      },
      {
        headerName: t("listings.unit.status"),
        field: "confirmedAt",
        valueFormatter: ({ value }) => (value ? t("users.confirmed") : t("users.unconfirmed")),
      },
    ]
  }, [router])

  const {
    data: userList,
    loading,
    error,
  } = useUserList({
    page: tableOptions.pagination.currentPage,
    limit: tableOptions.pagination.itemsPerPage,
    search: tableOptions.filter.filterValue,
    filter: [{ isPortalUser: false }],
  })

  // Security check: Only admins can view this page
  if (profile && !profile.userRoles?.isAdmin) {
    void router.push("/")
    return null
  }

  if (error) return <div>{t("t.errorOccurred")}</div>

  return (
    <Layout>
      <Head>
        <title>{`${t("nav.support", { defaultValue: "Support" })} - ${t(
          "nav.siteTitlePartners"
        )}`}</title>
      </Head>
      <NavigationHeader
        className="relative"
        title={t("nav.support", { defaultValue: "Support" })}
      />
      <section>
        <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
          {errorAlert && (
            <AlertBox
              className="mb-8"
              onClose={() => setErrorAlert(false)}
              closeable
              type="alert"
              inverted
            >
              {t("account.settings.alerts.genericError")}
            </AlertBox>
          )}
          <AgTable
            id="support-users-table"
            pagination={{
              perPage: tableOptions.pagination.itemsPerPage,
              setPerPage: tableOptions.pagination.setItemsPerPage,
              currentPage: tableOptions.pagination.currentPage,
              setCurrentPage: tableOptions.pagination.setCurrentPage,
            }}
            config={{
              columns,
              totalItemsLabel: t("users.totalUsers"),
            }}
            data={{
              items: userList?.items,
              loading: loading,
              totalItems: userList?.meta.totalItems,
              totalPages: userList?.meta.totalPages,
            }}
            search={{
              setSearch: tableOptions.filter.setFilterValue,
            }}
          />
        </article>
      </section>
    </Layout>
  )
}

export default Support
