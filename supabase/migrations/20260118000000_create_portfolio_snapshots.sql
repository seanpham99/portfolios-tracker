-- Create portfolio_snapshots table
create table if not exists public.portfolio_snapshots (
    id uuid primary key default gen_random_uuid(),
    portfolio_id uuid not null references public.portfolios(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    net_worth numeric not null,
    total_cost numeric not null,
    metadata jsonb default '{}'::jsonb,
    timestamp timestamptz not null default now(),
    created_at timestamptz not null default now()
);
-- Indices for performance
create index if not exists idx_portfolio_snapshots_portfolio_timestamp on public.portfolio_snapshots(portfolio_id, timestamp desc);
create index if not exists idx_portfolio_snapshots_user_id on public.portfolio_snapshots(user_id);
-- Enable RLS
alter table public.portfolio_snapshots enable row level security;
-- Policies
create policy "Users can view snapshots of their portfolios" on public.portfolio_snapshots for
select using (auth.uid() = user_id);
create policy "Users can insert snapshots for their portfolios" on public.portfolio_snapshots for
insert with check (auth.uid() = user_id);
-- Add comment
comment on table public.portfolio_snapshots is 'Historical daily snapshots of portfolio performance';