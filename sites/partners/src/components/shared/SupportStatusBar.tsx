import React from "react"
import { Tag } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"

export interface SupportStatusBarProps {
  className?: string
  confirmedAt?: Date | string | null
}

const SupportStatusBar = ({ className, confirmedAt }: SupportStatusBarProps) => {
  const isConfirmed = !!confirmedAt
  return (
    <section className={`border-t bg-white flex-none ${className ?? ""}`}>
      <div className="flex flex-row w-full mx-auto max-w-screen-xl justify-end px-5 items-center my-3">
        <div className="md:pl-6 md:w-3/12">
          <Tag
            className="tag-full-width"
            variant={isConfirmed ? "success" : "secondary"}
            size="lg"
            id="user-status-tag"
          >
            {isConfirmed
              ? t("users.confirmed") || "Confirmed"
              : t("users.unconfirmed") || "Unconfirmed"}
          </Tag>
        </div>
      </div>
    </section>
  )
}

export { SupportStatusBar as default, SupportStatusBar }
