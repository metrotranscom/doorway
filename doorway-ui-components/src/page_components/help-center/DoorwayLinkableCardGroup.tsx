import React, { useState } from "react"
import { Card, CardProps, Heading } from "../../.."
import "./DoorwayLinkableCardGroup.scss"
import Link from "next/link"
import { RowPositionUtils } from "ag-grid-community"

type DoorwayLinkableCardGroupProps = {
  cards: React.ReactElement<CardProps>[]
  children?: React.ReactNode
  className?: string
}

const DoorwayLinkableCardGroup = (props: DoorwayLinkableCardGroupProps) => {
  const getLinks = () => {
    const links = []
    for (const card of props.cards) {
      if (card.props?.id) {
        links.push(
          <Link href={`#${card.props.id}`}>
            {`Link to #${card.props.id} (TODO: Liann extend with link name)`}
          </Link>
        )
      }
    }
    return links
  }

  const [isExpanded, setExpanded] = useState(false)
  const rootClassNames = props.className ? `${props.className}` : ""

  return (
    <div className={`doorway-linkable-card-group ${rootClassNames}`}>
      <div className="doorway-linkable-card-group_nav mt-4">
        <Card className="border-0">{getLinks()}</Card>
      </div>
      <div className="doorway-linkable-card-group_main">
        {props.children}
        {props.cards}
      </div>
    </div>
  )
}

export { DoorwayLinkableCardGroup as default, DoorwayLinkableCardGroup }
