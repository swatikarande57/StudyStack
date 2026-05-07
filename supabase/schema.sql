-- Study-Stack core schema
-- Run this in Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null unique,
  role text not null check (role in ('student', 'teacher')) default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  deadline timestamptz,
  assigned_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  subject text default 'General',
  status text not null check (status in ('pending', 'submitted', 'completed', 'rejected')) default 'pending',
  proof_link text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goals
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target text not null,
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  completion_percentage numeric not null default 0 check (completion_percentage >= 0 and completion_percentage <= 100),
  unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progress entries
create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  completion_percentage numeric not null default 0 check (completion_percentage >= 0 and completion_percentage <= 100),
  study_hours numeric not null default 0,
  note text default '',
  created_at timestamptz not null default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read_status boolean not null default false,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_assigned_by on public.tasks(assigned_by);
create index if not exists idx_goals_student_id on public.goals(student_id);
create index if not exists idx_progress_student_id on public.progress(student_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.progress enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
for insert with check (auth.uid() = id);

-- Tasks policies
drop policy if exists "tasks_student_read_assigned" on public.tasks;
create policy "tasks_student_read_assigned" on public.tasks
for select using (auth.uid() = assigned_to or auth.uid() = assigned_by);

drop policy if exists "tasks_teacher_insert" on public.tasks;
create policy "tasks_teacher_insert" on public.tasks
for insert with check (auth.uid() = assigned_by);

drop policy if exists "tasks_update_assigned_users" on public.tasks;
create policy "tasks_update_assigned_users" on public.tasks
for update using (auth.uid() = assigned_to or auth.uid() = assigned_by);

drop policy if exists "tasks_teacher_delete" on public.tasks;
create policy "tasks_teacher_delete" on public.tasks
for delete using (auth.uid() = assigned_by);

-- Goals policies
drop policy if exists "goals_student_teacher_read" on public.goals;
create policy "goals_student_teacher_read" on public.goals
for select using (
  auth.uid() = student_id
  or exists (
    select 1 from public.tasks t
    where t.assigned_by = auth.uid() and t.assigned_to = goals.student_id
  )
);

drop policy if exists "goals_teacher_insert" on public.goals;
create policy "goals_teacher_insert" on public.goals
for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);

drop policy if exists "goals_student_update" on public.goals;
create policy "goals_student_update" on public.goals
for update using (auth.uid() = student_id);

-- Progress policies
drop policy if exists "progress_student_teacher_read" on public.progress;
create policy "progress_student_teacher_read" on public.progress
for select using (
  auth.uid() = student_id
  or exists (
    select 1 from public.tasks t
    where t.assigned_by = auth.uid() and t.assigned_to = progress.student_id
  )
);

drop policy if exists "progress_student_insert" on public.progress;
create policy "progress_student_insert" on public.progress
for insert with check (auth.uid() = student_id);

drop policy if exists "progress_student_update" on public.progress;
create policy "progress_student_update" on public.progress
for update using (auth.uid() = student_id);

-- Notifications policies
drop policy if exists "notifications_user_read" on public.notifications;
create policy "notifications_user_read" on public.notifications
for select using (auth.uid() = user_id);

drop policy if exists "notifications_user_update" on public.notifications;
create policy "notifications_user_update" on public.notifications
for update using (auth.uid() = user_id);

drop policy if exists "notifications_teacher_insert" on public.notifications;
create policy "notifications_teacher_insert" on public.notifications
for insert with check (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
