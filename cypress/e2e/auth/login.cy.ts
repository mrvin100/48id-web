/**
 * Login E2E Tests
 *
 * Tests for authentication login flow.
 *
 * Requirements: WEB-07-02
 */

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('input[name="matricule"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign in')
  })

  it('should show validation error for empty form', () => {
    cy.get('button[type="submit"]').click()

    // Should show validation errors
    cy.get('input[name="matricule"]').should(
      'have.attr',
      'aria-invalid',
      'true'
    )
    cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true')
  })

  it('should show error for invalid credentials', () => {
    // Mock failed login response (401)
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Matricule or password is incorrect',
      },
    })

    cy.get('input[name="matricule"]').type('INVALID')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // Should show error message
    cy.contains('Matricule or password is incorrect').should('be.visible')
  })

  it('should redirect to dashboard on successful login', () => {
    cy.mockLogin()

    cy.get('input[name="matricule"]').type('K48-2024-001')
    cy.get('input[name="password"]').type('correctpassword')
    cy.get('button[type="submit"]').click()

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should toggle password visibility', () => {
    const passwordInput = cy.get('input[name="password"]')

    passwordInput.type('testpassword')
    passwordInput.should('have.attr', 'type', 'password')

    // Click visibility toggle
    cy.get('button[aria-label="Show password"]').click()
    passwordInput.should('have.attr', 'type', 'text')

    // Click again to hide
    cy.get('button[aria-label="Hide password"]').click()
    passwordInput.should('have.attr', 'type', 'password')
  })

  it('should redirect to change-password if requiresPasswordChange is true', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        requiresPasswordChange: true,
        user: {
          id: 'test-user-id',
          matricule: 'K48-2024-001',
          email: 'test@k48.io',
          name: 'Test User',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      },
    })

    cy.get('input[name="matricule"]').type('K48-2024-001')
    cy.get('input[name="password"]').type('temppassword')
    cy.get('button[type="submit"]').click()

    // Should redirect to change-password
    cy.url().should('include', '/change-password')
  })

  it('should show account locked message for 423 response', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 423,
      body: {
        error: 'Account locked',
        message: 'Account temporarily locked. Try again in 5 minutes.',
      },
    })

    cy.get('input[name="matricule"]').type('K48-2024-001')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.contains('Account temporarily locked').should('be.visible')
  })
})

describe('Authenticated User Redirect', () => {
  it('should redirect authenticated user from /login to /dashboard', () => {
    // Simulate authenticated session
    cy.setCookie(Cypress.env('jwtCookieName'), 'valid-jwt-token')

    cy.visit('/login')

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
  })
})
