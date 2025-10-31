import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AutoConnect Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("loadAutoConnectConfig", () => {
    it("returns null when config file not found (404)", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");
      const result = await loadAutoConnectConfig();

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith("/autoconnect.json");
    });

    it("returns null when config file request fails", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");
      const result = await loadAutoConnectConfig();

      expect(result).toBeNull();
    });

    it("returns parsed config when valid JSON is present", async () => {
      const validConfig = {
        autoConnect: {
          transport: "http",
          url: "http://192.168.1.100",
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(validConfig),
      } as unknown as Response);

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");
      const result = await loadAutoConnectConfig();

      expect(result).toEqual(validConfig.autoConnect);
    });

    it("throws validation error when transport is not http", async () => {
      const invalidConfig = {
        autoConnect: {
          transport: "bluetooth",
          url: "http://192.168.1.100",
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(invalidConfig),
      } as unknown as Response);

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");

      await expect(loadAutoConnectConfig()).rejects.toThrow();
    });

    it("throws validation error when url is missing", async () => {
      const invalidConfig = {
        autoConnect: {
          transport: "http",
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(invalidConfig),
      } as unknown as Response);

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");

      await expect(loadAutoConnectConfig()).rejects.toThrow();
    });

    it("throws validation error when autoConnect key is missing", async () => {
      const invalidConfig = {
        someOtherKey: "value",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(invalidConfig),
      } as unknown as Response);

      const { loadAutoConnectConfig } = await import("./autoconnect.ts");

      await expect(loadAutoConnectConfig()).rejects.toThrow();
    });
  });
});
