import React from "react"
import { render, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ImageCard } from "../../src/blocks/ImageCard"

afterEach(cleanup)

describe("<ImageCard>", () => {
  it("renders title, subtitle, image and alt text", () => {
    const { getByAltText } = render(
      <ImageCard imageUrl={"/images/listing.jpg"} description={"A description of the image"} />
    )

    expect(getByAltText("A description of the image")).not.toBeNull()
  })

  it("renders with a link", () => {
    const { getByAltText } = render(<ImageCard imageUrl={"/images/listing.jpg"} href="/listings" />)
    expect(getByAltText("A picture of the building").closest("a")?.getAttribute("href")).toBe(
      "/listings"
    )
  })

  it("renders with image tags", () => {
    const { getByText } = render(
      <ImageCard
        imageUrl={"/images/listing.jpg"}
        tags={[
          { text: "This is a long label", iconType: "mail" },
          { text: "This is another longer label" },
        ]}
      />
    )
    expect(getByText("This is a long label")).not.toBeNull()
    expect(getByText("This is another longer label")).not.toBeNull()
  })

  it.skip("renders multiple images", async () => {
    const portalRoot = document.createElement("div")
    portalRoot.setAttribute("id", "__next")
    document.body.appendChild(portalRoot)

    const { getByAltText, getByTestId } = render(
      <ImageCard
        images={[
          { url: "/images/listing.jpg", description: "A description of the image" },
          { url: "/images/banner.png", description: "second image" },
        ]}
      />
    )
    expect(getByAltText("A description of the image")).not.toBeNull()
    expect(getByAltText("second image")).not.toBeNull()

    expect(portalRoot.querySelectorAll("picture").length).toBe(0)
    await userEvent.click(getByTestId("open-modal-button"))
    expect(portalRoot.querySelectorAll("picture").length).toBe(2)
  })
})
