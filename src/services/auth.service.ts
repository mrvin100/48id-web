// Authentication service - implementation coming in Sprint 1

export interface LoginCredentials {
  matricule: string
  password: string
}

export interface AuthResponse {
  user: unknown // Will be properly typed in Sprint 1
  requiresPasswordChange: boolean
}

export class AuthService {
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    throw new Error('AuthService.login - implementation coming in Sprint 1')
  }

  async logout(): Promise<void> {
    throw new Error('AuthService.logout - implementation coming in Sprint 1')
  }

  async refreshToken(): Promise<void> {
    throw new Error(
      'AuthService.refreshToken - implementation coming in Sprint 1'
    )
  }

  async getCurrentUser(): Promise<unknown> {
    throw new Error(
      'AuthService.getCurrentUser - implementation coming in Sprint 1'
    )
  }
}

export const authService = new AuthService()
