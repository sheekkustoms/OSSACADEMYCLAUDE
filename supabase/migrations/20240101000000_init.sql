-- ============================================================
-- Oh Sew Sheek Academy — Full Database Setup
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (mirrors auth.users) ────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  display_name text,
  avatar_url text,
  role text default 'user',
  is_banned boolean default false,
  is_coach boolean default false,
  can_message boolean default true,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── LIVE CLASSES (classes, replays, tutorials) ───────────────
create table if not exists live_class (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  class_type text default 'live', -- 'live', 'replay', 'prerecorded', 'tutorial'
  status text default 'published', -- 'published', 'draft'
  scheduled_at timestamptz,
  zoom_url text,
  recording_url text,
  thumbnail_url text,
  pdf_url text,
  supply_list text[],
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ── COURSES ──────────────────────────────────────────────────
create table if not exists course (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  thumbnail_url text,
  pdf_url text,
  is_published boolean default false,
  required_level integer default 1,
  difficulty text default 'beginner',
  xp_reward integer default 100,
  lesson_count integer default 0,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ── LESSONS ──────────────────────────────────────────────────
create table if not exists lesson (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references course(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  pdf_url text,
  order_index integer default 0,
  duration_minutes integer default 0,
  xp_reward integer default 20,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ── ENROLLMENTS ───────────────────────────────────────────────
create table if not exists enrollment (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  course_id uuid references course(id) on delete cascade,
  completed_lessons uuid[] default '{}',
  progress_percent integer default 0,
  is_completed boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  unique(user_email, course_id)
);

-- ── USER POINTS (XP, badges, streaks) ────────────────────────
create table if not exists user_points (
  id uuid primary key default uuid_generate_v4(),
  user_email text unique not null,
  user_name text,
  total_xp integer default 0,
  level integer default 1,
  courses_completed integer default 0,
  lessons_completed integer default 0,
  quizzes_completed integer default 0,
  badges text[] default '{}',
  streak_days integer default 0,
  personal_best_streak integer default 0,
  last_activity_date timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
create table if not exists notification (
  id uuid primary key default uuid_generate_v4(),
  recipient_email text not null,
  type text default 'announcement', -- 'announcement', 'badge', 'like', 'comment'
  message text not null,
  from_name text,
  is_read boolean default false,
  created_date timestamptz default now()
);

-- ── MEMBERSHIP STATUS ─────────────────────────────────────────
create table if not exists membership_status (
  id uuid primary key default uuid_generate_v4(),
  user_email text unique not null,
  user_name text,
  is_active boolean default false,
  paid_through date,
  admin_override boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ── MEMBERSHIP SETTINGS (global lockout toggle) ───────────────
create table if not exists membership_settings (
  id uuid primary key default uuid_generate_v4(),
  label text default 'default',
  lockout_enabled boolean default false,
  inactive_message text default 'Your membership is currently inactive. Please contact administration.',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- Insert default settings
insert into membership_settings (label, lockout_enabled)
values ('default', false)
on conflict do nothing;

-- ── LEVEL SETTINGS ────────────────────────────────────────────
create table if not exists level_settings (
  id uuid primary key default uuid_generate_v4(),
  label text default 'default',
  thresholds integer[] default '{0,100,300,600,1000,1500,2200,3000,4000,5500,7500,10000}',
  created_date timestamptz default now()
);

insert into level_settings (label)
values ('default')
on conflict do nothing;

-- ── DAILY CHALLENGES / QUIZ ───────────────────────────────────
create table if not exists daily_challenge (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  challenge_date date default current_date,
  score integer default 0,
  xp_earned integer default 0,
  completed boolean default false,
  created_date timestamptz default now()
);

create table if not exists quiz (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  is_active boolean default true,
  created_date timestamptz default now()
);

create table if not exists quiz_question (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quiz(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_index integer not null,
  order_index integer default 0,
  created_date timestamptz default now()
);

-- ── WEEKLY CHALLENGE ──────────────────────────────────────────
create table if not exists weekly_challenge_settings (
  id uuid primary key default uuid_generate_v4(),
  label text default 'default',
  is_active boolean default true,
  xp_reward integer default 250,
  created_date timestamptz default now()
);

create table if not exists weekly_challenge_question (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  options text[] not null,
  correct_index integer not null,
  "order" integer default 0,
  created_date timestamptz default now()
);

-- ── CATEGORY SETTINGS ─────────────────────────────────────────
create table if not exists category_settings (
  id uuid primary key default uuid_generate_v4(),
  categories jsonb default '[]',
  created_date timestamptz default now()
);

-- ── INVITED EMAILS ────────────────────────────────────────────
create table if not exists invited_email (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  invited_at timestamptz default now(),
  created_date timestamptz default now()
);

-- ── STORAGE BUCKET ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict do nothing;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table profiles enable row level security;
alter table live_class enable row level security;
alter table course enable row level security;
alter table lesson enable row level security;
alter table enrollment enable row level security;
alter table user_points enable row level security;
alter table notification enable row level security;
alter table membership_status enable row level security;
alter table membership_settings enable row level security;
alter table level_settings enable row level security;
alter table daily_challenge enable row level security;
alter table quiz enable row level security;
alter table quiz_question enable row level security;
alter table weekly_challenge_settings enable row level security;
alter table weekly_challenge_question enable row level security;
alter table category_settings enable row level security;
alter table invited_email enable row level security;

-- Profiles: users can read all, update own
create policy "profiles_read" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Live classes: anyone authenticated can read published
create policy "live_class_read" on live_class for select using (auth.role() = 'authenticated');
create policy "live_class_admin" on live_class for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Courses: authenticated can read published
create policy "course_read" on course for select using (auth.role() = 'authenticated' and is_published = true);
create policy "course_admin" on course for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Lessons: authenticated can read
create policy "lesson_read" on lesson for select using (auth.role() = 'authenticated');
create policy "lesson_admin" on lesson for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Enrollments: users can manage their own
create policy "enrollment_own" on enrollment for all using (auth.role() = 'authenticated');

-- User points: authenticated can read all, manage own
create policy "user_points_read" on user_points for select using (auth.role() = 'authenticated');
create policy "user_points_manage" on user_points for all using (auth.role() = 'authenticated');

-- Notifications: users see their own
create policy "notification_own" on notification for all using (auth.role() = 'authenticated');

-- Membership: users see their own, admins see all
create policy "membership_status_read" on membership_status for select using (auth.role() = 'authenticated');
create policy "membership_status_admin" on membership_status for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Membership settings: anyone authenticated can read
create policy "membership_settings_read" on membership_settings for select using (auth.role() = 'authenticated');
create policy "membership_settings_admin" on membership_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Level settings: anyone can read
create policy "level_settings_read" on level_settings for select using (true);
create policy "level_settings_admin" on level_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Daily challenges: own only
create policy "daily_challenge_own" on daily_challenge for all using (auth.role() = 'authenticated');

-- Quiz: authenticated can read
create policy "quiz_read" on quiz for select using (auth.role() = 'authenticated');
create policy "quiz_admin" on quiz for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "quiz_question_read" on quiz_question for select using (auth.role() = 'authenticated');
create policy "quiz_question_admin" on quiz_question for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Weekly challenge: authenticated can read
create policy "weekly_challenge_read" on weekly_challenge_settings for select using (auth.role() = 'authenticated');
create policy "weekly_challenge_admin" on weekly_challenge_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "weekly_question_read" on weekly_challenge_question for select using (auth.role() = 'authenticated');
create policy "weekly_question_admin" on weekly_challenge_question for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Category settings: authenticated can read
create policy "category_read" on category_settings for select using (auth.role() = 'authenticated');
create policy "category_admin" on category_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Invited emails: admin only
create policy "invited_email_admin" on invited_email for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Storage: authenticated can upload, anyone can read public files
create policy "storage_read" on storage.objects for select using (bucket_id = 'uploads');
create policy "storage_upload" on storage.objects for insert using (auth.role() = 'authenticated' and bucket_id = 'uploads');
create policy "storage_admin" on storage.objects for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
