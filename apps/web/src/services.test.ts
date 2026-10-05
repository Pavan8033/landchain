import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api } from "./services/api";

describe("LandChain Web - ApiClient and Services Test Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should construct request headers with localStorage demo role and token", async () => {
    localStorage.setItem("landchain_token", "test-bearer-token-xyz");
    localStorage.setItem("landchain_demo_role", "seller");
    localStorage.setItem("landchain_demo_wallet", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    localStorage.setItem("landchain_demo_uid", "seller-123");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify({ success: true, data: [] }),
    });
    global.fetch = mockFetch;

    await api.searchRecords({ q: "Bengaluru" });

    expect(mockFetch).toHaveBeenCalled();
    const calledHeaders = mockFetch.mock.calls[0][1].headers;
    expect(calledHeaders["Authorization"]).toBe("Bearer test-bearer-token-xyz");
    expect(calledHeaders["X-Demo-Role"]).toBe("seller");
    expect(calledHeaders["X-Demo-Wallet"]).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    expect(calledHeaders["X-Demo-Uid"]).toBe("seller-123");
  });

  it("should handle offline fallback gracefully when searchRecords network request fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection lost"));

    const result = await api.searchRecords({});
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.pagination).toBeDefined();
  });

  it("should handle application submission fallback to local storage when backend is offline", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection lost"));

    const app = await api.submitApplication({
      surveyNumber: "SY-OFFLINE-001",
      state: "Karnataka",
      district: "Bengaluru Urban",
      locality: "Whitefield",
      areaSqMeters: 2400,
      landCategory: "RESIDENTIAL",
      description: "Offline test parcel",
      applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      documents: [],
    });

    expect(app).toBeDefined();
    expect(app.surveyNumber).toBe("SY-OFFLINE-001");
    expect(app.status).toBe("PENDING_REVIEW");

    const localStored = JSON.parse(localStorage.getItem("landchain_local_apps") || "[]");
    expect(localStored.length).toBeGreaterThan(0);
    expect(localStored[0].surveyNumber).toBe("SY-OFFLINE-001");
  });
});
