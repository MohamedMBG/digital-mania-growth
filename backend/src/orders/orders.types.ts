import { OrderStatus } from "@prisma/client";

export type OrderSubmitJobData = {
  orderId: string;
  userId: string;
  serviceId: string;
  providerServiceId: string;
};

export type OrderStatusUpdateJobData = {
  orderId: string;
};

export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.completed,
  OrderStatus.partial,
  OrderStatus.canceled,
  OrderStatus.failed,
];
