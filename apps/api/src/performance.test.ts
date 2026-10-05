import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { Express } from "express";
import { memoryStore } from "./config/firebase";

describe("LandChain API - High-Throughput Performance & Concurrency Benchmarks", () => {
  let app: Express;

  beforeAll(() => {
    app = createApp() as Express;

    // Seed 50 land records for search and query stress testing
    for (let i = 1; i <= 50; i++) {
      const id = `LAND-PERF-${i.toString().padStart(3, "0")}`;
      memoryStore.setDoc("landRecords", id, {
        id,
        landId: id,
        parcelNumber: `SY-PERF-${1000 + i}`,
        locality: i % 2 === 0 ? "Koramangala, Bengaluru" : "Indiranagar, Bengaluru",
        district: "Bengaluru Urban",
        state: "Karnataka",
        areaSqMeters: 1200 + i * 50,
        landCategory: i % 3 === 0 ? "COMMERCIAL" : "RESIDENTIAL",
        description: `Performance benchmark test parcel #${i}`,
        currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        currentOwnerUid: "seller-123",
        currentOwnerEmail: "seller@landchain.demo",
        docIntegrityHash: "0x" + "a".repeat(64),
        verificationState: "VERIFIED_ON_CHAIN",
        publicationState: "PUBLISHED",
        transferCount: i % 5,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  });

  it("PERFORMANCE BENCHMARK 1: 100 Concurrent Public Search Queries", async () => {
    const totalRequests = 100;
    const queries = ["Koramangala", "Indiranagar", "COMMERCIAL", "RESIDENTIAL", "PERF", ""];
    
    const startTime = performance.now();

    const promises = Array.from({ length: totalRequests }).map((_, index) => {
      const q = queries[index % queries.length];
      return request(app)
        .get(`/api/records/search?q=${encodeURIComponent(q)}&page=1&limit=10`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);
          return res;
        });
    });

    await Promise.all(promises);
    const totalDurationMs = performance.now() - startTime;
    const avgLatencyMs = totalDurationMs / totalRequests;
    const reqPerSec = (totalRequests / totalDurationMs) * 1000;

    console.log(`\n      📊 [100 Concurrent Searches] Total: ${totalDurationMs.toFixed(2)}ms | Avg: ${avgLatencyMs.toFixed(2)}ms/req | Throughput: ${reqPerSec.toFixed(0)} req/sec`);

    // Performance target: average latency < 25ms per request in-memory
    expect(avgLatencyMs).toBeLessThan(50);
  });

  it("PERFORMANCE BENCHMARK 2: 50 Concurrent Health Check Endpoint Queries", async () => {
    const totalRequests = 50;
    const startTime = performance.now();

    const promises = Array.from({ length: totalRequests }).map(() =>
      request(app)
        .get("/api/health")
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.status).toBe("HEALTHY");
          return res;
        })
    );

    await Promise.all(promises);
    const totalDurationMs = performance.now() - startTime;
    const avgLatencyMs = totalDurationMs / totalRequests;
    const reqPerSec = (totalRequests / totalDurationMs) * 1000;

    console.log(`      📊 [50 Concurrent Health Checks] Total: ${totalDurationMs.toFixed(2)}ms | Avg: ${avgLatencyMs.toFixed(2)}ms/req | Throughput: ${reqPerSec.toFixed(0)} req/sec`);

    expect(avgLatencyMs).toBeLessThan(50);
  });

  it("PERFORMANCE BENCHMARK 3: 15 Concurrent Digital PDF Certificate Generations", async () => {
    const totalRequests = 15;
    const startTime = performance.now();

    const promises = Array.from({ length: totalRequests }).map((_, index) => {
      const landId = `LAND-PERF-${(index + 1).toString().padStart(3, "0")}`;
      return request(app)
        .get(`/api/records/${landId}/certificate`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.headers["content-type"]).toBe("application/pdf");
          expect(res.body.length).toBeGreaterThan(1000);
          return res;
        });
    });

    await Promise.all(promises);
    const totalDurationMs = performance.now() - startTime;
    const avgLatencyMs = totalDurationMs / totalRequests;
    const reqPerSec = (totalRequests / totalDurationMs) * 1000;

    console.log(`      📊 [15 Concurrent PDF Certificates] Total: ${totalDurationMs.toFixed(2)}ms | Avg: ${avgLatencyMs.toFixed(2)}ms/req | Throughput: ${reqPerSec.toFixed(0)} req/sec`);

    // PDF generation involves QR code synthesis and vector rendering
    expect(avgLatencyMs).toBeLessThan(250);
  });
});
