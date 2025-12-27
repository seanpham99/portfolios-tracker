import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../routes/_auth.login'

// Mock React Router
vi.mock('react-router', () => ({
  useFetcher: () => ({
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    state: 'idle',
    data: null,
  }),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  redirect: vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

// Mock Framer Motion
vi.mock('framer-motion', async () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  useReducedMotion: () => false,
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => fn,
    watch: () => '',
  }),
  Controller: ({ render }: any) => render({ field: { value: '', onChange: () => {} }, fieldState: { invalid: false } }),
}))

describe('Login Component', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders login form elements', () => {
    render(<Login />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('renders Google and Email options', () => {
    render(<Login />)
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText(/Or continue with email/i)).toBeInTheDocument()
  })
})
