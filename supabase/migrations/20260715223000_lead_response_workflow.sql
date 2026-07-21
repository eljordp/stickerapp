-- Give every inquiry an explicit owner and follow-up state so leads cannot sit
-- in the admin as an unowned list.
alter table contact_submissions
  add column if not exists lead_status text not null default 'new',
  add column if not exists assigned_to text not null default 'JP',
  add column if not exists responded_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_submissions_lead_status_check'
  ) then
    alter table contact_submissions
      add constraint contact_submissions_lead_status_check
      check (lead_status in ('new', 'contacted', 'won', 'closed', 'spam'));
  end if;
end $$;

grant update on contact_submissions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_submissions'
      and policyname = 'Admins can update contact submissions'
  ) then
    create policy "Admins can update contact submissions"
      on contact_submissions for update
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

create index if not exists contact_submissions_lead_queue_idx
  on contact_submissions (lead_status, created_at desc);
