import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Heading, HeadingGroup, Icon } from "@bloom-housing/ui-seeds"
import Card from "@bloom-housing/ui-seeds/src/blocks/Card"
import React from "react"
import styles from "./BloomCard.module.scss"
import { CustomIconMap, CustomIconType } from "../CustomIconMap"
import { ClickableCard } from "./ClickableCard"

interface BloomCardProps {
  standardIcon?: IconDefinition
  children: React.ReactElement
  className?: string
  iconClassName?: string
  variant?: "form" | "block"
  clickable?: boolean
  headerLink?: React.ReactNode
  headingPriority?: 1 | 2 | 3 | 4 | 5 | 6
  headingClass?: string
  iconClass?: string
  iconOutlined?: boolean
  iconSymbol?: CustomIconType
  id?: string
  subtitle?: string | React.ReactNode
  title?: string
  titleTabIndex?: number
  titleId?: string
  altHeading?: boolean
}

const BloomCard = (props: BloomCardProps) => {
  const classNames = [props.variant === "block" ? styles["block-card"] : styles["form-card"]]
  if (props.className) classNames.push(props.className)

  const iconClassNames = [styles["card-icon"]]
  if (props.iconClassName) iconClassNames.push(props.iconClassName)

  const customIcon = props.iconSymbol ? CustomIconMap[props.iconSymbol] : undefined

  const getTitle = () => {
    if (props.title) {
      if (props.subtitle) {
        return (
          <HeadingGroup
            headingProps={{
              id: props.titleId,
              priority: props.headingPriority || 1,
              size: "2xl",
              tabIndex: props.titleTabIndex,
              className: props.headingClass ? props.headingClass : "",
            }}
            heading={props.title}
            subheading={props.subtitle}
            className={`${styles["card-heading-group"]} ${styles["card-heading"]}`}
          />
        )
      }
      return (
        <Heading
          size="2xl"
          priority={props.headingPriority || 1}
          className={`${props.altHeading ? styles["card-alt-heading-font"] : ""} ${
            props.headingClass ? props.headingClass : ""
          }`}
          id={props.titleId}
          tabIndex={props.titleTabIndex}
        >
          {props.title}
        </Heading>
      )
    }
    return null
  }

  const title = getTitle()

  const cardContent = (
    <>
      {title && (
        <Card.Header divider={props.variant === "block" ? undefined : "inset"}>
          {customIcon && (
            <Icon
              size={props.altHeading ? undefined : "2xl"}
              className={`${styles["card-icon"]} ${props.iconClass ? props.iconClass : ""} ${
                props.altHeading ? styles["card-circled-icon"] : ""
              }`}
              outlined={props.iconOutlined}
            >
              {customIcon}
            </Icon>
          )}
          {props?.standardIcon && (
            <Icon size="2xl" icon={props?.standardIcon} className={iconClassNames.join(" ")} />
          )}
          {props.headerLink && props.headerLink}
          {title}
        </Card.Header>
      )}
      {props.children}
    </>
  )

  return (
    <>
      {props.clickable ? (
        <ClickableCard cardProps={{ spacing: "lg" }} className={classNames.join(" ")}>
          {cardContent}
        </ClickableCard>
      ) : (
        <Card spacing="lg" className={classNames.join(" ")}>
          {cardContent}
        </Card>
      )}
    </>
  )
}

export { BloomCard as default, BloomCard }
