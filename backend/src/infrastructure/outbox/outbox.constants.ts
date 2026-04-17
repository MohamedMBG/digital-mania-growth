export const OUTBOX_AGGREGATE_ORDER = "order";

export const OUTBOX_EVENT_ORDER_SUBMIT = "order.submit";

export const OUTBOX_STATUS_PENDING = "pending";
export const OUTBOX_STATUS_PROCESSING = "processing";
export const OUTBOX_STATUS_PROCESSED = "processed";
export const OUTBOX_STATUS_FAILED = "failed";

export const OUTBOX_MAX_ATTEMPTS = 10;
export const OUTBOX_POLL_INTERVAL_MS = 2_000;
export const OUTBOX_BATCH_SIZE = 50;
