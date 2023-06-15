import React from "react"
import { t } from "@bloom-housing/ui-components"
import {
  CardProps,
  Card,
  DoorwayCollapsibleSection,
  Heading,
} from "@bloom-housing/doorway-ui-components"

export const questionsCardIntro: React.ReactElement<CardProps> = (
  <Card className="border-0 p-0">
  </Card>
)

export const questionsLinkableCards: React.ReactElement<CardProps>[] = [
  <Card
    className="border-0"
    key="preparation"
    jumplinkData={{ title: t("help.faq.processPreparation") }}
  >
    <Card.Header>
      <Heading priority={2} className={"text-primary-lighter font-semibold"}>
        {t("help.faq.processPreparation")}
      </Heading>
    </Card.Header>
    <Card.Section>
      <DoorwayCollapsibleSection title={t("help.faq.neededIdentification")}>
        <span>
          <span className="text__medium-weighted">{t("help.faq.neededIdentificationResp1")}</span><br />
          {t("help.faq.neededIdentificationResp2")}<br /><br />
          <span className="text__medium-weighted">{t("help.faq.neededIdentificationResp3")}</span><br />
          {t("help.faq.neededIdentificationResp4")}
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.neededIdentificationResp4a")}</li>
            <li>{t("help.faq.neededIdentificationResp4b")}</li>
          </ul>
          {t("help.faq.neededIdentificationResp5")}
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.neededIdentificationResp5a")}</li>
            <li>{t("help.faq.neededIdentificationResp5b")}</li>
          </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("help.faq.paperwork")}>
        <span>
          {t("help.faq.paperworkResp")}<br /><br />
          <span className="text__medium-weighted">{t("help.faq.paperworkRespIncomeTitle")}</span><br />
          {t("help.faq.paperworkRespIncomeHeader")}<br />
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.paperworkRespIncome1")}</li>
            <li>{t("help.faq.paperworkRespIncome2")}</li>
            <li>{t("help.faq.paperworkRespIncome3")}</li>
            <li>{t("help.faq.paperworkRespIncome4")}</li>
            <li>{t("help.faq.paperworkRespIncome5")}</li>
            <li>{t("help.faq.paperworkRespIncome6")}</li>
          </ul>
          <span className="text__medium-weighted">{t("help.faq.paperworkRespExpensesTitle")}</span><br />
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.paperworkRespExpenses1")}</li>
            <li>{t("help.faq.paperworkRespExpenses2")}</li>
            <li>{t("help.faq.paperworkRespExpenses3")}</li>
            <li>{t("help.faq.paperworkRespExpenses4")}</li>
          </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("help.faq.householdSizeIncome")}>
        <span>
          <span className="text__medium-weighted">{t("help.faq.householdSizeIncomeResp1")}</span><br />
          {t("help.faq.householdSizeIncomeResp2")}<br /><br />
          <span className="text__medium-weighted">{t("help.faq.householdSizeIncomeResp3")}</span><br />
          {t("help.faq.householdSizeIncomeResp4")}
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("help.faq.sizeUnit")}>
        <span>
          <span className="text__medium-weighted">{t("help.faq.sizeUnitResp1")}</span><br />
          {t("help.faq.sizeUnitResp2")}<br />
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.sizeUnitResp3")}</li>
            <li>{t("help.faq.sizeUnitResp4")}</li>
            <li>{t("help.faq.sizeUnitResp5")}</li>
          </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("help.faq.improveChances")}>
        <span>
          <ul className="text__medium-normal list-disc ml-5">
            <li>{t("help.faq.improveChancesResp1")}</li>
            <li>{t("help.faq.improveChancesResp2")}</li>
            <li>
              {t("help.faq.improveChancesResp3")}
              <a href="https://www.debt.org/credit/improving-your-score/" target="_blank">{t("help.faq.improveChancesResp4")}</a>
            </li>
            <li>{t("help.faq.improveChancesResp5")}</li>
            <li>
            <a href="https://public.govdelivery.com/accounts/CAMTC/signup/36832" target="_blank">
              {t("help.faq.improveChancesResp6")}
            </a>
            {t("help.faq.improveChancesResp7")}
            </li>
          </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>      
    </Card.Section>
    <Card.Section>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
    </Card.Section>
    <Card.Section>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title={t("")}>
        <span>
        <ul className="text__medium-normal list-disc ml-5">
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </span>
      </DoorwayCollapsibleSection>
    </Card.Section>
    <Card.Footer>
      <Card.Section>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam ullam a sunt veniam officiis
        quae vitae similique non odio, minus minima nisi voluptatem? Sequi veritatis, sunt cumque
        delectus culpa harum? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Esse illo
        ullam nulla possimus, incidunt mollitia culpa quam, ex sequi totam provident iusto. Velit
        totam deleniti unde fugiat minima omnis commodi! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Voluptatem excepturi nemo doloribus est consequatur praesentium enim
        voluptate fuga qui earum repellendus, placeat facere debitis ex eaque repudiandae provident
        inventore illo.
      </Card.Section>
    </Card.Footer>
  </Card>,
  <Card
    className="border-0"
    key="blah-2"
    jumplinkData={{ title: "I'm just a heading for blah 2 jumplink" }}
  >
    <Card.Header>
      <Heading priority={2} className={"text-primary-lighter font-semibold"}>
        {"I'm just a heading for blah 2"}
      </Heading>
    </Card.Header>
    <Card.Section>this blah blah blah is text</Card.Section>
    <Card.Section>
      <DoorwayCollapsibleSection title="blah title">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam ullam a sunt veniam officiis
        quae vitae similique non odio, minus minima nisi voluptatem? Sequi veritatis, sunt cumque
        delectus culpa harum? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Esse illo
        ullam nulla possimus, incidunt mollitia culpa quam, ex sequi totam provident iusto. Velit
        totam deleniti unde fugiat minima omnis commodi! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Voluptatem excepturi nemo doloribus est consequatur praesentium enim
        voluptate fuga qui earum repellendus, placeat facere debitis ex eaque repudiandae provident
        inventore illo.
      </DoorwayCollapsibleSection>
      <DoorwayCollapsibleSection title="blah title 2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam ullam a sunt veniam officiis
        quae vitae similique non odio, minus minima nisi voluptatem? Sequi veritatis, sunt cumque
        delectus culpa harum? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Esse illo
        ullam nulla possimus, incidunt mollitia culpa quam, ex sequi totam provident iusto. Velit
        totam deleniti unde fugiat minima omnis commodi! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Voluptatem excepturi nemo doloribus est consequatur praesentium enim
        voluptate fuga qui earum repellendus, placeat facere debitis ex eaque repudiandae provident
        inventore illo.
      </DoorwayCollapsibleSection>
    </Card.Section>
    <Card.Footer>
      <Card.Section>
        <p>Footer content here.</p>
      </Card.Section>
    </Card.Footer>
  </Card>,
]
