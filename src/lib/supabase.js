import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvcsnnkdermzxiwndkal.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y3NubmtkZXJtenhpd25ka2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjY3NzQsImV4cCI6MjA5MDk0Mjc3NH0.7yLIOSqp6lZMRXvgdVOsQPfBjHcKTKyftbxzKftVN5I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0],
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || null,
    role: user.user_metadata?.role || 'user',
    created_date: user.created_at,
  };
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return getCurrentUser();
}

export async function signUp(email, password, metadata = {}) {
  const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  if (error) throw error;
  return getCurrentUser();
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function updateMe(updates) {
  const { error } = await supabase.auth.updateUser({ data: updates });
  if (error) throw error;
  return getCurrentUser();
}

function entity(table) {
  return {
    list: async (orderBy = '-created_date', limit = 100) => {
      const isDesc = orderBy.startsWith('-');
      const col = isDesc ? orderBy.slice(1) : orderBy;
      const { data, error } = await supabase.from(table).select('*').order(col, { ascending: !isDesc }).limit(limit);
      if (error) throw error;
      return data || [];
    },
    filter: async (conditions = {}) => {
      let q = supabase.from(table).select('*');
      Object.entries(conditions).forEach(([k, v]) => { q = q.eq(k, v); });
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    get: async (id) => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    create: async (payload) => {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id, payload) => {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

export const db = {
  LiveClass:               entity('live_class'),
  Course:                  entity('course'),
  Lesson:                  entity('lesson'),
  Enrollment:              entity('enrollment'),
  UserPoints:              entity('user_points'),
  Notification:            entity('notification'),
  LevelSettings:           entity('level_settings'),
  DailyChallenge:          entity('daily_challenge'),
  Quiz:                    entity('quiz'),
  QuizQuestion:            entity('quiz_question'),
  WeeklyChallengeSettings: entity('weekly_challenge_settings'),
  WeeklyChallengeQuestion: entity('weekly_challenge_question'),
  CategorySettings:        entity('category_settings'),
  InvitedEmail:            entity('invited_email'),
  User:                    entity('profiles'),
  MembershipPlan:          entity('membership_plan'),
  MembershipStatus:        entity('membership_status'),
  MembershipSettings:      entity('membership_settings'),
  CommunityPost:           entity('community_post'),
  Comment:                 entity('comment'),
};

export async function uploadFile(file, bucket = 'uploads') {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
