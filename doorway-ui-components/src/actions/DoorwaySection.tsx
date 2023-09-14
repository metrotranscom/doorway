import React, { useState } from "react"
import { Heading } from "../.."
import "./DoorwaySection.scss"

type DoorwaySectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

const DoorwaySection = ({ children, title, className }: DoorwaySectionProps) => {
  const [isExpanded, setExpanded] = useState(false)
  const rootClassNames = className ? `${className}` : ""

  return (
    <div
      className={`doorway-expanded-section ${rootClassNames}`}
      onClick={() => {
        setExpanded(!isExpanded)
      }}
    >
      <div className="doorway-expanded_heading-container">
        <Heading priority={4} className={"text__large-primary text-left"}>
          {title}
        </Heading>
      </div>
      <div className="doorway-expanded_section">{children}</div>
    </div>
  )
}

export { DoorwaySection as default, DoorwaySection }
