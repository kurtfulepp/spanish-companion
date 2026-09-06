-- Reusable level-aware vocabulary topics with private, stable AI expansion.

insert into public.vocabulary_themes (id, title, description, emoji, sort_order, is_published)
values
  ('around-the-city', 'Around the City', 'Directions, neighborhoods, errands, and getting around.', '', 2, true),
  ('travel', 'Travel', 'Airports, hotels, changes of plan, and useful requests.', '', 3, true),
  ('social-life', 'Social Life', 'Plans, invitations, stories, and natural reactions.', '', 4, true),
  ('work-meetings', 'Work & Meetings', 'Ideas, updates, decisions, and polite disagreement.', '', 5, true),
  ('home-daily-life', 'Home & Daily Life', 'Routines, repairs, neighbors, and everyday details.', '', 6, true),
  ('feelings-relationships', 'Feelings & Relationships', 'Nuance, support, boundaries, and connection.', '', 7, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.vocabulary_sections (id, theme_id, slug, title, description, sort_order)
values
  ('a1000000-0000-4000-8000-000000000001', 'around-the-city', 'finding-a-place', 'Finding a place', 'Ask where something is and orient yourself.', 1),
  ('a1000000-0000-4000-8000-000000000002', 'around-the-city', 'understanding-directions', 'Understanding directions', 'Follow landmarks, turns, and distances.', 2),
  ('a1000000-0000-4000-8000-000000000003', 'around-the-city', 'public-transport', 'Public transport', 'Use buses, trains, and local transit.', 3),
  ('a1000000-0000-4000-8000-000000000004', 'around-the-city', 'getting-a-ride', 'Getting a ride', 'Arrange a taxi or rideshare and explain where to stop.', 4),
  ('a1000000-0000-4000-8000-000000000005', 'around-the-city', 'errands-services', 'Errands and services', 'Find opening hours, appointments, and everyday services.', 5),
  ('a1000000-0000-4000-8000-000000000006', 'around-the-city', 'plans-change', 'When plans change', 'Handle closures, delays, and getting lost.', 6),

  ('b2000000-0000-4000-8000-000000000001', 'travel', 'checking-in', 'Checking in', 'Check in for a flight and handle your bags.', 1),
  ('b2000000-0000-4000-8000-000000000002', 'travel', 'airport-security', 'Airport security', 'Understand instructions and ask what is required.', 2),
  ('b2000000-0000-4000-8000-000000000003', 'travel', 'boarding-flights', 'Boarding and flights', 'Find the gate and understand boarding updates.', 3),
  ('b2000000-0000-4000-8000-000000000004', 'travel', 'arriving', 'Arriving', 'Navigate immigration, baggage claim, and onward travel.', 4),
  ('b2000000-0000-4000-8000-000000000005', 'travel', 'hotel-stay', 'Hotel stay', 'Check in, make requests, and understand hotel details.', 5),
  ('b2000000-0000-4000-8000-000000000006', 'travel', 'travel-problems', 'Travel problems', 'Respond to delays, cancellations, and missing belongings.', 6),

  ('c3000000-0000-4000-8000-000000000001', 'social-life', 'making-plans', 'Making plans', 'Suggest a plan and agree on the details.', 1),
  ('c3000000-0000-4000-8000-000000000002', 'social-life', 'invitations', 'Invitations', 'Invite someone and accept or decline naturally.', 2),
  ('c3000000-0000-4000-8000-000000000003', 'social-life', 'meeting-people', 'Meeting people', 'Start a conversation and find common ground.', 3),
  ('c3000000-0000-4000-8000-000000000004', 'social-life', 'telling-stories', 'Telling stories', 'Give context and keep a story moving.', 4),
  ('c3000000-0000-4000-8000-000000000005', 'social-life', 'natural-reactions', 'Natural reactions', 'Respond with interest, surprise, or empathy.', 5),
  ('c3000000-0000-4000-8000-000000000006', 'social-life', 'following-up', 'Leaving and following up', 'End well and make the next connection easy.', 6),

  ('d4000000-0000-4000-8000-000000000001', 'work-meetings', 'opening-meeting', 'Opening a meeting', 'Set the purpose and begin efficiently.', 1),
  ('d4000000-0000-4000-8000-000000000002', 'work-meetings', 'giving-updates', 'Giving updates', 'Explain progress, timing, and blockers.', 2),
  ('d4000000-0000-4000-8000-000000000003', 'work-meetings', 'clarifying', 'Clarifying', 'Check meaning, scope, and expectations.', 3),
  ('d4000000-0000-4000-8000-000000000004', 'work-meetings', 'sharing-view', 'Sharing a view', 'Present an opinion and support it clearly.', 4),
  ('d4000000-0000-4000-8000-000000000005', 'work-meetings', 'agreement-disagreement', 'Agreement and disagreement', 'Respond constructively without losing nuance.', 5),
  ('d4000000-0000-4000-8000-000000000006', 'work-meetings', 'decisions-actions', 'Decisions and actions', 'Confirm ownership, deadlines, and next steps.', 6),

  ('e5000000-0000-4000-8000-000000000001', 'home-daily-life', 'daily-routines', 'Daily routines', 'Describe regular activities and changes in routine.', 1),
  ('e5000000-0000-4000-8000-000000000002', 'home-daily-life', 'cooking-at-home', 'Cooking at home', 'Prepare food and coordinate a meal.', 2),
  ('e5000000-0000-4000-8000-000000000003', 'home-daily-life', 'chores', 'Chores', 'Divide, describe, and finish household tasks.', 3),
  ('e5000000-0000-4000-8000-000000000004', 'home-daily-life', 'repairs-maintenance', 'Repairs and maintenance', 'Explain a problem and arrange a repair.', 4),
  ('e5000000-0000-4000-8000-000000000005', 'home-daily-life', 'neighbors-visitors', 'Neighbors and visitors', 'Handle visits, noise, deliveries, and shared spaces.', 5),
  ('e5000000-0000-4000-8000-000000000006', 'home-daily-life', 'household-plans', 'Household plans', 'Coordinate schedules, purchases, and practical decisions.', 6),

  ('f6000000-0000-4000-8000-000000000001', 'feelings-relationships', 'naming-feelings', 'Naming how you feel', 'Express emotions with the right degree of nuance.', 1),
  ('f6000000-0000-4000-8000-000000000002', 'feelings-relationships', 'checking-in', 'Checking in', 'Ask how someone is and listen carefully.', 2),
  ('f6000000-0000-4000-8000-000000000003', 'feelings-relationships', 'offering-support', 'Offering support', 'Show care without making assumptions.', 3),
  ('f6000000-0000-4000-8000-000000000004', 'feelings-relationships', 'expressing-needs', 'Expressing needs', 'State a need or boundary clearly.', 4),
  ('f6000000-0000-4000-8000-000000000005', 'feelings-relationships', 'handling-disagreement', 'Handling disagreement', 'Address tension and work toward understanding.', 5),
  ('f6000000-0000-4000-8000-000000000006', 'feelings-relationships', 'reflecting-connecting', 'Reflecting and connecting', 'Talk about trust, change, and what matters.', 6)
on conflict (theme_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

alter table public.vocabulary_items
  add column if not exists source text not null default 'curated',
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists source_model text,
  add column if not exists prompt_version text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'vocabulary_items_source'
      and conrelid = 'public.vocabulary_items'::regclass
  ) then
    alter table public.vocabulary_items
      add constraint vocabulary_items_source check (source in ('curated', 'ai'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'vocabulary_items_source_ownership'
      and conrelid = 'public.vocabulary_items'::regclass
  ) then
    alter table public.vocabulary_items
      add constraint vocabulary_items_source_ownership check (
        (source = 'curated' and owner_id is null and source_model is null and prompt_version is null)
        or
        (source = 'ai' and owner_id is not null and char_length(source_model) between 1 and 100 and char_length(prompt_version) between 1 and 100)
      );
  end if;
end;
$$;

create index if not exists vocabulary_items_owner_topic_idx
  on public.vocabulary_items(owner_id, cefr_level, section_id, created_at)
  where owner_id is not null;

alter policy "Authenticated users can read vocabulary at their level"
  on public.vocabulary_items
  using (
    cefr_level = (
      select profiles.proficiency_level from public.profiles
      where profiles.id = (select auth.uid())
    )
    and (source = 'curated' or owner_id = (select auth.uid()))
    and exists (
      select 1
      from public.vocabulary_sections
      join public.vocabulary_themes on vocabulary_themes.id = vocabulary_sections.theme_id
      where vocabulary_sections.id = vocabulary_items.section_id
        and vocabulary_themes.is_published
    )
  );

create table if not exists public.topic_generation_quota (
  user_id uuid primary key references auth.users(id) on delete cascade,
  day_started_at timestamptz not null default now(),
  day_count integer not null default 0 check (day_count >= 0),
  burst_started_at timestamptz not null default now(),
  burst_count integer not null default 0 check (burst_count >= 0)
);
alter table public.topic_generation_quota enable row level security;
revoke all on public.topic_generation_quota from anon, authenticated;

create or replace function public.consume_topic_generation_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_now timestamptz := now();
  v_quota public.topic_generation_quota%rowtype;
begin
  if v_user_id is null then return false; end if;
  insert into public.topic_generation_quota(user_id) values (v_user_id)
  on conflict (user_id) do nothing;
  select * into v_quota from public.topic_generation_quota
  where user_id = v_user_id for update;
  if v_quota.day_started_at <= v_now - interval '24 hours' then
    v_quota.day_started_at := v_now;
    v_quota.day_count := 0;
  end if;
  if v_quota.burst_started_at <= v_now - interval '10 minutes' then
    v_quota.burst_started_at := v_now;
    v_quota.burst_count := 0;
  end if;
  if v_quota.day_count >= 4 or v_quota.burst_count >= 2 then return false; end if;
  update public.topic_generation_quota
  set day_started_at = v_quota.day_started_at,
      day_count = v_quota.day_count + 1,
      burst_started_at = v_quota.burst_started_at,
      burst_count = v_quota.burst_count + 1
  where user_id = v_user_id;
  return true;
end;
$$;
revoke all on function public.consume_topic_generation_quota() from public, anon;
grant execute on function public.consume_topic_generation_quota() to authenticated;

create or replace function public.save_topic_expansion(
  p_theme_id text,
  p_items jsonb,
  p_model text,
  p_prompt_version text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_level text;
  v_item jsonb;
  v_section_id uuid;
  v_sort_order integer;
  v_inserted integer := 0;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select proficiency_level into v_level from public.profiles where id = v_user_id;
  if v_level not in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') then raise exception 'Profile level required'; end if;
  if char_length(p_theme_id) not between 1 and 64
    or char_length(p_model) not between 1 and 100
    or char_length(p_prompt_version) not between 1 and 100
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) not between 1 and 12 then
    raise exception 'Invalid topic expansion';
  end if;
  if not exists (select 1 from public.vocabulary_themes where id = p_theme_id and is_published) then
    raise exception 'Topic unavailable';
  end if;
  if (
    select count(*)
    from public.vocabulary_items i
    join public.vocabulary_sections s on s.id = i.section_id
    where s.theme_id = p_theme_id
      and i.cefr_level = v_level
      and i.source = 'ai'
      and i.owner_id = v_user_id
  ) >= 72 then
    raise exception 'Topic expansion limit reached';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) <> 'object'
      or v_item - 'section_slug' - 'spanish' - 'english' - 'example_es' - 'example_en' - 'usage_note' <> '{}'::jsonb
      or jsonb_typeof(v_item->'section_slug') <> 'string'
      or jsonb_typeof(v_item->'spanish') <> 'string'
      or jsonb_typeof(v_item->'english') <> 'string'
      or jsonb_typeof(v_item->'example_es') <> 'string'
      or jsonb_typeof(v_item->'example_en') <> 'string'
      or not (v_item->'usage_note' = 'null'::jsonb or jsonb_typeof(v_item->'usage_note') = 'string')
      or char_length(btrim(v_item->>'section_slug')) not between 1 and 80
      or char_length(btrim(v_item->>'spanish')) not between 1 and 160
      or char_length(btrim(v_item->>'english')) not between 1 and 160
      or char_length(btrim(v_item->>'example_es')) not between 1 and 300
      or char_length(btrim(v_item->>'example_en')) not between 1 and 300
      or (v_item->'usage_note' <> 'null'::jsonb and char_length(btrim(v_item->>'usage_note')) not between 1 and 300)
    then raise exception 'Invalid generated expression'; end if;

    select id into v_section_id from public.vocabulary_sections
    where theme_id = p_theme_id and slug = btrim(v_item->>'section_slug');
    if v_section_id is null then raise exception 'Invalid topic moment'; end if;

    if not exists (
      select 1 from public.vocabulary_items
      where section_id = v_section_id and cefr_level = v_level
        and lower(btrim(spanish)) = lower(btrim(v_item->>'spanish'))
        and (owner_id is null or owner_id = v_user_id)
    ) then
      if (
        select count(*)
        from public.vocabulary_items i
        join public.vocabulary_sections s on s.id = i.section_id
        where s.theme_id = p_theme_id
          and i.cefr_level = v_level
          and i.source = 'ai'
          and i.owner_id = v_user_id
      ) >= 72 then
        exit;
      end if;
      select coalesce(max(sort_order), 0) + 1 into v_sort_order
      from public.vocabulary_items
      where section_id = v_section_id and cefr_level = v_level
        and (owner_id is null or owner_id = v_user_id);
      insert into public.vocabulary_items(
        section_id, spanish, english, example_es, example_en, usage_note, sort_order,
        cefr_level, source, owner_id, source_model, prompt_version
      ) values (
        v_section_id, btrim(v_item->>'spanish'), btrim(v_item->>'english'),
        btrim(v_item->>'example_es'), btrim(v_item->>'example_en'),
        nullif(btrim(v_item->>'usage_note'), ''), v_sort_order,
        v_level, 'ai', v_user_id, p_model, p_prompt_version
      );
      v_inserted := v_inserted + 1;
    end if;
  end loop;
  return v_inserted;
end;
$$;
revoke all on function public.save_topic_expansion(text, jsonb, text, text) from public, anon;
grant execute on function public.save_topic_expansion(text, jsonb, text, text) to authenticated;

alter policy "Users can create their own vocabulary progress"
  on public.user_vocabulary_progress
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.vocabulary_items where vocabulary_items.id = item_id)
  );

alter policy "Users can update their own vocabulary progress"
  on public.user_vocabulary_progress
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.vocabulary_items where vocabulary_items.id = item_id)
  );
