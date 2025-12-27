import { Outlet, Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { LiveIndicator } from "@/components/live-indicator";
import { NotificationCenter } from "@/components/notification-center";
import { getUser } from "@/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

export default function Layout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0b]">
      <header className="flex items-center justify-between border-b border-white/6 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <span className="text-lg font-semibold text-emerald-400">F</span>
          </div>
          <span className="font-serif text-xl font-light tracking-tight text-white">
            Finsight
          </span>
        </div>

        <div className="flex items-center gap-4">
          <LiveIndicator />
          <div className="h-6 w-px bg-white/8" />
          {/* `_protected` parent enforces auth, so we always have a user here */}
          <nav className="flex items-center gap-2 text-sm">
            <Link className="text-zinc-400 hover:text-white" to="/">
              Home
            </Link>
            <span className="text-zinc-700">/</span>
            <Link className="text-zinc-400 hover:text-white" to="/history">
              History
            </Link>
            <span className="text-zinc-700">/</span>
            <Link className="text-zinc-400 hover:text-white" to="/analytics">
              Analytics
            </Link>
            <span className="text-zinc-700">/</span>
            <Link className="text-zinc-400 hover:text-white" to="/settings">
              Settings
            </Link>
          </nav>
          <div className="h-6 w-px bg-white/8" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{user?.email}</span>
            <Link
              to="/logout"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Logout
            </Link>
          </div>
          <NotificationCenter />
        </div>
      </header>

      <main className="flex-1 overflow-hidden py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/6 px-8 py-4">
        <p className="text-xs text-zinc-600">
          Finsight – Portfolio Management Platform
        </p>
      </footer>
    </div>
  );
}
