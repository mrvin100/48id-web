// Cypress E2E Support File
// Load type definitions
/// <reference types="cypress" />

// Import testing-library commands
import '@testing-library/cypress/add-commands'

// Custom command: Login
Cypress.Commands.add('login', (matricule: string, password: string) => {
  // Clear any existing session
  cy.clearCookies()
  cy.clearLocalStorage()

  // Visit login page
  cy.visit('/login')

  // Submit login form
  cy.get('input[name="matricule"]').type(matricule)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()

  // Wait for successful redirect to dashboard
  cy.url().should('include', '/dashboard')
})

// Custom command: Logout
Cypress.Commands.add('logout', () => {
  // Open user menu and click logout
  cy.get('[data-testid="user-menu"]').click()
  cy.contains('Sign out').click()

  // Wait for redirect to login
  cy.url().should('include', '/login')
})

// Custom command: Create user via API
Cypress.Commands.add(
  'createTestUser',
  (userData: Partial<Cypress.TestUser>) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/v1/admin/users`,
      body: userData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
)

// Custom command: Delete user via API
Cypress.Commands.add('deleteTestUser', (userId: string) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/api/v1/admin/users/${userId}`,
  })
})

// Custom command: Wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="page-loaded"]').should('exist')
})

// Custom command: Mock API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  cy.intercept('GET', `**/api/v1/${endpoint}`, response)
})

// Custom command: Mock login response
Cypress.Commands.add('mockLogin', (user?: Partial<Cypress.TestUser>) => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      user: {
        id: 'test-user-id',
        matricule: 'K48-2024-001',
        email: 'test@k48.io',
        name: 'Test User',
        role: 'ADMIN',
        status: 'ACTIVE',
        ...user,
      },
    },
  })
})

// Custom command: Mock users list response
Cypress.Commands.add('mockUsersList', (users?: unknown[]) => {
  cy.intercept('GET', '**/api/v1/users*', {
    statusCode: 200,
    body: {
      content: users || [
        {
          id: 'user-1',
          matricule: 'K48-2024-001',
          email: 'user1@k48.io',
          name: 'User One',
          firstName: 'User',
          lastName: 'One',
          role: 'STUDENT',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-2',
          matricule: 'K48-2024-002',
          email: 'user2@k48.io',
          name: 'User Two',
          firstName: 'User',
          lastName: 'Two',
          role: 'STUDENT',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 20,
      first: true,
      last: true,
    },
  })
})

// Custom command: Verify no tokens in localStorage
Cypress.Commands.add('verifyNoTokens', () => {
  cy.window().then(win => {
    expect(win.localStorage.getItem('token')).to.be.null
    expect(win.localStorage.getItem('refresh_token')).to.be.null
    expect(win.localStorage.getItem('access_token')).to.be.null
  })
})

// Global beforeEach hook
beforeEach(() => {
  // Preserve session cookies across tests
  // Note: Cypress.Cookies.preserveOnce is deprecated, using automatic cookie preservation
})

// Global afterEach hook
afterEach(() => {
  // Clear any test data if needed
})

// TypeScript declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface TestUser {
      id: string
      matricule: string
      email: string
      name: string
      role: string
      status: string
    }

    interface Chainable {
      login(matricule: string, password: string): Chainable<void>
      logout(): Chainable<void>
      createTestUser(userData: Partial<TestUser>): Chainable<void>
      deleteTestUser(userId: string): Chainable<void>
      waitForPageLoad(): Chainable<void>
      mockApiResponse(endpoint: string, response: unknown): Chainable<void>
      mockLogin(user?: Partial<TestUser>): Chainable<void>
      mockUsersList(users?: unknown[]): Chainable<void>
      verifyNoTokens(): Chainable<void>
    }
  }
}

export {}
