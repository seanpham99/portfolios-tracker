import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignUp from '../routes/_auth.sign-up'

// Mock React Router
vi.mock('react-router', () => ({
  useFetcher: () => ({
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    state: 'idle',
    data: null,
  }),
  useSearchParams: () => [new URLSearchParams()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  redirect: vi.fn(),
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

describe('SignUp Component', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders signup form elements', () => {
    render(<SignUp />)
    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
  })

  it('renders Google and Email options', () => {
    render(<SignUp />)
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByText(/Or continue with email/i)).toBeInTheDocument()
  })
})
