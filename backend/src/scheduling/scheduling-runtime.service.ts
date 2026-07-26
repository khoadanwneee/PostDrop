import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SchedulingRuntimeConfig,
  schedulingRuntimeConfig,
} from './scheduling.config';
import { OutboxRelayService } from './outbox-relay.service';
import { SchedulingRepository } from './scheduling.repository';

@Injectable()
export class SchedulingRuntimeService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(SchedulingRuntimeService.name);
  private readonly runtime: SchedulingRuntimeConfig;
  private readonly timers: NodeJS.Timeout[] = [];
  private claiming = false;
  private relaying = false;
  private reconciling = false;

  constructor(
    config: ConfigService,
    private readonly repository: SchedulingRepository,
    private readonly relay: OutboxRelayService,
  ) {
    this.runtime = schedulingRuntimeConfig(config);
  }

  onApplicationBootstrap(): void {
    this.logger.log(`Scheduling runtime started as ${this.runtime.workerId}`);

    void this.claimDueActions();
    void this.relayOutbox();
    void this.reconcile();

    this.timers.push(
      setInterval(
        () => void this.claimDueActions(),
        this.runtime.schedulerPollIntervalMs,
      ),
      setInterval(
        () => void this.relayOutbox(),
        this.runtime.outboxPollIntervalMs,
      ),
      setInterval(
        () => void this.reconcile(),
        this.runtime.reconciliationIntervalMs,
      ),
    );
  }

  onApplicationShutdown(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
  }

  private async claimDueActions(): Promise<void> {
    if (this.claiming) {
      return;
    }
    this.claiming = true;
    try {
      const count = await this.repository.claimDueActions(
        this.runtime.workerId,
        this.runtime.batchSize,
      );
      if (count > 0) {
        this.logger.log(`Claimed ${count} due scheduled action(s)`);
      }
    } catch (error) {
      this.logger.error(`Scheduled-action claim failed: ${this.errorCode(error)}`);
    } finally {
      this.claiming = false;
    }
  }

  private async relayOutbox(): Promise<void> {
    if (this.relaying) {
      return;
    }
    this.relaying = true;
    try {
      const count = await this.relay.publishClaimed(
        this.runtime.workerId,
        this.runtime.batchSize,
        this.runtime.schedulerLockTimeoutSeconds,
      );
      if (count > 0) {
        this.logger.log(`Published ${count} outbox event(s) to BullMQ`);
      }
    } catch (error) {
      this.logger.error(`Outbox relay failed: ${this.errorCode(error)}`);
    } finally {
      this.relaying = false;
    }
  }

  private async reconcile(): Promise<void> {
    if (this.reconciling) {
      return;
    }
    this.reconciling = true;
    try {
      const result = await this.repository.reconcile(
        this.runtime.schedulerLockTimeoutSeconds,
        this.runtime.schedulerLockTimeoutSeconds,
      );
      const changed = Object.values(result).reduce(
        (total, value) => total + Number(value),
        0,
      );
      if (changed > 0) {
        this.logger.warn(`Scheduling reconciliation repaired ${changed} item(s)`);
      }
    } catch (error) {
      this.logger.error(`Scheduling reconciliation failed: ${this.errorCode(error)}`);
    } finally {
      this.reconciling = false;
    }
  }

  private errorCode(error: unknown): string {
    return error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  }
}
