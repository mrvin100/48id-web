// Error handling utilities - implementation coming in Sprint 6

export interface UserFriendlyError {
  title: string
  message: string
  actions?: ErrorAction[]
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface ErrorAction {
  label: string
  action: () => void
  primary?: boolean
}

export interface ErrorContext {
  component?: string
  user?: unknown
  timestamp: string
  url?: string
}

export class ErrorHandler {
  handleError(_error: Error): UserFriendlyError {
    // Error handling logic will be implemented in Sprint 6
    console.log('ErrorHandler.handleError - implementation coming in Sprint 6')

    return {
      title: 'An error occurred',
      message: 'Please try again later',
      severity: 'error',
    }
  }

  logError(_error: Error, _context: ErrorContext): void {
    // Error logging logic will be implemented in Sprint 6
    console.log('ErrorHandler.logError - implementation coming in Sprint 6')
  }

  shouldRetry(_error: Error): boolean {
    // Retry logic will be implemented in Sprint 6
    console.log('ErrorHandler.shouldRetry - implementation coming in Sprint 6')
    return false
  }
}

export const errorHandler = new ErrorHandler()
