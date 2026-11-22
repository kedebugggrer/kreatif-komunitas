begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_url text not null default '' check (avatar_url = '' or avatar_url like 'https://%'),
  website text not null default '' check (website = '' or website like 'https://%'),
  joined timestamptz not null default now()
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  username text not null references public.profiles(username) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  category text not null default 'Lainnya' check (category in ('Ilustrasi', 'Fotografi', 'Desain', 'Seni', 'Lainnya')),
  tags text[] not null default '{}' check (cardinality(tags) <= 5 and char_length(array_to_string(tags, ',')) <= 150),
  images text[] not null check (cardinality(images) between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  parent_id uuid,
  username text not null references public.profiles(username) on delete cascade,
  text text not null check (char_length(btrim(text)) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique (id, work_id),
  foreign key (parent_id, work_id) references public.comments(id, work_id) on delete cascade,
  check (parent_id is null or parent_id <> id)
);

create table public.likes (
  work_id uuid not null references public.works(id) on delete cascade,
  username text not null references public.profiles(username) on delete cascade,
  primary key (work_id, username)
);

create index works_created_at_idx on public.works(created_at desc);
create index works_username_idx on public.works(username);
create index comments_work_id_idx on public.comments(work_id);
create index comments_parent_id_idx on public.comments(parent_id);
create index likes_username_idx on public.likes(username);

create function public.create_creator_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger create_creator_profile after insert on auth.users
for each row execute function public.create_creator_profile();

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

revoke all on public.profiles, public.works, public.comments, public.likes from anon, authenticated;
grant select on public.profiles, public.works, public.comments, public.likes to anon, authenticated;
grant update (display_name, bio, avatar_url, website) on public.profiles to authenticated;
grant insert, delete on public.works to authenticated;
grant update (title, description, category, tags, images) on public.works to authenticated;
grant insert on public.comments to authenticated;
grant update (text) on public.comments to authenticated;
grant insert, delete on public.likes to authenticated;

create policy profiles_read on public.profiles for select using (true);
create policy profiles_edit on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy works_read on public.works for select using (true);
create policy works_insert on public.works for insert to authenticated
with check (username = (select username from public.profiles where id = (select auth.uid())));
create policy works_edit on public.works for update to authenticated
using (username = (select username from public.profiles where id = (select auth.uid())))
with check (username = (select username from public.profiles where id = (select auth.uid())));
create policy works_delete on public.works for delete to authenticated
using (username = (select username from public.profiles where id = (select auth.uid())));
create policy comments_read on public.comments for select using (true);
create policy comments_insert on public.comments for insert to authenticated
with check (username = (select username from public.profiles where id = (select auth.uid())));
create policy comments_edit on public.comments for update to authenticated
using (username = (select username from public.profiles where id = (select auth.uid())))
with check (username = (select username from public.profiles where id = (select auth.uid())));
create policy likes_read on public.likes for select using (true);
create policy likes_insert on public.likes for insert to authenticated
with check (username = (select username from public.profiles where id = (select auth.uid())));
create policy likes_delete on public.likes for delete to authenticated
using (username = (select username from public.profiles where id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 3000000, array['image/jpeg', 'image/png', 'image/webp']);
create policy portfolio_upload on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy portfolio_remove on storage.objects for delete to authenticated
using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy portfolio_owner_read on storage.objects for select to authenticated
using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
