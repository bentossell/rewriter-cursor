-- Create users table (handled by Supabase Auth, but we'll add custom fields)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rewrites table
create table if not exists public.rewrites (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    original_text text not null,
    rewritten_text text not null,
    rewrite_mode varchar(50) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.rewrites enable row level security;

-- Create policies for profiles
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- Create policies for rewrites
create policy "Users can view own rewrites"
    on public.rewrites for select
    using (auth.uid() = user_id);

create policy "Users can insert own rewrites"
    on public.rewrites for insert
    with check (auth.uid() = user_id);

create policy "Users can update own rewrites"
    on public.rewrites for update
    using (auth.uid() = user_id);

-- Create functions for handling updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.rewrites
    for each row
    execute procedure public.handle_updated_at(); 