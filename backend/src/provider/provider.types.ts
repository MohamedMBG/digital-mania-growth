export type ProviderAction =
  | "services"
  | "add"
  | "status"
  | "cancel"
  | "refill"
  | "balance";

export type ProviderBaseRequest = {
  key: string;
  action: ProviderAction;
};

export type ProviderService = {
  service: string;
  name: string;
  type?: string;
  category?: string;
  rate: string;
  min: string;
  max: string;
  refill?: boolean | number | string;
  cancel?: boolean | number | string;
};

export type ProviderServicesResponse = ProviderService[];

export type CreateProviderOrderParams = {
  service: string;
  link: string;
  quantity: number;
};

export type ProviderCreateOrderResponse = {
  order: number | string;
};

export type GetProviderOrderStatusParams = {
  order: string | number;
};

export type ProviderOrderStatusResponse = {
  charge?: string;
  start_count?: string;
  status: string;
  remains?: string;
  currency?: string;
};

export type CancelProviderOrderParams = {
  order: string | number;
};

export type ProviderCancelOrderResponse = {
  cancel?: number | string;
  status?: string;
};

export type RefillProviderOrderParams = {
  order: string | number;
};

export type ProviderRefillOrderResponse = {
  refill?: number | string;
  status?: string;
};

export type ProviderBalanceResponse = {
  balance: string;
  currency: string;
};

export type ProviderErrorResponse = {
  error: string;
};
