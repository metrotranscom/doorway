// requires yarn setup:large
describe.skip("Listings map", function () {
  it("renders the my applications page", function () {
    cy.visit("/")
    cy.getByTestId("View Listings-1").click()

    // Initial map load
    cy.getByTestId("map-total-results").contains("Total results 253")
    cy.getByTestId("map-pagination").contains("Page 1 of 11")
    cy.getByTestId("map-cluster").should("have.length", 7)

    // Click into one cluster
    cy.get('[aria-label="104 listings in this cluster"]').contains("104").click()
    cy.get('[aria-label="47 listings in this cluster"]').contains("47")
    cy.getByTestId("map-cluster").should("have.length", 24)
    cy.getByTestId("map-total-results").contains("Total results 245")
    cy.getByTestId("map-pagination").contains("Page 1 of 10")

    // Click into another cluster
    cy.get('[aria-label="2 listings in this cluster"]').contains("2").click()
    cy.get('[id^="marker-id"]').should("have.length", 2)
    cy.getByTestId("map-total-results").contains("Total results 2")
    cy.getByTestId("map-pagination").contains("Page 1 of 1")

    // Filter out all visible listings
    cy.getByID("listings-map-filter-button").contains("Filters 0").click()
    cy.getByID("county-item-Santa Clara").click()
    cy.getByID("listings-map-filter-dialog-show-button").click()
    cy.getByTestId("map-total-results").contains("Total results 0")
    cy.contains("No matching listings")

    // Clear filters
    cy.getByID("listings-map-filter-button").contains("Filters 1").click()
    cy.getByTestId("listings-map-filter-dialog-clear-button").click()
    cy.getByID("listings-map-filter-dialog-show-button").click()
    cy.get('[id^="marker-id"]').should("have.length", 2)

    // Open an info window
    cy.get('[id^="marker-id"]').first().click()
    cy.getByTestId("listings-map-info-window").should("be.visible")
  })
})
