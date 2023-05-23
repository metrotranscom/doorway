import * as React from "react"
import "./ImageInfoCard.scss"
import Markdown from "markdown-to-jsx"
import { InfoCardProps } from "./InfoCard"
import ImageCard from "./ImageCard"

export interface ImageInfoCardProps extends InfoCardProps {
  imageHref: string
}

const ImageInfoCard = (props: ImageInfoCardProps) => {
  const wrapperClasses = ["info-card"]
  if (props.className) {
    wrapperClasses.push(props.className)
  }

  return (
    <div className={wrapperClasses.join(" ")}>
      <div className={"info-card__header"}>
        {props.externalHref ? (
          <h3 className="info-card__title">
            <a href={props.externalHref} target="_blank">
              {props.title}
            </a>
          </h3>
        ) : (
          <h3 className="info-card__title">{props.title}</h3>
        )}
        {props.imageHref && <ImageCard href={props.imageHref} />}
        {props.subtitle && <span className={"text-sm text-gray-700"}>{props.subtitle}</span>}
      </div>
      {typeof props.children == "string" ? (
        <div className="markdown info-card__content">
          <Markdown options={{ disableParsingRawHTML: true }} children={props.children} />
        </div>
      ) : (
        props.children
      )}
    </div>
  )
}

export { ImageInfoCard as default, ImageInfoCard }
