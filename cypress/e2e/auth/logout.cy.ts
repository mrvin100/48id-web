/**
 * Logout E2E Tests
 *
 * Tests for authentication logout flow.
 *
 * Requirements: WEB-07-02
 */

describe('Logout Flow', () => {
  beforeEach(() => {
    // Mock successful login
    cy.mockLogin()

    // Login
    cy.visit('/login')
    cy.get('input[name="matricule"]').type('K48-2024-001')
    cy.get('input[name="password"]').type('correctpassword')
    cy.get('button[type="submit"]').click()

    // Wait for dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should display logout option in user menu', () => {
    // Open user menu
    cy.get('[data-testid="user-menu"]').click()

    // Should show logout option
    cy.contains('Sign out').should('be.visible')
  })

  it('should show confirmation dialog before logout', () => {
    // Open user menu and click logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()

    // Should show confirmation dialog
    cy.contains('Are you sure').should('be.visible')
    cy.contains('Cancel').should('be.visible')
  })

  it('should logout and redirect to login on confirmation', () => {
    // Mock logout API call
    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 200,
      body: { success: true },
    })

    // Open user menu and click logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()

    // Confirm logout - scope to dialog to avoid ambiguity
    cy.get('[role="alertdialog"]').contains('Sign out').click()

    // Wait for navigation to complete
    cy.url().should('include', '/login')
  })

  it('should clear session cookies on logout', () => {
    // Mock logout API call
    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 200,
      body: { success: true },
    })

    // Precondition: Verify cookies exist before logout
    cy.getCookie(Cypress.env('jwtCookieName')).should('exist')
    cy.getCookie(Cypress.env('refreshCookieName')).should('exist')

    // Logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()
    cy.contains('Sign out').click()

    // Cookies should be cleared
    cy.getCookie(Cypress.env('jwtCookieName')).should('be.null')
    cy.getCookie(Cypress.env('refreshCookieName')).should('be.null')
  })

  it('should not access dashboard after logout', () => {
    // Mock logout API call
    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 200,
      body: { success: true },
    })

    // Logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()
    cy.contains('Sign out').click()

    // Try to access dashboard
    cy.visit('/dashboard')

    // Should redirect to login
    cy.url().should('include', '/login')
  })

  it('should always succeed from user perspective even if API fails', () => {
    // Mock logout API failure
    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 500,
      body: { error: 'Server error' },
    })

    // Logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()
    cy.contains('Sign out').click()

    // Should still redirect to login (logout always succeeds)
    cy.url().should('include', '/login')
  })
})
