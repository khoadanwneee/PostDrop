-- PostgreSQL remains the source of truth for future work. These functions claim
-- due actions and durably create an outbox event before BullMQ is involved.

alter table public.scheduled_actions
  add column dispatch_count integer not null default 0
    check (dispatch_count >= 0);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  scheduled_action_id uuid not null
    references public.scheduled_actions(id) on delete cascade,
  dispatch_count integer not null check (dispatch_count > 0),
  event_type text not null check (event_type = 'scheduled_action.ready'),
  queue_name text not null
    check (queue_name in ('delivery', 'notifications', 'documents', 'fulfillment')),
  job_name text not null,
  job_id text not null unique,
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'published', 'failed')),
  publish_attempt_count integer not null default 0
    check (publish_attempt_count >= 0),
  max_publish_attempts integer not null default 20
    check (max_publish_attempts > 0),
  available_at timestamptz not null default timezone('utc', now()),
  locked_at timestamptz,
  locked_by text,
  published_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (scheduled_action_id, dispatch_count),
  constraint outbox_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index outbox_events_ready_idx
  on public.outbox_events(available_at, created_at)
  where status in ('pending', 'failed');

create index outbox_events_processing_idx
  on public.outbox_events(locked_at)
  where status = 'processing';

create trigger outbox_events_set_updated_at
  before update on public.outbox_events
  for each row execute function public.set_updated_at();

alter table public.outbox_events enable row level security;

revoke all on table public.outbox_events from anon, authenticated;
grant select, insert, update on table public.outbox_events to service_role;

create or replace function public.claim_due_scheduled_actions(
  p_worker_id text,
  p_limit integer default 50
)
returns setof public.scheduled_actions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action public.scheduled_actions;
  v_queue_name text;
begin
  if nullif(trim(p_worker_id), '') is null then
    raise exception 'Worker ID is required' using errcode = '22023';
  end if;

  if p_limit < 1 or p_limit > 500 then
    raise exception 'Claim limit must be between 1 and 500'
      using errcode = '22023';
  end if;

  for v_action in
    select *
    from public.scheduled_actions
    where status in ('pending', 'failed')
      and attempt_count < max_attempts
      and coalesce(next_attempt_at, execute_at) <= timezone('utc', now())
    order by coalesce(next_attempt_at, execute_at), created_at
    limit p_limit
    for update skip locked
  loop
    update public.scheduled_actions
    set
      status = 'queued',
      dispatch_count = dispatch_count + 1,
      locked_at = timezone('utc', now()),
      locked_by = p_worker_id,
      last_error_code = null
    where id = v_action.id
    returning * into v_action;

    v_queue_name := case v_action.action_type
      when 'deliver_email' then 'delivery'
      when 'send_address_confirmation' then 'notifications'
      when 'create_print_order' then 'fulfillment'
      else 'delivery'
    end;

    insert into public.outbox_events (
      scheduled_action_id,
      dispatch_count,
      event_type,
      queue_name,
      job_name,
      job_id,
      payload
    )
    values (
      v_action.id,
      v_action.dispatch_count,
      'scheduled_action.ready',
      v_queue_name,
      v_action.action_type,
      v_action.id::text || '-' || v_action.dispatch_count::text,
      jsonb_build_object(
        'scheduledActionId', v_action.id,
        'letterId', v_action.letter_id,
        'actionType', v_action.action_type,
        'idempotencyKey', v_action.idempotency_key,
        'dispatchCount', v_action.dispatch_count
      )
    );

    return next v_action;
  end loop;

  return;
end;
$$;

create or replace function public.claim_pending_outbox_events(
  p_worker_id text,
  p_limit integer default 50,
  p_lock_timeout_seconds integer default 300
)
returns setof public.outbox_events
language plpgsql
security definer
set search_path = ''
as $$
begin
  if nullif(trim(p_worker_id), '') is null then
    raise exception 'Worker ID is required' using errcode = '22023';
  end if;

  if p_limit < 1 or p_limit > 500 then
    raise exception 'Claim limit must be between 1 and 500'
      using errcode = '22023';
  end if;

  if p_lock_timeout_seconds < 1 then
    raise exception 'Lock timeout must be positive' using errcode = '22023';
  end if;

  return query
  with claimable as (
    select id
    from public.outbox_events
    where (
        status in ('pending', 'failed')
        and available_at <= timezone('utc', now())
        and publish_attempt_count < max_publish_attempts
      )
      or (
        status = 'processing'
        and locked_at
          < timezone('utc', now()) - make_interval(secs => p_lock_timeout_seconds)
      )
    order by available_at, created_at
    limit p_limit
    for update skip locked
  )
  update public.outbox_events as event
  set
    status = 'processing',
    publish_attempt_count = event.publish_attempt_count + 1,
    locked_at = timezone('utc', now()),
    locked_by = p_worker_id,
    last_error_code = null
  from claimable
  where event.id = claimable.id
  returning event.*;
end;
$$;

create or replace function public.mark_outbox_event_published(
  p_event_id uuid,
  p_worker_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.outbox_events
  set
    status = 'published',
    published_at = timezone('utc', now()),
    locked_at = null,
    locked_by = null,
    last_error_code = null
  where id = p_event_id
    and status = 'processing'
    and locked_by = p_worker_id;

  if not found then
    raise exception 'Claimed outbox event not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.mark_outbox_event_failed(
  p_event_id uuid,
  p_worker_id text,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.outbox_events
  set
    status = 'failed',
    available_at = timezone('utc', now()) + make_interval(
      secs => least(300, power(2, publish_attempt_count)::integer)
    ),
    locked_at = null,
    locked_by = null,
    last_error_code = left(coalesce(p_error_code, 'UNKNOWN'), 120)
  where id = p_event_id
    and status = 'processing'
    and locked_by = p_worker_id;

  if not found then
    raise exception 'Claimed outbox event not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.reconcile_scheduling(
  p_outbox_lock_timeout_seconds integer default 300,
  p_republish_after_seconds integer default 900
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released_outbox integer;
  v_republished_outbox integer;
  v_released_actions integer;
begin
  if p_outbox_lock_timeout_seconds < 1 or p_republish_after_seconds < 1 then
    raise exception 'Reconciliation timeouts must be positive'
      using errcode = '22023';
  end if;

  update public.outbox_events
  set
    status = 'pending',
    available_at = timezone('utc', now()),
    locked_at = null,
    locked_by = null,
    last_error_code = 'STALE_OUTBOX_LOCK'
  where status = 'processing'
    and locked_at
      < timezone('utc', now())
        - make_interval(secs => p_outbox_lock_timeout_seconds);
  get diagnostics v_released_outbox = row_count;

  -- Re-adding the same BullMQ job ID is idempotent while the job still exists,
  -- and rebuilds a missing job after Redis data loss.
  update public.outbox_events as event
  set
    status = 'pending',
    available_at = timezone('utc', now()),
    published_at = null,
    publish_attempt_count = 0,
    last_error_code = 'REPUBLISH_CHECK'
  where event.status = 'published'
    and event.published_at
      < timezone('utc', now()) - make_interval(secs => p_republish_after_seconds)
    and exists (
      select 1
      from public.scheduled_actions as action
      where action.id = event.scheduled_action_id
        and action.status = 'queued'
        and action.dispatch_count = event.dispatch_count
    );
  get diagnostics v_republished_outbox = row_count;

  update public.scheduled_actions as action
  set
    status = 'pending',
    locked_at = null,
    locked_by = null,
    last_error_code = 'MISSING_OUTBOX'
  where action.status = 'queued'
    and not exists (
      select 1
      from public.outbox_events as event
      where event.scheduled_action_id = action.id
        and event.dispatch_count = action.dispatch_count
    );
  get diagnostics v_released_actions = row_count;

  return jsonb_build_object(
    'releasedOutboxLocks', v_released_outbox,
    'republishedOutboxEvents', v_republished_outbox,
    'releasedActions', v_released_actions
  );
end;
$$;

revoke all on function public.claim_due_scheduled_actions(text, integer)
  from public;
revoke all on function public.claim_pending_outbox_events(text, integer, integer)
  from public;
revoke all on function public.mark_outbox_event_published(uuid, text)
  from public;
revoke all on function public.mark_outbox_event_failed(uuid, text, text)
  from public;
revoke all on function public.reconcile_scheduling(integer, integer)
  from public;

grant execute on function public.claim_due_scheduled_actions(text, integer)
  to service_role;
grant execute on function public.claim_pending_outbox_events(text, integer, integer)
  to service_role;
grant execute on function public.mark_outbox_event_published(uuid, text)
  to service_role;
grant execute on function public.mark_outbox_event_failed(uuid, text, text)
  to service_role;
grant execute on function public.reconcile_scheduling(integer, integer)
  to service_role;
