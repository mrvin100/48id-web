import { apiClient } from './client'
import { HTTPError } from 'ky'

export interface ActivationResponse {
  success: boolean
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

async function extractMessage(err: HTTPError, fallback: string): Promise<never> {
  const body = await err.response.json().catch(() => ({})) as Record<string, unknown>
  throw new Error((body.detail ?? body.message ?? fallback) as string)
}

export const activationApi = {
  activateAccount: async (token: string): Promise<ActivationResponse> => {
    try {
      return await apiClient.post('auth/activate', { json: { token } }).json<ActivationResponse>()
    } catch (err) {
      if (err instanceof HTTPError) await extractMessage(err, 'Activation failed')
      throw err
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    try {
      return await apiClient.post('auth/reset-password', { json: { token, newPassword } }).json<ResetPasswordResponse>()
    } catch (err) {
      if (err instanceof HTTPError) await extractMessage(err, 'Password reset failed')
      throw err
    }
  },
}

