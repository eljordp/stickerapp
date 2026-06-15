-- SEO rank tracking — fed by the weekly tss-seo-rank-monitor automation,
-- displayed in the admin "SEO Rankings" tab. Later also backfilled by GSC.
create table if not exists seo_rankings (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  city text,                          -- null = generic / national
  device text default 'desktop',      -- 'desktop' | 'mobile'
  rank int,                           -- null = not in top 20
  ranking_url text,
  local_pack boolean default false,   -- Google Business / local pack presence
  serp_feature text,                  -- 'organic' | 'local_pack' | 'none' | ...
  source text default 'monitor',      -- 'monitor' | 'gsc' | 'baseline' | 'manual'
  notes text,
  checked_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists seo_rankings_query_checked_idx
  on seo_rankings (query, checked_at desc);

alter table seo_rankings enable row level security;

-- The local weekly monitor inserts snapshots anonymously; only admins can read.
create policy "Anyone can log seo rankings" on seo_rankings
  for insert with check (true);
create policy "Admins can read seo rankings" on seo_rankings
  for select using (has_role(auth.uid(), 'admin'));
