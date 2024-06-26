import React, { useMemo } from "react"
import { Icon } from "@bloom-housing/ui-components"
import "./LoadingOverlay.scss"

type LoadingOverlayProps = {
  isLoading: boolean
  children: React.ReactChild
}

const LoadingOverlay = ({ isLoading, children }: LoadingOverlayProps) => {
  const content = useMemo(() => {
    if (!isLoading) return children

    return (
      <div className="loading-overlay" data-testid="loading-overlay">
        <Icon size="3xl" symbol="spinner" className="loading-overlay__spinner" />
        {children}
      </div>
    )
  }, [isLoading, children])

  return (
    <div role="alert" aria-live="assertive">
      {content}
    </div>
  )
}

export { LoadingOverlay as default, LoadingOverlay }
