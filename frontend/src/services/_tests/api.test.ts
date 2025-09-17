import axios from "axios";
import { apiService } from "../api";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets auth token correctly", () => {
    const token = "test-token";
    apiService.setAuthToken(token);

    expect(mockedAxios.defaults.headers.common["Authorization"]).toBe(
      `Bearer ${token}`
    );
  });

  it("clears auth token correctly", () => {
    apiService.clearAuthToken();

    expect(
      mockedAxios.defaults.headers.common["Authorization"]
    ).toBeUndefined();
  });

  it("calls login endpoint with correct data", async () => {
    const loginData = { email: "test@example.com", password: "password" };
    const responseData = { token: "mock-token", uuid: "123" };

    mockedAxios.post.mockResolvedValue({ data: responseData });

    const result = await apiService.login(loginData);

    expect(mockedAxios.post).toHaveBeenCalledWith("/tokens", loginData);
    expect(result).toEqual(responseData);
  });

  it("calls register endpoint with correct data", async () => {
    const registerData = {
      email: "test@example.com",
      password: "password",
      role: "customer" as const,
    };
    const responseData = { token: "mock-token", uuid: "123" };

    mockedAxios.post.mockResolvedValue({ data: responseData });

    const result = await apiService.register(registerData);

    expect(mockedAxios.post).toHaveBeenCalledWith("/users", registerData);
    expect(result).toEqual(responseData);
  });
});
