import { Outlet } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAuth } from "@/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  // Require authentication for all routes wrapped by this layout
  const user = await requireAuth(request);
  
  return { user };
}

// Pathless layout - wraps protected routes without adding URL segments
export default function ProtectedLayout() {
  return <Outlet />;
}
