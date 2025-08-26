import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../src/ui/App'

describe('App', () => {
  it('renders headings and controls', () => {
    render(<App />)
    expect(screen.getByText(/AI Studio Lite/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload PNG\/JPG/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Text prompt/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Style/)).toBeInTheDocument()
  })
})
