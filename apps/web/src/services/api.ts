import {
  LandApplication,
  LandRecord,
  TransferRequest,
  AuditLog,
  NotificationItem,
  UserProfile,
  AgentEnquiry,
  UserRole,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("landchain_token") || "";
    const activeDemoRole = localStorage.getItem("landchain_demo_role") as UserRole | null;
    const activeDemoWallet = localStorage.getItem("landchain_demo_wallet") || "";
    const activeDemoUid = localStorage.getItem("landchain_demo_uid") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (activeDemoRole) {
      headers["Authorization"] = `Bearer demo-token-${activeDemoRole}`;
    }

    if (activeDemoRole) {
      headers["X-Demo-Role"] = activeDemoRole;
      if (activeDemoWallet) headers["X-Demo-Wallet"] = activeDemoWallet;
      if (activeDemoUid) headers["X-Demo-Uid"] = activeDemoUid;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, rawResponse = false): Promise<T> {
    const isTestEnv = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test";
    const base = isTestEnv ? "http://localhost:5000/api" : API_BASE;
    const url = `${base}${endpoint}`;
    let res: Response;

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    };

    let timeoutId: any = null;
    try {
      if (options.signal) {
        fetchOptions.signal = options.signal;
      } else if (typeof window !== "undefined" && window.AbortController) {
        // In browser runtime, attach 60s timeout to support free-tier cold starts
        const isTestEnv = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test";
        if (!isTestEnv) {
          const controller = new window.AbortController();
          timeoutId = setTimeout(() => controller.abort(), 60000);
          fetchOptions.signal = controller.signal;
        }
      }
    } catch {
      // Abort signal assignment fallback
    }

    try {
      res = await fetch(url, fetchOptions);
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = networkErr.name === "AbortError";
      const errMsg = isTimeout
        ? "Request timed out connecting to LandChain API."
        : networkErr.message || "Network error";
      console.warn(`[API] Connection failure to ${endpoint}:`, errMsg);
      return this.handleFallback<T>(endpoint, options, errMsg);
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/pdf")) {
      return (await res.blob()) as unknown as T;
    }

    // Safely parse JSON body without crashing on empty or non-JSON responses
    const rawText = await res.text();
    let data: any = null;
    if (rawText && rawText.trim().length > 0) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      if (res.status === 504 || res.status === 502 || (res.status === 500 && !data)) {
        console.warn(`[API] Server returned ${res.status} for ${endpoint}. Attempting fallback.`);
        return this.handleFallback<T>(endpoint, options, `Backend API unreachable (${res.status})`);
      }

      const errorMessage =
        data?.error ||
        data?.message ||
        (typeof data === "string" ? data : "") ||
        `Request failed with status ${res.status}`;
      throw new Error(errorMessage);
    }

    if (data === null) {
      return {} as T;
    }

    if (rawResponse) {
      return data as T;
    }

    return data.data !== undefined ? data.data : data;
  }

  private handleFallback<T>(endpoint: string, options: RequestInit, reason: string): T {
    // Demonstration fallback for land application submission
    if (endpoint === "/applications" && options.method === "POST" && options.body) {
      try {
        const payload = JSON.parse(options.body as string);
        const appId = `LC-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const fallbackApp: LandApplication = {
          id: appId,
          applicationId: appId,
          applicantUid: "seller-123",
          applicantEmail: "seller@landchain.demo",
          applicantWallet: payload.applicantWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          surveyNumber: payload.surveyNumber || "SY-502/7A",
          state: payload.state || "Karnataka",
          district: payload.district || "Bengaluru Urban",
          locality: payload.locality || "Whitefield, Bengaluru",
          address: payload.address || payload.locality,
          areaSqMeters: payload.areaSqMeters || 2400,
          measurementUnit: payload.measurementUnit || "Sq.M",
          landCategory: payload.landCategory || "RESIDENTIAL",
          description: payload.description || "Demonstration residential plot with municipal clearance.",
          documents: payload.documents || [],
          status: "PENDING_REVIEW",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const stored = JSON.parse(localStorage.getItem("landchain_local_apps") || "[]");
        stored.unshift(fallbackApp);
        localStorage.setItem("landchain_local_apps", JSON.stringify(stored));

        console.info("[API Demo Fallback] Handled land application in local demo store:", appId);
        return fallbackApp as unknown as T;
      } catch (e) {
        console.error("Failed to construct fallback application:", e);
      }
    }

    throw new Error(
      `Cannot connect to LandChain API (${reason}). Please ensure the backend server is running on port 5000.`
    );
  }

  // --- Auth APIs ---
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/profile");
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async setRole(targetUid: string, targetRole: UserRole, adminSecret: string): Promise<any> {
    return this.request<any>("/auth/set-role", {
      method: "POST",
      body: JSON.stringify({ targetUid, targetRole, adminSecret }),
    });
  }

  // --- Application APIs ---
  async submitApplication(payload: any): Promise<LandApplication> {
    return this.request<LandApplication>("/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async listApplications(status?: string): Promise<LandApplication[]> {
    const q = status ? `?status=${status}` : "";
    return this.request<LandApplication[]>(`/applications${q}`);
  }

  async getApplication(id: string): Promise<LandApplication> {
    return this.request<LandApplication>(`/applications/${id}`);
  }

  async reviewApplication(id: string, decision: { status: string; reviewNotes: string }): Promise<LandApplication> {
    return this.request<LandApplication>(`/applications/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(decision),
    });
  }

  async confirmApplicationOnChain(id: string, blockchainData: { onChainTxHash: string; onChainBlockNumber: number; contractAddress?: string; landId?: string }): Promise<LandRecord> {
    return this.request<LandRecord>(`/applications/${id}/on-chain`, {
      method: "POST",
      body: JSON.stringify(blockchainData),
    });
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: "DELETE",
    });
  }

  // --- Land Records APIs ---
  async searchRecords(params: { q?: string; locality?: string; category?: string; page?: number; limit?: number }): Promise<{
    data: LandRecord[];
    pagination: { total: number; totalPages: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.locality) query.set("locality", params.locality);
    if (params.category) query.set("category", params.category);
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());

    try {
      const res = await this.request<any>(`/records/search?${query.toString()}`, {}, true);
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        pagination: res?.pagination || { total: res?.data?.length || 0, totalPages: 1, page: 1, limit: 10 },
      };
    } catch (err: any) {
      console.warn("[API] searchRecords notice:", err.message);
      return {
        data: [],
        pagination: { total: 0, totalPages: 1, page: 1, limit: 10 },
      };
    }
  }

  async getRecord(landId: string): Promise<LandRecord> {
    return this.request<LandRecord>(`/records/${landId}`);
  }

  async reconcileRecord(landId: string): Promise<any> {
    return this.request<any>(`/records/${landId}/reconcile`);
  }

  async getHealth(): Promise<{
    status: string;
    service: string;
    databaseMode: string;
    storageMode?: string;
    storage?: { enabled: boolean; status: string; bucket?: string; message?: string };
    blockchain?: { connected: boolean; [key: string]: any };
  }> {
    return this.request<any>("/health");
  }

  getCertificateDownloadUrl(landId: string): string {
    return `${API_BASE}/records/${landId}/certificate`;
  }

  // --- Transfer APIs ---
  async createTransfer(payload: {
    landId: string;
    buyerEmail?: string;
    buyerWallet?: string;
    agreedPrice?: number;
    currency?: string;
    transferType?: "SALE" | "PURCHASE" | "INHERITANCE";
    transferReason?: string;
  }): Promise<TransferRequest> {
    return this.request<TransferRequest>("/transfers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async listTransfers(): Promise<TransferRequest[]> {
    return this.request<TransferRequest[]>("/transfers");
  }

  async getTransfer(id: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${id}`);
  }

  async cancelTransfer(id: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${id}/cancel`, {
      method: "POST",
    });
  }

  async acceptTransfer(id: string, notes?: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  }

  async rejectTransfer(id: string, reason?: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async buyerConsent(id: string, action: "ACCEPT" | "REJECT", notes?: string): Promise<TransferRequest> {
    if (action === "ACCEPT") {
      return this.acceptTransfer(id, notes);
    } else {
      return this.rejectTransfer(id, notes);
    }
  }

  async verifyRecordPublic(landId: string): Promise<any> {
    return this.request<any>(`/records/${landId}/verify`);
  }

  async getRecordHistory(landId: string): Promise<any[]> {
    const res = await this.request<any>(`/records/${landId}/history`);
    return Array.isArray(res) ? res : res?.timeline || res?.history || [];
  }

  async governmentReviewTransfer(id: string, action: "APPROVE" | "REJECT", reviewNotes: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${id}/government-review`, {
      method: "POST",
      body: JSON.stringify({ action, reviewNotes }),
    });
  }

  async completeTransferOnChain(id: string, blockchainTxHash: string, blockchainBlockNumber: number): Promise<any> {
    return this.request<any>(`/transfers/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ blockchainTxHash, blockchainBlockNumber }),
    });
  }

  // --- Audit & Notifications ---
  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit?limit=${limit}`);
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>("/notifications");
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  // --- Agent Enquiries ---
  async getAgentEnquiries(): Promise<AgentEnquiry[]> {
    return this.request<AgentEnquiry[]>("/agent/enquiries");
  }

  async createAgentEnquiry(payload: { landId: string; clientName: string; clientEmail: string; clientPhone?: string; message: string }): Promise<AgentEnquiry> {
    return this.request<AgentEnquiry>("/agent/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
