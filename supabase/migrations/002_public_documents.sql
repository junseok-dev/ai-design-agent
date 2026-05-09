alter table public.documents
  add column if not exists is_public boolean not null default false;

create index if not exists documents_public_idx
  on public.documents(id)
  where is_public = true;

grant usage on schema public to anon, authenticated;
grant select on public.documents to anon;
grant select, insert, update, delete on public.documents to authenticated;

drop policy if exists "public documents are readable" on public.documents;
create policy "public documents are readable"
  on public.documents for select
  to anon, authenticated
  using (is_public = true);
