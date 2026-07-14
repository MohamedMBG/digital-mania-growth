import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { ORDER_SUBMIT_QUEUE } from "src/orders/orders.constants";
import { OutboxDispatcher } from "./outbox.dispatcher";
import {
  OUTBOX_EVENT_ORDER_SUBMIT,
  OUTBOX_MAX_ATTEMPTS,
  OUTBOX_STATUS_FAILED,
  OUTBOX_STATUS_PENDING,
  OUTBOX_STATUS_PROCESSED,
} from "./outbox.constants";

function claimedRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "evt-1",
    eventType: OUTBOX_EVENT_ORDER_SUBMIT,
    aggregateId: "order-1",
    payload: { orderId: "order-1" },
    attempts: 1,
    ...overrides,
  };
}

describe("OutboxDispatcher.dispatchBatch", () => {
  let dispatcher: OutboxDispatcher;
  let prisma: { $queryRaw: jest.Mock; outboxEvent: { update: jest.Mock } };
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
      outboxEvent: { update: jest.fn().mockResolvedValue({}) },
    };
    queue = { add: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxDispatcher,
        { provide: PrismaService, useValue: prisma },
        { provide: getQueueToken(ORDER_SUBMIT_QUEUE), useValue: queue },
      ],
    }).compile();

    // ponytail: pull instance without init() so the poll timer never starts in tests.
    dispatcher = module.get(OutboxDispatcher);
  });

  it("returns 0 and enqueues nothing when no rows are claimed", async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    expect(await dispatcher.dispatchBatch()).toBe(0);
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("enqueues the job and marks the event processed on success", async () => {
    prisma.$queryRaw.mockResolvedValue([claimedRow()]);

    const count = await dispatcher.dispatchBatch();

    expect(count).toBe(1);
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "evt-1" },
        data: expect.objectContaining({ status: OUTBOX_STATUS_PROCESSED }),
      })
    );
  });

  it("requeues as pending with backoff when a mid-attempt dispatch fails", async () => {
    prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 2 })]);
    queue.add.mockRejectedValue(new Error("redis down"));

    await dispatcher.dispatchBatch();

    const data = prisma.outboxEvent.update.mock.calls[0][0].data;
    expect(data.status).toBe(OUTBOX_STATUS_PENDING);
    expect(data.availableAt).toBeInstanceOf(Date);
    expect(data.lastError).toContain("redis down");
  });

  it("marks the event failed once max attempts are reached", async () => {
    prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: OUTBOX_MAX_ATTEMPTS })]);
    queue.add.mockRejectedValue(new Error("still down"));

    await dispatcher.dispatchBatch();

    expect(prisma.outboxEvent.update.mock.calls[0][0].data.status).toBe(
      OUTBOX_STATUS_FAILED
    );
  });

  it("fails an unknown event type instead of enqueuing it", async () => {
    prisma.$queryRaw.mockResolvedValue([
      claimedRow({ eventType: "bogus.event", attempts: OUTBOX_MAX_ATTEMPTS }),
    ]);

    await dispatcher.dispatchBatch();

    expect(queue.add).not.toHaveBeenCalled();
    expect(prisma.outboxEvent.update.mock.calls[0][0].data.status).toBe(
      OUTBOX_STATUS_FAILED
    );
  });
});
