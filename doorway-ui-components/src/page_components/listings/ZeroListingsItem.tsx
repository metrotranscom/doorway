import * as React from "react"
import {
  ResponsiveContentList,
  ResponsiveContentItem,
  ResponsiveContentItemHeader,
  ResponsiveContentItemBody,
} from "../../sections/ResponsiveContentList"
import { Button, Heading } from "../../.."
import "./ZeroListingsItem.scss"
import Markdown from "markdown-to-jsx"

export interface ZeroListingsItemProps {
    title: string
    description: string
    children?: React.ReactNode
    desktopClass?: string
  }

export const ZeroListingsItem = (props: ZeroListingsItemProps) => (
  <div className="zero-listings">
    <Heading styleType={"largePrimary"}>{props.title}</Heading>
    <div className="zero-listings-description">{props.description}</div>
    {typeof props.children == "string" ? (
        <div className="markdown info-card__content">
          <Markdown options={{ disableParsingRawHTML: true }} children={props.children} />
        </div>
      ) : (
        props.children
      )}
  </div>
)
