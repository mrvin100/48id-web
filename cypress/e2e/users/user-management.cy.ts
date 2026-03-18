/**
 * User Management E2E Tests
 *
 * Tests for user management workflows.
 *
 * Requirements: WEB-07-03
 */

describe('User Management', () => {
  beforeEach(() => {
    // Mock login and users list
    cy.mockLogin()
    cy.mockUsersList()

    // Login
    cy.visit('/login')
    cy.get('input[name="matricule"]').type('K48-2024-001')
    cy.get('input[name="password"]').type('correctpassword')
    cy.get('button[type="submit"]').click()

    // Wait for dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should display users page with table', () => {
    cy.visit('/users')

    // Should show users table
    cy.get('table').should('be.visible')
    cy.contains('K48-2024-001').should('be.visible')
    cy.contains('User One').should('be.visible')
  })

  it('should open user detail sheet on row click', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Should open detail sheet
    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('User One').should('be.visible')
  })

  it('should show profile tab with user information', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Should show profile tab
    cy.contains('Profile').click()
    cy.contains('Email').should('be.visible')
    cy.contains('user1@k48.io').should('be.visible')
  })

  it('should show activity tab with user activity', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Switch to activity tab
    cy.contains('Activity').click()
    cy.contains('Last Login').should('be.visible')
    cy.contains('Account Created').should('be.visible')
  })

  it('should show security tab with suspend option', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Switch to security tab
    cy.contains('Security').click()
    cy.contains('Account Status').should('be.visible')
    cy.contains('Suspend').should('be.visible')
  })

  it('should show confirmation dialog before suspend', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Switch to security tab and click suspend
    cy.contains('Security').click()
    cy.contains('Suspend').click()

    // Should show confirmation dialog
    cy.contains('Suspend Account').should('be.visible')
    cy.contains('Cancel').should('be.visible')
  })

  it('should cancel suspend on dialog cancel', () => {
    cy.visit('/users')

    // Click on user row
    cy.contains('User One').click()

    // Switch to security tab and click suspend
    cy.contains('Security').click()
    cy.contains('Suspend').click()

    // Cancel
    cy.contains('Cancel').click()

    // Dialog should close
    cy.contains('Suspend Account').should('not.exist')
  })

  it('should search users with debounced input', () => {
    cy.visit('/users')

    // Mock search API
    cy.intercept('GET', '**/api/v1/users?search=user*', {
      statusCode: 200,
      body: {
        content: [
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
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 20,
        first: true,
        last: true,
      },
    })

    // Type in search box
    cy.get('input[placeholder*="Search users"]').type('user')

    // Should filter results
    cy.contains('User One').should('be.visible')
  })

  it('should filter users by status', () => {
    cy.visit('/users')

    // Open status filter
    cy.contains('All Status').click()

    // Select ACTIVE status
    cy.contains('Active').click()

    // Should filter by active users
    cy.url().should('include', 'status=ACTIVE')
  })

  it('should show action menu with options', () => {
    cy.visit('/users')

    // Open action menu
    cy.get('button[aria-label="Open menu"]').first().click()

    // Should show menu options
    cy.contains('View details').should('be.visible')
    cy.contains('Edit profile').should('be.visible')
    cy.contains('Force password reset').should('be.visible')
    cy.contains('Suspend').should('be.visible')
  })

  it('should paginate through users', () => {
    cy.visit('/users')

    // Should show pagination controls
    cy.contains('Page 1').should('be.visible')
    cy.get('button[aria-label="Go to next page"]').should('be.visible')

    // Click next page
    cy.get('button[aria-label="Go to next page"]').click()

    // Should update page indicator
    cy.contains('Page 2').should('be.visible')
  })

  it('should show loading state', () => {
    // Mock slow API response
    cy.intercept('GET', '**/api/v1/users*', {
      delay: 1000,
      body: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
        first: true,
        last: true,
      },
    })

    cy.visit('/users')

    // Should show loading state
    cy.contains('Loading users').should('be.visible')
  })

  it('should show error state on API failure', () => {
    // Mock API error
    cy.intercept('GET', '**/api/v1/users*', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    })

    cy.visit('/users')

    // Should show error state
    cy.contains('Error loading users').should('be.visible')
  })
})
