import React from "react"
import { setupServer } from "msw/lib/node"
import { fireEvent, screen } from "@testing-library/react"
import { blankApplication } from "@bloom-housing/shared-helpers"
import {
  FeatureFlag,
  FeatureFlagEnum,
  Listing,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { mockNextRouter, render } from "../../../testUtils"
import ApplicationConductor from "../../../../src/lib/applications/ApplicationConductor"
import { AppSubmissionContext } from "../../../../src/lib/applications/AppSubmissionContext"
import ApplicationDemographics from "../../../../src/pages/applications/review/demographics"

window.scrollTo = jest.fn()

const server = setupServer()

beforeAll(() => {
  server.listen()
  mockNextRouter()
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

describe("applications pages", () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  describe("demographics step", () => {
    it("should render form fields", () => {
      render(<ApplicationDemographics />)

      expect(screen.getByText("Help us better serve you.")).toBeInTheDocument()
      expect(
        screen.getByText("Which best describes your race? Please select all that apply:", {
          selector: "legend",
        })
      ).toBeInTheDocument()
      // expect(
      //   screen.getByRole("checkbox", { name: "American Indian / Alaskan Native" })
      // ).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "Asian" })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "Black" })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "Pacific Islander" })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "White" })).toBeInTheDocument()
      // expect(screen.getByRole("checkbox", { name: "Other / Multiracial" })).toBeInTheDocument()
      // expect(screen.getByRole("checkbox", { name: "Decline to respond" })).toBeInTheDocument()
      expect(screen.getByLabelText("Which best describes your ethnicity?")).toBeInTheDocument()
      expect(
        screen.getAllByRole("checkbox", {
          name: /Government website|Property website|Flyer|Email alert|Friend|Housing counselor|Radio ad|Bus ad|Other/,
        })
      ).toHaveLength(9)
    })

    it("should render sub demographics fields when parent is checked", () => {
      render(<ApplicationDemographics />)

      expect(screen.queryByText("Asian Indian")).not.toBeInTheDocument()
      expect(screen.queryByText("Chinese")).not.toBeInTheDocument()
      expect(screen.queryByRole("checkbox", { name: "Filipino" })).not.toBeInTheDocument()
      expect(screen.queryByText("Japanese")).not.toBeInTheDocument()
      expect(screen.queryByRole("checkbox", { name: "Korean" })).not.toBeInTheDocument()
      expect(screen.queryByRole("checkbox", { name: "Vietnamese" })).not.toBeInTheDocument()
      expect(screen.queryByText("Other Asian")).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole("checkbox", { name: "Asian" }))

      expect(screen.getByText("Mongolian")).toBeInTheDocument()
      expect(screen.getByText("Chinese")).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "Filipino" })).toBeInTheDocument()
      expect(screen.getByText("Japanese")).toBeInTheDocument()
      expect(screen.queryByRole("checkbox", { name: "Korean" })).toBeInTheDocument()
      expect(screen.queryByRole("checkbox", { name: "Vietnamese" })).toBeInTheDocument()
      expect(screen.getByText("Other Asian")).toBeInTheDocument()

      expect(screen.queryByText("Native Hawaiian")).not.toBeInTheDocument()
      expect(screen.queryByText("Chamorro")).not.toBeInTheDocument()
      expect(screen.queryByText("Samoan")).not.toBeInTheDocument()
      // expect(screen.queryByText("Other Pacific Islander")).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole("checkbox", { name: "Pacific Islander" }))

      expect(screen.getByText("Native Hawaiian")).toBeInTheDocument()
      expect(screen.getByText("Chamorro")).toBeInTheDocument()
      expect(screen.getByText("Samoan")).toBeInTheDocument()
      expect(screen.getByText("Other Pacific Islander")).toBeInTheDocument()
    })

    it("should show other text fields when other options are checked", async () => {
      render(<ApplicationDemographics />)

      expect(screen.queryByText("Please specify:")).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole("checkbox", { name: "Asian" }))
      fireEvent.click(screen.getByRole("checkbox", { name: "Other Asian" }))

      expect(screen.queryByTestId("pacificIslander-otherPacificIslander")).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole("checkbox", { name: "Pacific Islander" }))
      fireEvent.click(screen.getByRole("checkbox", { name: "Other Pacific Islander" }))
      expect(await screen.findAllByTestId("pacificIslander-otherPacificIslander")).toHaveLength(2)

      // expect(await screen.findAllByTestId("otherMultiracial")).toHaveLength(1)
      // fireEvent.click(screen.getByRole("checkbox", { name: "Other / Multiracial" }))
      // expect(await screen.findAllByTestId("otherMultiracial")).toHaveLength(2)
    })
  })

  it("should show full list of how did you hear fields", () => {
    render(<ApplicationDemographics />)
    expect(screen.getByText("How did you hear about this listing?")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Government website" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Property website" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Flyer" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Email alert" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Friend" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Friend" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Housing counselor" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Radio ad" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Bus ad" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Other" })).toBeInTheDocument()
  })

  it("should show limited list of how did you hear fields when enableLimitedHowDidYouHear is on", () => {
    const conductor = new ApplicationConductor({}, {})
    conductor.config.featureFlags = [
      { name: FeatureFlagEnum.enableLimitedHowDidYouHear, active: true } as FeatureFlag,
    ]
    render(
      <AppSubmissionContext.Provider
        value={{
          conductor: conductor,
          application: JSON.parse(JSON.stringify(blankApplication)),
          listing: {} as unknown as Listing,
          syncApplication: () => {
            return
          },
          syncListing: () => {
            return
          },
        }}
      >
        <ApplicationDemographics />
      </AppSubmissionContext.Provider>
    )
    expect(screen.getByText("How did you hear about this listing?")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Government website" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Property website" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Flyer" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Email alert" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Friend" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Friend" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Housing counselor" })).toBeInTheDocument()
    expect(screen.queryByRole("checkbox", { name: "Radio ad" })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox", { name: "Bus ad" })).not.toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Other" })).toBeInTheDocument()
  })

  it("should hide ethnicity field when disabledEthnicityQuestion flag is on", () => {
    const conductor = new ApplicationConductor({}, {})
    conductor.config.featureFlags = [
      { name: FeatureFlagEnum.disableEthnicityQuestion, active: true } as FeatureFlag,
    ]
    render(
      <AppSubmissionContext.Provider
        value={{
          conductor: conductor,
          application: JSON.parse(JSON.stringify(blankApplication)),
          listing: {} as unknown as Listing,
          syncApplication: () => {
            return
          },
          syncListing: () => {
            return
          },
        }}
      >
        <ApplicationDemographics />
      </AppSubmissionContext.Provider>
    )
    expect(screen.queryByLabelText("Which best describes your ethnicity?")).not.toBeInTheDocument()
    expect(
      screen.getByText("Which best describes your race/ethnicity? Please select all that apply:", {
        selector: "legend",
      })
    ).toBeInTheDocument()
  })
})
