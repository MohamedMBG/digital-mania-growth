import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Prisma } from "@prisma/client";
import { Queue } from "bullmq";
import { AppLogger } from "src/common/logger/app-logger.service";
import {
  ORDER_SUBMIT_JOB,
  ORDER_SUBMIT_QUEUE,
} from "src/orders/orders.constants";
import { PrismaService } from "src/prisma/prisma.service";
import {
  OUTBOX_BATCH_SIZE,
  OUTBOX_EVENT_ORDER_SUBMIT,
  OUTBOX_MAX_ATTEMPTS,
  OUTBOX_POLL_INTERVAL_MS,
  OUTBOX_STATUS_FAILED,
  OUTBOX_STATUS_PENDING,
  OUTBOX_STATUS_PROCESSED,
  OUTBOX_STATUS_PROCESSING,
} from "./outbox.constants";

type ClaimedRow = {
  id: string;
  eventType: string;
  aggregateId: string;
  payload: Prisma.JsonValue;
  attempts: number;
};

@Injectable()
export class OutboxDispatcher implements OnModuleInit, OnModuleDestroy {
  private readonly context = "OutboxDispatcher";
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private stopped = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(ORDER_SUBMIT_QUEUE) private readonly orderSubmitQueue: Queue,
    @Optional() @Inject(AppLogger) private readonly logger?: AppLogger
  ) {}

  onModuleInit() {
    this.scheduleNext(0);
  }

  async onModuleDestroy() {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    while (this.running) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  private scheduleNext(delay: number) {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      void this.tick();
    }, delay);
  }

  private async tick() {
    if (this.stopped || this.running) {
      this.scheduleNext(OUTBOX_POLL_INTERVAL_MS);
      return;
    }
    this.running = true;
    try {
      const processed = await this.dispatchBatch();
      const nextDelay = processed > 0 ? 0 : OUTBOX_POLL_INTERVAL_MS;
      this.scheduleNext(nextDelay);
    } catch (error) {
      this.logger?.error(
        `Outbox dispatch loop error: ${(error as Error).message}`,
        (error as Error).stack,
        this.context
      );
      this.scheduleNext(OUTBOX_POLL_INTERVAL_MS);
    } finally {
      this.running = false;
    }
  }

  async dispatchBatch(limit = OUTBOX_BATCH_SIZE): Promise<number> {
    const claimed = await this.prisma.$queryRaw<ClaimedRow[]>`
      UPDATE "OutboxEvent"
      SET "status" = ${OUTBOX_STATUS_PROCESSING},
          "attempts" = "attempts" + 1,
          "updatedAt" = NOW()
      WHERE "id" IN (
        SELECT "id" FROM "OutboxEvent"
        WHERE "status" = ${OUTBOX_STATUS_PENDING}
          AND "availableAt" <= NOW()
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id", "eventType", "aggregateId", "payload", "attempts"
    `;

    if (claimed.length === 0) {
      return 0;
    }

    await Promise.all(claimed.map((row) => this.handleRow(row)));
    return claimed.length;
  }

  private async handleRow(row: ClaimedRow) {
    try {
      await this.dispatch(row);
      await this.prisma.outboxEvent.update({
        where: { id: row.id },
        data: {
          status: OUTBOX_STATUS_PROCESSED,
          processedAt: new Date(),
          lastError: null,
        },
      });
    } catch (error) {
      const message = (error as Error).message ?? String(error);
      const reachedMax = row.attempts >= OUTBOX_MAX_ATTEMPTS;
      const backoffMs = Math.min(300_000, 2 ** row.attempts * 1_000);

      this.logger?.warn(
        `Outbox event ${row.id} (${row.eventType}) failed on attempt ${row.attempts}: ${message}`,
        this.context
      );

      await this.prisma.outboxEvent.update({
        where: { id: row.id },
        data: {
          status: reachedMax ? OUTBOX_STATUS_FAILED : OUTBOX_STATUS_PENDING,
          availableAt: new Date(Date.now() + backoffMs),
          lastError: message.slice(0, 1000),
        },
      });
    }
  }

  private async dispatch(row: ClaimedRow) {
    switch (row.eventType) {
      case OUTBOX_EVENT_ORDER_SUBMIT: {
        await this.orderSubmitQueue.add(ORDER_SUBMIT_JOB, row.payload, {
          jobId: row.aggregateId,
          attempts: 5,
          backoff: { type: "exponential", delay: 5_000 },
        });
        return;
      }
      default:
        throw new Error(`Unknown outbox event type: ${row.eventType}`);
    }
  }
}
