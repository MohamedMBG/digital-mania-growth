import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  CancelProviderOrderParams,
  CreateProviderOrderParams,
  GetProviderOrderStatusParams,
  ProviderAction,
  ProviderBalanceResponse,
  ProviderBaseRequest,
  ProviderCancelOrderResponse,
  ProviderCreateOrderResponse,
  ProviderErrorResponse,
  ProviderOrderStatusResponse,
  ProviderRefillOrderResponse,
  ProviderServicesResponse,
  RefillProviderOrderParams,
} from "./provider.types";

@Injectable()
export class ProviderService {
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>("provider.apiKey");
    this.httpClient = axios.create({
      baseURL: this.configService.getOrThrow<string>("provider.url"),
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }

  async getServices(): Promise<ProviderServicesResponse> {
    return this.sendRequest<ProviderServicesResponse>({
      action: "services",
    });
  }

  async createOrder(
    params: CreateProviderOrderParams
  ): Promise<ProviderCreateOrderResponse> {
    return this.sendRequest<ProviderCreateOrderResponse>({
      action: "add",
      service: params.service,
      link: params.link,
      quantity: params.quantity,
    });
  }

  async getOrderStatus(
    params: GetProviderOrderStatusParams
  ): Promise<ProviderOrderStatusResponse> {
    return this.sendRequest<ProviderOrderStatusResponse>({
      action: "status",
      order: params.order,
    });
  }

  async cancelOrder(
    params: CancelProviderOrderParams
  ): Promise<ProviderCancelOrderResponse> {
    return this.sendRequest<ProviderCancelOrderResponse>({
      action: "cancel",
      order: params.order,
    });
  }

  async refillOrder(
    params: RefillProviderOrderParams
  ): Promise<ProviderRefillOrderResponse> {
    return this.sendRequest<ProviderRefillOrderResponse>({
      action: "refill",
      order: params.order,
    });
  }

  async getBalance(): Promise<ProviderBalanceResponse> {
    return this.sendRequest<ProviderBalanceResponse>({
      action: "balance",
    });
  }

  private async sendRequest<TResponse>(
    payload: Omit<ProviderBaseRequest, "key"> & Record<string, unknown>
  ): Promise<TResponse> {
    try {
      const response = await this.httpClient.post<TResponse | ProviderErrorResponse>("", {
        key: this.apiKey,
        ...payload,
      });

      const data = response.data;

      if (this.isProviderError(data)) {
        throw new BadGatewayException(`Provider API error: ${data.error}`);
      }

      return data as TResponse;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw this.mapAxiosError(error, payload.action);
      }

      throw new ServiceUnavailableException("Provider API request failed.");
    }
  }

  private isProviderError(data: unknown): data is ProviderErrorResponse {
    return Boolean(
      data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as ProviderErrorResponse).error === "string"
    );
  }

  private mapAxiosError(error: AxiosError, action: ProviderAction) {
    if (error.response) {
      const providerMessage =
        typeof error.response.data === "object" &&
        error.response.data &&
        "error" in error.response.data
          ? String((error.response.data as ProviderErrorResponse).error)
          : `Provider returned HTTP ${error.response.status}`;

      return new BadGatewayException(
        `Provider ${action} request failed: ${providerMessage}`
      );
    }

    if (error.request) {
      return new ServiceUnavailableException(
        `Provider ${action} request timed out or no response was received.`
      );
    }

    return new ServiceUnavailableException(
      `Provider ${action} request could not be created.`
    );
  }
}
