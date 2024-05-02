import { ElmVillageApplication, minimalDataApplication } from "../../mockData/applicationData"

describe("My applications page", function () {
  it("renders the my applications page", function () {
    cy.visit("/sign-in")
    cy.signIn()
    cy.url().should("include", "/account/dashboard")
    cy.getByID("account-dashboard-applications").click()
    cy.location("pathname").should("include", "/account/applications")
  })

  it("renders completed application associated with my account", function () {
    cy.submitApplication("Elm Village", ElmVillageApplication, false)
    cy.visit("/account/applications")
    cy.getByID("listing-name").contains("Elm Village")
  })
})
