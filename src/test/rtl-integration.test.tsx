import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Simple test component
function TestButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} data-testid="test-button">
      Click me
    </button>
  )
}

describe('React Testing Library Integration', () => {
  it('should render components correctly', () => {
    const mockClick = jest.fn()
    render(<TestButton onClick={mockClick} />)

    const button = screen.getByTestId('test-button')
    expect(button).toBeDefined()
    expect(button.textContent).toBe('Click me')
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const mockClick = jest.fn()

    render(<TestButton onClick={mockClick} />)

    const button = screen.getByTestId('test-button')
    await user.click(button)

    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('should find text content', () => {
    render(<div>Hello Testing Library</div>)
    const element = screen.getByText('Hello Testing Library')
    expect(element).toBeDefined()
    expect(element.textContent).toBe('Hello Testing Library')
  })
})
