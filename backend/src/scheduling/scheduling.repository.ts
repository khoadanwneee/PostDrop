import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ClaimedOutboxEvent } from './scheduling.types';

@Injectable()
export class SchedulingRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async claimDueActions(workerId: string, limit: number): Promise<number> {
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc('claim_due_scheduled_actions', {
      p_worker_id: workerId,
      p_limit: limit,
    });
    this.throwOnError(error);
    return data?.length ?? 0;
  }

  async claimOutboxEvents(
    workerId: string,
    limit: number,
    lockTimeoutSeconds: number,
  ): Promise<ClaimedOutboxEvent[]> {
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc(
      'claim_pending_outbox_events',
      {
        p_worker_id: workerId,
        p_limit: limit,
        p_lock_timeout_seconds: lockTimeoutSeconds,
      },
    );
    this.throwOnError(error);
    return (data ?? []) as ClaimedOutboxEvent[];
  }

  async markPublished(eventId: string, workerId: string): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('mark_outbox_event_published', {
      p_event_id: eventId,
      p_worker_id: workerId,
    });
    this.throwOnError(error);
  }

  async markFailed(
    eventId: string,
    workerId: string,
    errorCode: string,
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('mark_outbox_event_failed', {
      p_event_id: eventId,
      p_worker_id: workerId,
      p_error_code: errorCode,
    });
    this.throwOnError(error);
  }

  async reconcile(
    lockTimeoutSeconds: number,
    republishAfterSeconds: number,
  ): Promise<Record<string, number>> {
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc('reconcile_scheduling', {
      p_outbox_lock_timeout_seconds: lockTimeoutSeconds,
      p_republish_after_seconds: republishAfterSeconds,
    });
    this.throwOnError(error);
    return (data ?? {}) as Record<string, number>;
  }

  private throwOnError(error: { code?: string; message?: string } | null): void {
    if (!error) {
      return;
    }
    throw new InternalServerErrorException({
      message: 'Scheduling database request failed',
      code: error.code,
    });
  }
}
