import * as React from "react"
import { Icon } from "../../icons/Icon"
import "./ListingDetailHeader.scss"

export interface ListingDetailHeaderProps {
  subtitle: string
  title: string
  children?: React.ReactNode
  hideHeader?: boolean
  desktopClass?: string
}

const ListingDetailHeader = (props: ListingDetailHeaderProps) => (
  <header className={`detail-header ${props.hideHeader ? "md:hidden" : ""}`}>
    <hgroup className="detail-header__hgroup">
      <h2 className="detail-header__title">{props.title}</h2>
      <span className="detail-header__subtitle">{props.subtitle}</span>
      <Icon symbol="arrowDown" size="medium" />
    </hgroup>
  </header>
)

export { ListingDetailHeader as default, ListingDetailHeader }
