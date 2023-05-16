import * as React from "react"
import {
  ResponsiveContentList,
  ResponsiveContentItem,
  ResponsiveContentItemHeader,
  ResponsiveContentItemBody,
} from "../../sections/ResponsiveContentList"
import { Button, Heading } from "../../.."
import "./ZeroListingsItem.scss"

export interface ZeroListingsItemProps {
    title: string
    description: string
    buttonContent: string
    children?: React.ReactNode
    desktopClass?: string
  }

export const ZeroListingsItem = (props: ZeroListingsItemProps) => (
  <div className="zero-listings">
    <ResponsiveContentItem desktopClass={props.desktopClass}>
      <ResponsiveContentItemHeader>
        <Heading styleType={"largePrimary"}>{props.title}</Heading>
      </ResponsiveContentItemHeader>
      <ResponsiveContentItemBody>
        <div className="zero-listings-description">{props.description}</div>
        <Button>{props.buttonContent}</Button>
      </ResponsiveContentItemBody>
    </ResponsiveContentItem>
  </div>
)
