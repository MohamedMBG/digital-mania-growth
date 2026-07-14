import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export type OutboxEnqueueInput = {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Prisma.InputJsonValue;
  availableAt?: Date;
};

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(input: OutboxEnqueueInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.outboxEvent.create({
      data: {
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        eventType: input.eventType,
        payload: input.payload,
        availableAt: input.availableAt ?? new Date(),
      },
    });
  }
}
