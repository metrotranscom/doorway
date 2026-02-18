import { FormDemographics } from "../../../../../src/components/applications/PaperApplicationForm/sections/FormDemographics"
import { mockNextRouter, render, screen, FormProviderWrapper } from "../../../../testUtils"
import React from "react"
import userEvent from "@testing-library/user-event"
import { RaceEthnicityConfiguration } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { defaultRaceEthnicityConfiguration } from "@bloom-housing/shared-helpers/__tests__/testHelpers"

const customConfig: RaceEthnicityConfiguration = {
  options: [
    {
      id: "blackAfricanAmerican",
      subOptions: [],
      allowOtherText: false,
    },
    {
      id: "white",
      subOptions: [],
      allowOtherText: false,
    },

    {
      id: "otherMultiracial",
      subOptions: [],
      allowOtherText: true,
    },
  ],
}

beforeAll(() => {
  mockNextRouter()
})

describe("<FormDemographics>", () => {
  it("renders the form with full demographic information fields", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          raceEthnicityConfiguration={defaultRaceEthnicityConfiguration}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByText(/race/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/black/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Middle Eastern, West African or North African/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/pacific islander/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/white/i)).toBeInTheDocument()

    expect(screen.queryByLabelText(/Chinese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Filipino/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Japanese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Korean/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Vietnamese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Other Asian/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Native Hawaiian$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Guamanian or Chamorro/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Samoan/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Other Pacific Islander$/i)).not.toBeInTheDocument()

    expect(screen.getByText(/how did you hear about us/i))
    expect(screen.getByLabelText(/bus ad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email alert/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/flyer/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/friend/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/housing counselor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^other$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/radio ad/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/government website/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/property website/i)).toBeInTheDocument()
    // expect(screen.getByLabelText(/jurisdiction website/i)).toBeInTheDocument()
    // expect(screen.queryByLabelText(/government website/i)).not.toBeInTheDocument()
    // expect(screen.queryByLabelText(/property website/i)).not.toBeInTheDocument()
  })

  it("renders the form with limited how did you hear options when flag is enabled", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          raceEthnicityConfiguration={defaultRaceEthnicityConfiguration}
          enableLimitedHowDidYouHear={true}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByText(/race/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/black/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Middle Eastern, West African or North African/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/pacific islander/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/white/i)).toBeInTheDocument()

    expect(screen.queryByLabelText(/Chinese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Filipino/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Japanese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Korean/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Vietnamese/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Other Asian/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Native Hawaiian$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Guamanian or Chamorro/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Samoan/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Other Pacific Islander$/i)).not.toBeInTheDocument()

    expect(screen.getByText(/how did you hear about us/i))
    expect(screen.getByLabelText(/email alert/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/flyer/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/friend/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/housing counselor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^other$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/government website/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/property website/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/radio ad/i)).not.toBeInTheDocument()
    // expect(screen.getByLabelText(/jurisdiction website/i)).toBeInTheDocument()
    // expect(screen.queryByLabelText(/government website/i)).not.toBeInTheDocument()
    // expect(screen.queryByLabelText(/property website/i)).not.toBeInTheDocument()
  })

  it("should expand suboptions when main key is checked", async () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
          raceEthnicityConfiguration={defaultRaceEthnicityConfiguration}
          enableSpokenLanguage={false}
        />
      </FormProviderWrapper>
    )

    const asianCheckbox = screen.getByLabelText(/asian/i)
    const latinoCheckbox = screen.getByLabelText(/latino/i)

    await userEvent.click(asianCheckbox)
    await userEvent.click(latinoCheckbox)

    expect(screen.getByLabelText(/Chinese/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filipino/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Japanese/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Korean/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mongolian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Vietnamese/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Central Asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/South Asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Southeast Asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Other Asian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Caribbean/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Central American/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mexican/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/South American/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Other Latino/i)).toBeInTheDocument()
  })

  it("should show spoken language", async () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByRole("combobox", { name: "Spoken language" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Chinese - Cantonese" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Chinese - Mandarin" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Filipino" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Korean" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Russian" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Spanish" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Vietnamese" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Not Listed" })).toBeInTheDocument()
    expect(screen.queryAllByRole("textbox", { name: "Please specify:" })).toHaveLength(0)

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Spoken language" }),
      screen.getByRole("option", { name: "Not Listed" })
    )

    expect(screen.getByRole("textbox", { name: "Please specify:" })).toBeInTheDocument()
  })

  it("should hide ethnicity field when disableEthnicityQuestion flag is enabled", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={true}
          raceEthnicityConfiguration={defaultRaceEthnicityConfiguration}
        />
      </FormProviderWrapper>
    )

    expect(screen.queryByLabelText("Ethnicity")).not.toBeInTheDocument()
    expect(screen.getByText("Race", { selector: "legend" })).toBeInTheDocument()
  })

  it("should show ethnicity field when disableEthnicityQuestion flag is disabled", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
          raceEthnicityConfiguration={defaultRaceEthnicityConfiguration}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByLabelText("Ethnicity")).toBeInTheDocument()
    expect(screen.getByText("Race", { selector: "legend" })).toBeInTheDocument()
  })
  it("should render race options with custom configuration", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
          raceEthnicityConfiguration={customConfig}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByText("Race")).toBeInTheDocument()
    expect(screen.getByLabelText("White")).toBeInTheDocument()
    expect(screen.getByLabelText("Black / African American")).toBeInTheDocument()
    expect(screen.getByLabelText("Other / Multiracial")).toBeInTheDocument()

    // Should not show options not in the custom config
    expect(screen.queryByLabelText("American Indian / Alaskan Native")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Asian")).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText("Native Hawaiian / Other Pacific Islander")
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Decline to Respond")).not.toBeInTheDocument()
  })

  it("should render custom configuration with suboptions", async () => {
    const customConfig: RaceEthnicityConfiguration = {
      options: [
        {
          id: "asian",
          subOptions: [
            { id: "chinese", allowOtherText: false },
            { id: "vietnamese", allowOtherText: false },
          ],
          allowOtherText: false,
        },
        {
          id: "otherMultiracial",
          subOptions: [],
          allowOtherText: true,
        },
      ],
    }

    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
          raceEthnicityConfiguration={customConfig}
        />
      </FormProviderWrapper>
    )

    expect(screen.getByText("Race")).toBeInTheDocument()

    // Suboptions should not be visible until parent is clicked
    expect(screen.queryByLabelText("Chinese")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Vietnamese")).not.toBeInTheDocument()

    const asianCheckbox = screen.getByLabelText("Asian")
    await userEvent.click(asianCheckbox)

    expect(screen.getByLabelText("Chinese")).toBeInTheDocument()
    expect(screen.getByLabelText("Vietnamese")).toBeInTheDocument()

    // Should not show other Asian suboptions not in the custom config
    expect(screen.queryByLabelText("Japanese")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Filipino")).not.toBeInTheDocument()
  })

  it("should handle empty race options configuration", () => {
    const emptyConfig: RaceEthnicityConfiguration = {
      options: [],
    }

    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          disableEthnicityQuestion={false}
          raceEthnicityConfiguration={emptyConfig}
        />
      </FormProviderWrapper>
    )

    // Race section should not render if no options
    expect(screen.queryByText("Race")).not.toBeInTheDocument()

    // But ethnicity and how did you hear should still render
    expect(screen.getByLabelText("Ethnicity")).toBeInTheDocument()
    expect(screen.getByText("How did you hear about us?")).toBeInTheDocument()
  })

  it("shows spoken language select when feature flag enabled", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          enableSpokenLanguage={true}
          visibleSpokenLanguages={["spanish", "notListed"]}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    const select = screen.getByRole("combobox", {
      name: "Spoken language",
    })
    expect(select).toBeInTheDocument()

    const optionValues = Array.from(select.querySelectorAll("option")).map((option) => option.value)
    expect(optionValues).toEqual(expect.arrayContaining(["spanish", "notListed"]))
  })

  it("hides spoken language select when feature flag disabled", () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          enableSpokenLanguage={false}
          visibleSpokenLanguages={["spanish", "english"]}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    expect(
      screen.queryByRole("combobox", {
        name: "Which language is most commonly spoken in your home? Please select one:",
      })
    ).not.toBeInTheDocument()
  })

  it("shows not listed textbox when not listed is selected", async () => {
    render(
      <FormProviderWrapper>
        <FormDemographics
          formValues={{
            id: "id",
            race: [],
            howDidYouHear: [],
          }}
          enableLimitedHowDidYouHear={false}
          enableSpokenLanguage={true}
          visibleSpokenLanguages={["spanish", "english", "notListed"]}
          disableEthnicityQuestion={false}
        />
      </FormProviderWrapper>
    )

    const select = screen.getByRole("combobox", {
      name: "Spoken language",
    })
    await userEvent.selectOptions(select, "notListed")

    expect(screen.getByLabelText("Please specify:")).toBeInTheDocument()
  })
})
