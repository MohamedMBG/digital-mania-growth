import { BadGatewayException, ServiceUnavailableException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { ProviderService } from "./provider.service";

const mockPost = jest.fn();
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({ post: mockPost })),
    isAxiosError: jest.fn(),
  },
}));

const mockedAxios = axios as unknown as {
  isAxiosError: jest.Mock;
};

const config: Record<string, string> = {
  "provider.apiKey": "key-1",
  "provider.url": "https://provider.test/api",
};

describe("ProviderService", () => {
  let service: ProviderService;

  beforeEach(async () => {
    mockPost.mockReset();
    mockedAxios.isAxiosError.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        { provide: ConfigService, useValue: { getOrThrow: (k: string) => config[k] } },
      ],
    }).compile();

    service = module.get(ProviderService);
  });

  it("returns provider data and sends the api key on success", async () => {
    mockPost.mockResolvedValue({ data: { order: 555 } });

    const result = await service.createOrder({ service: "1", link: "x", quantity: 10 });

    expect(result).toEqual({ order: 555 });
    expect(mockPost.mock.calls[0][1]).toEqual(
      expect.objectContaining({ key: "key-1", action: "add", service: "1" })
    );
  });

  it("maps an in-body provider error to BadGateway", async () => {
    mockPost.mockResolvedValue({ data: { error: "Not enough funds" } });

    await expect(service.getBalance()).rejects.toThrow(BadGatewayException);
  });

  it("maps an HTTP error response to BadGateway", async () => {
    const axiosError = {
      response: { status: 500, data: { error: "boom" } },
      isAxiosError: true,
    };
    mockPost.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(service.getBalance()).rejects.toThrow(BadGatewayException);
  });

  it("maps a timeout / no-response to ServiceUnavailable", async () => {
    const axiosError = { request: {}, isAxiosError: true };
    mockPost.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(service.getBalance()).rejects.toThrow(ServiceUnavailableException);
  });

  it("wraps a non-axios failure as ServiceUnavailable", async () => {
    mockPost.mockRejectedValue(new Error("weird"));
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(service.getBalance()).rejects.toThrow(ServiceUnavailableException);
  });
});
