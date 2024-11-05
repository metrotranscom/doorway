import React from "react"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import styles from "./ListingsSearch.module.scss"

export interface ListingsSearchMetadataProps {
  loading: boolean
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  filterCount: number
  searchResults: {
    listings: Listing[]
    currentPage: number
    lastPage: number
    totalItems: number
    loading: boolean
  }
  setListView: React.Dispatch<React.SetStateAction<boolean>>
  listView: boolean
}

export const ListingsSearchMetadata = ({
  loading,
  setModalOpen,
  filterCount,
  searchResults,
  setListView,
  listView,
}: ListingsSearchMetadataProps) => {
  return (
    <>
      <div className={`${styles["search-filter-bar"]} ${styles["search-switch-container"]}`}>
        <span>
          <Button
            size={"sm"}
            onClick={() => setListView(!listView)}
            className={`results-bar-button ${styles["switch-view-button"]}`}
          >
            {listView ? t("t.mapMapView") : t("t.mapListView")}
          </Button>
        </span>
      </div>
      <div className={styles["search-filter-bar"]}>
        <div className={`${styles["total-results"]}`}>
          <span className={styles["search-total-results"]}>
            <strong>{t("search.totalResults")}</strong> {!loading && searchResults.totalItems}
          </span>
          {!loading && searchResults.lastPage > 0 && (
            <span className={`${!listView ? styles["hide-total-results"] : ""}`}>
              (
              {t("t.pageXofY", {
                current: searchResults.currentPage,
                total: searchResults.lastPage,
              })}
              )
            </span>
          )}
        </div>

        <Button
          variant="primary-outlined"
          size="sm"
          className={"results-bar-button"}
          onClick={() => {
            setModalOpen(true)
          }}
        >
          <strong>{t("search.filters")}</strong>
          {filterCount}
        </Button>
      </div>
    </>
  )
}
