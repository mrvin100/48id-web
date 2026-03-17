/**
 * Submit Button Component
 *
 * Reusable submit button with loading state and spinner.
 * Provides consistent styling and behavior across forms.
 */

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  isLoading?: boolean
  disabled?: boolean
  children?: ReactNode
  loadingText?: string
  className?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  type?: 'submit' | 'button'
}

export function SubmitButton({
  isLoading = false,
  disabled = false,
  children = 'Submit',
  loadingText,
  className,
  variant = 'default',
  size = 'default',
  type = 'submit',
}: SubmitButtonProps) {
  const isDisabled = isLoading || disabled

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn('w-full', className)}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
