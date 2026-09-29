-- =====================================================================
-- FPAA Connect 2.0 — Supabase schema
-- Falakata Polytechnic Alumni Association (ESTD 2024)
-- Run this once in Supabase → SQL Editor. All IDs are UUIDs.
-- Row Level Security is ENABLED on every table.
-- =====================================================================
create extension if not exists "pgcrypto";

-- ---------- Helpers ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;
create or replace function public.has_role(roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = any(roles);
$$;
create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.has_role(array['superadmin','registration','finance','content','committee']); $$;
create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m where m.user_id = auth.uid() and m.status = 'Active') or public.is_admin();
$$;

-- ---------- Core tables ----------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  membership_no text unique not null,
  full_name text not null, email text, mobile text, gender text,
  department text check (department in ('Electronics','Civil','Mechanical','Electrical','Food Processing Technology')),
  admission_year int, passing_year int,
  profession text check (profession in ('Govt. Sector Job','Private Sector Job','Self Employed','Higher Studies')),
  company text, city text, state text, pin text, address text,
  category text check (category in ('Alumni Membership','Social Media Handling','Management Committee Membership')),
  status text default 'Active' check (status in ('Active','Inactive','Pending Payment')),
  member_since int, valid_till text, photo text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null, full_name text, mobile text unique,
  role text default 'member' check (role in ('member','committee','superadmin','registration','finance','content')),
  member_id uuid references public.members(id) on delete set null,
  auth_method text default 'Email', status text default 'Active', last_login timestamptz, last_auth_method text,
  created_at timestamptz default now()
);
create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(), application_no text unique not null,
  full_name text, email text, mobile text, gender text, department text, admission_year int, passing_year int,
  profession text, company text, city text, category text, amount numeric,
  payment_mode text, payment_ref text, payment_status text default 'Pending', status text default 'Pending',
  submitted_at timestamptz default now(), reviewed_at timestamptz, notes text,
  user_id uuid references auth.users(id), member_id uuid references public.members(id), created_at timestamptz default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), application_id uuid references public.membership_applications(id) on delete cascade,
  application_no text, member_name text, category text, amount numeric, mode text, reference text, department text,
  paid_at timestamptz default now(), status text default 'Pending', verified_by text, note text, created_at timestamptz default now()
);
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(), donation_no text unique, purpose text, amount numeric,
  donor_name text, email text, mobile text, message text, payment_mode text, payment_ref text, department text,
  status text default 'Pending', review_note text, verified_by text, donated_at timestamptz default now(),
  user_id uuid references auth.users(id), created_at timestamptz default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(), title text, description text, date date, time text, venue text,
  image text, registration_link text, registrations uuid[] default '{}', registration_count int default 0,
  status text default 'Published', created_at timestamptz default now()
);
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(), title text, company text, location text, salary text, department text,
  job_type text, experience text, description text, apply_link text, status text default 'Pending',
  posted_at timestamptz default now(), posted_by uuid references auth.users(id), poster_name text, review_note text, created_at timestamptz default now()
);
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(), member_name text, title text, description text, organization text,
  date date, photo text, status text default 'Pending', submitted_by uuid references auth.users(id), created_at timestamptz default now()
);
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(), caption text, batch text, year int, member_name text, photo text,
  status text default 'Pending', user_id uuid references auth.users(id), created_at timestamptz default now()
);
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(), notice_no text unique, title text, category text, priority text default 'Normal',
  date date, description text, attachment_name text, attachment_data text, status text default 'Published', created_at timestamptz default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id text, -- uuid, 'admins', or null for everyone
  type text, title text, message text, link text, read_by uuid[] default '{}', created_at timestamptz default now()
);
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(), ticket_no text unique, user_id uuid references auth.users(id),
  requester_name text, requester_email text, subject text, category text, status text default 'Open', assigned_to text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(), ticket_id uuid references public.support_requests(id) on delete cascade,
  author_name text, author_role text, message text, created_at timestamptz default now()
);
create table if not exists public.volunteer_opportunities ( -- stores the Alumni Sponsored Scheme definitions
  id text primary key, code text, name text, audience text, icon text, tone text, summary text,
  eligibility text[], criteria text[], benefits text[], documents text[], deadline text, seats int, created_at timestamptz default now()
);
create table if not exists public.scheme_applications (
  id uuid primary key default gen_random_uuid(), application_no text unique, scheme_id text references public.volunteer_opportunities(id),
  applicant_name text, gender text, department text, semester text, percentage numeric, family_income numeric, track text,
  mobile text, email text, statement text, status text default 'Submitted', remarks text,
  submitted_at timestamptz default now(), user_id uuid references auth.users(id), created_at timestamptz default now()
);
create table if not exists public.committee_roles (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, role text, assigned_at timestamptz default now(), created_at timestamptz default now()
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor text, action text, entity text, entity_ref text, created_at timestamptz default now()
);
create table if not exists public.member_chat_messages (
  id uuid primary key default gen_random_uuid(), conversation_id text not null, sender_id uuid, sender_name text, body text not null check (length(body) <= 1000), created_at timestamptz default now()
);
create table if not exists public.chat_read_receipts (
  id uuid primary key default gen_random_uuid(), message_id uuid references public.member_chat_messages(id) on delete cascade, user_id uuid, read_at timestamptz default now(), created_at timestamptz default now()
);
create table if not exists public.homepage_gallery_feed (
  id uuid primary key default gen_random_uuid(), image text, caption text, sort_order int default 0, created_at timestamptz default now()
);
create table if not exists public.dashboard_live_feed (
  id uuid primary key default gen_random_uuid(), type text, title text, body text, status text default 'Published', created_at timestamptz default now()
);

-- ---------- Public-safe views / functions ----------
-- Directory view: masked mobile, no email/address. Readable by active members.
create or replace view public.member_directory with (security_invoker = false) as
  select id, membership_no, full_name, department, admission_year, passing_year, profession, company, city, state,
         category, status, member_since, valid_till, photo, created_at,
         left(mobile, 6) || repeat('*', greatest(length(mobile) - 6, 0)) as mobile, null::text as email, user_id
  from public.members where public.is_active_member();

-- Public membership verification: returns only public fields
create or replace function public.verify_membership(p_membership_no text)
returns table (id uuid, membership_no text, full_name text, category text, status text, member_since int, valid_till text)
language sql stable security definer set search_path = public as $$
  select id, membership_no, full_name, category, status, member_since, valid_till from public.members where membership_no = upper(p_membership_no);
$$;
grant execute on function public.verify_membership(text) to anon, authenticated;

-- ---------- Row Level Security ----------
do $$ declare t text; begin
  foreach t in array array['members','profiles','membership_applications','payments','donations','events','job_postings','achievements','memories','notices','notifications','support_requests','support_replies','scheme_applications','volunteer_opportunities','committee_roles','audit_logs','member_chat_messages','chat_read_receipts','homepage_gallery_feed','dashboard_live_feed']
  loop execute format('alter table public.%I enable row level security', t); end loop; end $$;

-- Members: own row; registration/superadmin full access
create policy members_self on public.members for select using (user_id = auth.uid() or public.has_role(array['superadmin','registration']));
create policy members_self_update on public.members for update using (user_id = auth.uid() or public.has_role(array['superadmin','registration']));
create policy members_admin_insert on public.members for insert with check (public.has_role(array['superadmin','registration']));
-- Linking: a user may claim an unlinked record (app verifies membership no + mobile first)
create policy members_link on public.members for update using (user_id is null and auth.uid() is not null) with check (user_id = auth.uid());

create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.has_role(array['superadmin']));
create policy profiles_admin_insert on public.profiles for insert with check (public.has_role(array['superadmin']));

-- Applications & payments: anyone can apply; owner reads own; committees review
create policy apps_insert on public.membership_applications for insert with check (true);
create policy apps_read on public.membership_applications for select using (user_id = auth.uid() or public.has_role(array['superadmin','registration','finance']));
create policy apps_update on public.membership_applications for update using (public.has_role(array['superadmin','registration','finance']));
create policy pay_insert on public.payments for insert with check (true);
create policy pay_read on public.payments for select using (public.has_role(array['superadmin','finance','registration','committee']));
create policy pay_update on public.payments for update using (public.has_role(array['superadmin','finance']));

create policy don_insert on public.donations for insert with check (auth.uid() is not null);
create policy don_read on public.donations for select using (user_id = auth.uid() or status = 'Verified' or public.has_role(array['superadmin','finance','committee']));
create policy don_update on public.donations for update using (public.has_role(array['superadmin','finance']));

-- Member-only content (read), admin-managed (write)
create policy events_read on public.events for select using (public.is_active_member() or status = 'Published');
create policy events_write on public.events for all using (public.has_role(array['superadmin','content'])) with check (public.has_role(array['superadmin','content']));
create policy events_register on public.events for update using (public.is_active_member());
create policy jobs_read on public.job_postings for select using ((status = 'Published' and public.is_active_member()) or posted_by = auth.uid() or public.has_role(array['superadmin','content','committee']));
create policy jobs_insert on public.job_postings for insert with check (public.is_active_member());
create policy jobs_admin on public.job_postings for update using (public.has_role(array['superadmin','content','committee']));
create policy jobs_delete on public.job_postings for delete using (public.has_role(array['superadmin','content']));
create policy ach_read on public.achievements for select using ((status = 'Published' and public.is_active_member()) or submitted_by = auth.uid() or public.has_role(array['superadmin','content']));
create policy ach_insert on public.achievements for insert with check (public.is_active_member());
create policy ach_admin on public.achievements for all using (public.has_role(array['superadmin','content']));
create policy mem_read on public.memories for select using ((status = 'Published' and public.is_active_member()) or user_id = auth.uid() or public.has_role(array['superadmin','content']));
create policy mem_insert on public.memories for insert with check (public.is_active_member());
create policy mem_admin on public.memories for all using (public.has_role(array['superadmin','content']));
create policy ntc_read on public.notices for select using ((status = 'Published' and public.is_active_member()) or public.has_role(array['superadmin','content']));
create policy ntc_admin on public.notices for all using (public.has_role(array['superadmin','content']));

create policy notif_read on public.notifications for select using (user_id is null or user_id = auth.uid()::text or (user_id = 'admins' and public.is_admin()));
create policy notif_mark on public.notifications for update using (user_id is null or user_id = auth.uid()::text or (user_id = 'admins' and public.is_admin()));
create policy notif_insert on public.notifications for insert with check (auth.uid() is not null);
create policy notif_delete on public.notifications for delete using (public.has_role(array['superadmin','content']));

create policy sup_own on public.support_requests for select using (user_id = auth.uid() or public.has_role(array['superadmin','registration','finance']));
create policy sup_insert on public.support_requests for insert with check (user_id = auth.uid());
create policy sup_update on public.support_requests for update using (user_id = auth.uid() or public.has_role(array['superadmin','registration','finance']));
create policy rep_read on public.support_replies for select using (exists (select 1 from public.support_requests s where s.id = ticket_id and (s.user_id = auth.uid() or public.has_role(array['superadmin','registration','finance']))));
create policy rep_insert on public.support_replies for insert with check (exists (select 1 from public.support_requests s where s.id = ticket_id and (s.user_id = auth.uid() or public.has_role(array['superadmin','registration','finance']))));

create policy sch_def_read on public.volunteer_opportunities for select using (true);
create policy sch_insert on public.scheme_applications for insert with check (true);
create policy sch_read on public.scheme_applications for select using (user_id = auth.uid() or public.has_role(array['superadmin','registration','committee']));
create policy sch_update on public.scheme_applications for update using (public.has_role(array['superadmin','registration','committee']));

create policy roles_read on public.committee_roles for select using (public.is_admin());
create policy roles_write on public.committee_roles for all using (public.has_role(array['superadmin']));
create policy audit_insert on public.audit_logs for insert with check (auth.uid() is not null);
create policy audit_read on public.audit_logs for select using (public.is_admin());

create policy chat_read on public.member_chat_messages for select using (public.is_active_member() and (conversation_id = 'community' or position(auth.uid()::text in conversation_id) > 0 or exists (select 1 from public.members m where m.user_id = auth.uid() and position(m.id::text in conversation_id) > 0)));
create policy chat_insert on public.member_chat_messages for insert with check (public.is_active_member());
create policy rr_all on public.chat_read_receipts for all using (public.is_active_member()) with check (public.is_active_member());

create policy gal_read on public.homepage_gallery_feed for select using (true);
create policy gal_write on public.homepage_gallery_feed for all using (public.has_role(array['superadmin','content']));
create policy feed_read on public.dashboard_live_feed for select using (true);
create policy feed_write on public.dashboard_live_feed for all using (public.has_role(array['superadmin','content'])) with check (auth.uid() is not null);

-- Realtime for chat
alter publication supabase_realtime add table public.member_chat_messages;

-- ---------- Seed: Alumni Sponsored Scheme definitions ----------
-- Content follows the official FPAA rule books (assets/docs/). Re-running updates existing rows.
insert into public.volunteer_opportunities (id, code, name, audience, icon, tone, summary, eligibility, criteria, benefits, documents, deadline, seats) values
('scheme-savitribai', 'SFES', 'Savitribai Fule Excellence Scholarship', 'Female students', 'female', 'f-rose', 'Merit-cum-means scholarship of ₹12,000 a year for meritorious, financially disadvantaged female diploma students of Falakata Polytechnic, from the 2nd year to the end of the 3rd year.', array['Female student of Falakata Polytechnic','Officially admitted to the 2nd year of a full-time regular Diploma in Engineering course at Falakata Polytechnic (Govt. of West Bengal)','Minimum aggregate of 75% (or equivalent grade) in the 1st and 2nd semester board examinations','Gross annual family income from all sources not more than ₹1,75,000','Must not be receiving any other major recurring Central or State Government scholarship at the same time'], array['Primary screening of every application for completeness and authenticity by the Scholarship Cell','Eligible applicants ranked by the Selection Committee on a combined matrix of academic performance and family income','Provisional list of selected candidates published on the official portal, followed by a 10-day grievance redressal period','Final list of awardees published after document verification','3rd-year renewal is not automatic: minimum 70% aggregate in the 4th semester, at least 75% attendance across the 2nd year, and updated fee receipts and mark sheets','Scholarship is cancelled for false or forged documents, attendance below 75% or marks below 70%, discontinuing studies, suspension or expulsion, or accepting another overlapping major scholarship','The scheme is administered by the Scholarship Board, which interprets the rules, resolves disputes and audits fund use'], array['₹12,000 per year, paid in two half-yearly instalments','Paid by Direct Benefit Transfer (DBT) into the student''s verified, Aadhaar-linked bank account','Continues until the end of the 3rd year of the diploma (maximum two consecutive years), subject to the renewal criteria'], array['1st & 2nd semester mark sheets and Class 10 or 12 passing certificate','College admission letter and fee receipt for the current academic session','Income certificate from a competent government authority (Tehsildar, Circle Officer or equivalent)','Proof of identity and domicile (Aadhaar card, Voter ID or Passport)','Bank passbook copy or cancelled cheque in the student''s name, linked with Aadhaar for DBT'], 'Academic year 2026-27', null),
('scheme-visvesvaraya', 'SMVES', 'Sir M. Visvesvaraya Excellence Scholarship', 'Male students', 'male', 'f-blue', 'Merit-cum-means scholarship of ₹12,000 a year for meritorious, financially disadvantaged male diploma students of Falakata Polytechnic, from the 2nd year to the end of the 3rd year.', array['Male student of Falakata Polytechnic','Officially admitted to the 2nd year of a full-time regular Diploma in Engineering course at Falakata Polytechnic (Govt. of West Bengal)','Minimum aggregate of 75% (or equivalent grade) in the 1st and 2nd semester board examinations','Gross annual family income from all sources not more than ₹1,75,000','Must not be receiving any other major recurring Central or State Government scholarship at the same time'], array['Primary screening of every application for completeness and authenticity by the Scholarship Cell','Eligible applicants ranked by the Selection Committee on a combined matrix of academic performance and family income','Provisional list of selected candidates published on the official portal, followed by a 10-day grievance redressal period','Final list of awardees published after document verification','3rd-year renewal is not automatic: minimum 70% aggregate in the 4th semester, at least 75% attendance across the 2nd year, and updated fee receipts and mark sheets','Scholarship is cancelled for false or forged documents, attendance below 75% or marks below 70%, discontinuing studies, suspension or expulsion, or accepting another overlapping major scholarship','The scheme is administered by the Scholarship Board, which interprets the rules, resolves disputes and audits fund use'], array['₹12,000 per year, paid in two half-yearly instalments','Paid by Direct Benefit Transfer (DBT) into the student''s verified, Aadhaar-linked bank account','Continues until the end of the 3rd year of the diploma (maximum two consecutive years), subject to the renewal criteria'], array['1st & 2nd semester mark sheets and Class 10 or 12 passing certificate','College admission letter and fee receipt for the current academic session','Income certificate from a competent government authority (Tehsildar, Circle Officer or equivalent)','Proof of identity and domicile (Aadhaar card, Voter ID or Passport)','Bank passbook copy or cancelled cheque in the student''s name, linked with Aadhaar for DBT'], 'Academic year 2026-27', null),
('scheme-kalam', 'APJYSDP', 'Dr. A.P.J. Abdul Kalam Youth Skill Development Programme', 'Falakata Polytechnic students', 'wrench', 'f-gold', '“Evolutionary Growth” — a professional readiness training programme that bridges academic learning and industry expectations, building technical skills, workplace behaviour and professional ethics.', array['Students of Falakata Polytechnic enrolled in the Professional Readiness Training Programme','Minimum 75% attendance across all modules (technical, soft skills and project management)','Planned absence: written application to the Programme Coordinator at least 24 hours in advance; medical absence: valid certificate within 48 hours of return','Follow the code of conduct: join sessions 5 minutes early, keep camera on and microphone muted in online sessions, and maintain strict academic integrity'], array['Continuous evaluation through practical assignments, project milestones, quizzes and peer evaluations','Late submissions lose 10% of marks per day for up to three days, after which they are not graded','Group projects need a documented division of work; peer review scores count towards individual grades','Certificate requires at least 85% cumulative attendance, a minimum 60% aggregate across assignments, capstone projects and milestones, a clean conduct record, and completion of all mock interviews and portfolio submissions','Grievances: module mentor → written grievance to the Programme Coordinator if unresolved within 48 hours → Academic and Professional Oversight Committee','Discipline: verbal warning for a first minor offence, written reprimand to the department head for a repeat, and suspension or expulsion without certificate for plagiarism, gross misconduct or harassment'], array['Training in technical skills, soft skills and project management','Practical assignments, case discussions, simulated exercises and a capstone project','Pre-placement mock interviews and portfolio building','Official Professional Readiness Certificate on successful completion'], array[]::text[], 'As notified by FPAA', null)
on conflict (id) do update set code = excluded.code, name = excluded.name, audience = excluded.audience, icon = excluded.icon, tone = excluded.tone, summary = excluded.summary,
  eligibility = excluded.eligibility, criteria = excluded.criteria, benefits = excluded.benefits, documents = excluded.documents, deadline = excluded.deadline, seats = excluded.seats;

-- ---------- Keep profiles in sync with auth.users ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, mobile, auth_method)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), nullif(new.raw_user_meta_data->>'mobile',''), 'Email + Password')
  on conflict (id) do nothing;
  -- auto-link an approved, unlinked membership when both email and mobile match
  update public.members set user_id = new.id
   where user_id is null and lower(email) = lower(new.email) and mobile = new.raw_user_meta_data->>'mobile';
  update public.profiles p set member_id = m.id from public.members m where p.id = new.id and m.user_id = new.id;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- After creating your first user in Authentication → Users, promote them:
-- update public.profiles set role = 'superadmin' where email = 'you@example.com';

-- ---------- Sign in with mobile number ----------
-- Returns the login email for a registered mobile (used only to sign in with mobile + password).
create or replace function public.email_for_mobile(p_mobile text) returns text
language sql stable security definer set search_path = public as $$
  select p.email from public.profiles p left join public.members m on m.id = p.member_id
   where coalesce(m.mobile, p.mobile) = right(regexp_replace(p_mobile, '\D', '', 'g'), 10) limit 1;
$$;
grant execute on function public.email_for_mobile(text) to anon, authenticated;

-- ---------- Forgot password with recovery ("master") key ----------
-- Key = first 4 letters of the registered name in CAPITALS + last 4 digits of the registered mobile.
-- e.g. Rahul Barman, 9876543206 -> RAHU3206. Locks an account for 15 minutes after 5 wrong keys.
create table if not exists public.password_reset_attempts (identifier text primary key, failures int default 0, last_at timestamptz default now());
alter table public.password_reset_attempts enable row level security;  -- no policies: only the function below touches it

create or replace function public.reset_password_with_master_key(p_identifier text, p_key text, p_new_password text)
returns boolean language plpgsql security definer set search_path = public, auth, extensions as $$
declare v_uid uuid; v_name text; v_mobile text; v_expected text; v_id text := lower(trim(p_identifier)); v_fail int; v_last timestamptz;
begin
  if length(p_new_password) < 8 or p_new_password !~ '[A-Za-z]' or p_new_password !~ '[0-9]' then
    raise exception 'Use at least 8 characters with letters and numbers.';
  end if;
  select failures, last_at into v_fail, v_last from public.password_reset_attempts where identifier = v_id;
  if coalesce(v_fail,0) >= 5 and v_last > now() - interval '15 minutes' then
    raise exception 'Too many incorrect attempts. Please wait 15 minutes and try again.';
  end if;
  select p.id, p.full_name, coalesce(m.mobile, p.mobile) into v_uid, v_name, v_mobile
    from public.profiles p left join public.members m on m.id = p.member_id
   where lower(p.email) = v_id or coalesce(m.mobile, p.mobile) = right(regexp_replace(v_id, '\D', '', 'g'), 10)
   limit 1;
  v_expected := upper(left(regexp_replace(coalesce(v_name,''), '[^A-Za-z]', '', 'g'), 4)) || right(regexp_replace(coalesce(v_mobile,''), '\D', '', 'g'), 4);
  if v_uid is null or length(v_expected) < 5 or upper(trim(p_key)) <> v_expected then
    insert into public.password_reset_attempts(identifier, failures, last_at) values (v_id, 1, now())
      on conflict (identifier) do update set failures = case when password_reset_attempts.last_at < now() - interval '15 minutes' then 1 else password_reset_attempts.failures + 1 end, last_at = now();
    return false;
  end if;
  delete from public.password_reset_attempts where identifier = v_id;
  update auth.users set encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now() where id = v_uid;
  insert into public.audit_logs(actor, action, entity, entity_ref) values ('System', 'Reset password with recovery key', 'profile', v_uid::text);
  return true;
end; $$;
grant execute on function public.reset_password_with_master_key(text, text, text) to anon, authenticated;

-- ---------- Committee members shown on the Home page ----------
create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(), name text not null, position text not null, phone text, email text, photo text,
  member_id uuid references public.members(id) on delete set null, sort_order int default 0, status text default 'Active', created_at timestamptz default now()
);
alter table public.committee_members enable row level security;
create policy committee_public_read on public.committee_members for select using (status = 'Active' or public.has_role(array['superadmin','content']));
create policy committee_admin_write on public.committee_members for all using (public.has_role(array['superadmin','content'])) with check (public.has_role(array['superadmin','content']));
