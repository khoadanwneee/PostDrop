import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ClaimedOutboxEvent,
  PreparedEmailNotification,
} from './scheduling.types';

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

  async completeLetterRelease(
    scheduledActionId: string,
    letterId: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc('complete_letter_release', {
      p_scheduled_action_id: scheduledActionId,
      p_letter_id: letterId,
    });
    this.throwOnError(error);
    return data === true;
  }

  async prepareEmailNotification(
    scheduledActionId: string,
    letterId: string,
  ): Promise<PreparedEmailNotification> {
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc('prepare_email_notification', {
      p_scheduled_action_id: scheduledActionId,
      p_letter_id: letterId,
    });
    this.throwOnError(error);
    const notification = data?.[0] as PreparedEmailNotification | undefined;
    if (!notification) {
      throw new InternalServerErrorException({
        message: 'Email notification preparation returned no data',
        code: 'EMPTY_NOTIFICATION',
      });
    }
    return notification;
  }

  async completeEmailNotification(
    scheduledActionId: string,
    attemptId: string,
    providerMessageId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('complete_email_notification', {
      p_scheduled_action_id: scheduledActionId,
      p_attempt_id: attemptId,
      p_provider_message_id: providerMessageId,
    });
    this.throwOnError(error);
  }

  async failEmailNotification(
    scheduledActionId: string,
    attemptId: string,
    errorCode: string,
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('fail_email_notification', {
      p_scheduled_action_id: scheduledActionId,
      p_attempt_id: attemptId,
      p_error_code: errorCode,
    });
    this.throwOnError(error);
  }

  async markActionFailed(
    scheduledActionId: string,
    errorCode: string,
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('mark_scheduled_action_failed', {
      p_scheduled_action_id: scheduledActionId,
      p_error_code: errorCode,
    });
    this.throwOnError(error);
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
