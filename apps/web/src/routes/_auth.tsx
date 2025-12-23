import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <span className="text-2xl font-semibold text-emerald-400">F</span>
            </div>
            <span className="font-serif text-3xl font-light tracking-tight text-white">
              Finsight
            </span>
          </div>
        </div>

        {/* Auth page content */}
        <Outlet />

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} Finsight. All rights reserved.
        </p>
      </div>
    </div>
  );
}
