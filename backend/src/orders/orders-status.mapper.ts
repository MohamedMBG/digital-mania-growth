import { OrderStatus } from "@prisma/client";

export function mapProviderStatus(status: string): OrderStatus {
  const normalized = status.trim().toLowerCase();

  if (["completed", "complete"].includes(normalized)) {
    return OrderStatus.completed;
  }

  if (["partial", "partially completed"].includes(normalized)) {
    return OrderStatus.partial;
  }

  if (["processing", "in progress", "progress", "pending"].includes(normalized)) {
    return OrderStatus.processing;
  }

  if (["canceled", "cancelled"].includes(normalized)) {
    return OrderStatus.canceled;
  }

  if (["failed", "error"].includes(normalized)) {
    return OrderStatus.failed;
  }

  return OrderStatus.processing;
}
