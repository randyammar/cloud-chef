create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  ai_opt_in boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text not null,
  cuisine text,
  prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes >= 0),
  difficulty text check (difficulty in ('easy', 'medium', 'hard') or difficulty is null),
  diet_tags text[] not null default '{}',
  status text not null check (status in ('favorite', 'to_try', 'made_before')),
  servings integer check (servings is null or servings > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(instructions, '')), 'B')
  ) stored
);

create table if not exists public.recipe_shares (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  token text not null unique,
  access text not null default 'viewer' check (access = 'viewer'),
  is_revoked boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  feature text not null,
  success boolean not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_recipes_owner on public.recipes(owner_id);
create index if not exists idx_recipes_status on public.recipes(status);
create index if not exists idx_recipes_cuisine on public.recipes(cuisine);
create index if not exists idx_recipes_prep on public.recipes(prep_time_minutes);
create index if not exists idx_recipes_search on public.recipes using gin(search_document);
create index if not exists idx_recipe_shares_recipe on public.recipe_shares(recipe_id);
create index if not exists idx_recipe_shares_token on public.recipe_shares(token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.recipes;
create trigger trg_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_shares enable row level security;
alter table public.ai_usage_logs enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id);

create policy "Profiles can be inserted by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Owner can read recipes"
on public.recipes for select
using (auth.uid() = owner_id);

create policy "Owner can insert recipes"
on public.recipes for insert
with check (auth.uid() = owner_id);

create policy "Owner can update recipes"
on public.recipes for update
using (auth.uid() = owner_id);

create policy "Owner can delete recipes"
on public.recipes for delete
using (auth.uid() = owner_id);

create policy "Owner can read shares"
on public.recipe_shares for select
using (
  exists (
    select 1
    from public.recipes r
    where r.id = recipe_id and r.owner_id = auth.uid()
  )
);

create policy "Owner can insert shares"
on public.recipe_shares for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.recipes r
    where r.id = recipe_id and r.owner_id = auth.uid()
  )
);

create policy "Owner can update shares"
on public.recipe_shares for update
using (created_by = auth.uid());

create policy "Owner can delete shares"
on public.recipe_shares for delete
using (created_by = auth.uid());

create policy "Owner can read ai logs"
on public.ai_usage_logs for select
using (auth.uid() = user_id);

create policy "Owner can insert ai logs"
on public.ai_usage_logs for insert
with check (auth.uid() = user_id);

create or replace function public.get_shared_recipe(share_token text)
returns table (
  id uuid,
  name text,
  ingredients jsonb,
  instructions text,
  cuisine text,
  prep_time_minutes integer,
  difficulty text,
  diet_tags text[],
  status text,
  servings integer,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    r.id,
    r.name,
    r.ingredients,
    r.instructions,
    r.cuisine,
    r.prep_time_minutes,
    r.difficulty,
    r.diet_tags,
    r.status,
    r.servings,
    r.updated_at
  from public.recipe_shares s
  join public.recipes r on r.id = s.recipe_id
  where s.token = share_token
    and s.is_revoked = false
  limit 1;
$$;

grant execute on function public.get_shared_recipe(text) to anon, authenticated;
