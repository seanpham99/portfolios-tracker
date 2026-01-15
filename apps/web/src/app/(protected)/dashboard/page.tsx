import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.email}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Portfolio Summary Cards - placeholder */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          <p className="text-2xl font-light mt-2">$--,---</p>
          <p className="text-sm text-emerald-400 mt-1">Loading...</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground">Today&apos;s Change</h3>
          <p className="text-2xl font-light mt-2">$---</p>
          <p className="text-sm text-muted-foreground mt-1">--.--%</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground">Total Gain/Loss</h3>
          <p className="text-2xl font-light mt-2">$---</p>
          <p className="text-sm text-muted-foreground mt-1">--.--%</p>
        </div>
      </div>

      <div className="mt-8 glass-card p-6 rounded-xl">
        <h2 className="text-lg font-medium mb-4">Your Portfolios</h2>
        <p className="text-muted-foreground">
          Portfolio data will be loaded here. Connect your accounts in Settings to get started.
        </p>
      </div>
    </div>
  );
}
