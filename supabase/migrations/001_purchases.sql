create table purchases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  product_id        text not null,
  stripe_session_id text unique not null,
  purchased_at      timestamptz default now()
);

alter table purchases enable row level security;

create policy "users read own purchases"
  on purchases for select
  using (auth.uid() = user_id);

-- No INSERT policy — only service role (Edge Function) can insert
