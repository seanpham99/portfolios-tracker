import { createClient } from '@/lib/supabase/server'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { type ActionFunctionArgs, Link, redirect, useFetcher } from 'react-router'

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = createClient(request)

  const formData = await request.formData()
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo') || '/'

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }

  return redirect(redirectTo, { headers })
}

export default function Login() {
  const fetcher = useFetcher<typeof action>()

  const error = fetcher.data?.error
  const loading = fetcher.state === 'submitting'

  return (
    <div className="w-full">
      <Card className="border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-light text-white">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400">Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <fetcher.Form method="post">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm text-zinc-400">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm text-zinc-400">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" name="password" required className="border-white/[0.08] bg-white/[0.03] text-white" />
              </div>
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link to="/sign-up" className="text-emerald-400 underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  )
}
