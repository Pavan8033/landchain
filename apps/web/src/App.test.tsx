import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";

describe("LandChain Web Application Tests", () => {
  it("renders Landing Page brand title and tagline", async () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </AuthProvider>
    );

    const titleMatches = screen.getAllByText(/Secure Land Records/i);
    expect(titleMatches.length).toBeGreaterThan(0);

    const taglineMatches = screen.getAllByText(/Transparent Ownership/i);
    expect(taglineMatches.length).toBeGreaterThan(0);
  });

  it("renders public navigation links", () => {
    render(
      <AuthProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </AuthProvider>
    );

    const searchLinks = screen.getAllByText(/Search Registry/i);
    expect(searchLinks.length).toBeGreaterThan(0);

    const howItWorksLinks = screen.getAllByText(/How It Works/i);
    expect(howItWorksLinks.length).toBeGreaterThan(0);

    const aboutLinks = screen.getAllByText(/About/i);
    expect(aboutLinks.length).toBeGreaterThan(0);
  });
});

import { TransferTimeline } from "./components/common/TransferTimeline";

describe("Step 5 & Step 7 Component Tests", () => {
  it("renders TransferTimeline in PENDING_BUYER state with active buyer step", () => {
    render(<TransferTimeline status="PENDING_BUYER" />);
    expect(screen.getByText("TRANSFER CREATED")).toBeDefined();
    expect(screen.getByText("BUYER CONSENT")).toBeDefined();
    expect(screen.getByText("CURRENT STEP")).toBeDefined();
    expect(screen.getByText("GOVERNMENT REVIEW")).toBeDefined();
  });

  it("renders TransferTimeline in PENDING_GOVERNMENT state after buyer acceptance", () => {
    render(<TransferTimeline status="PENDING_GOVERNMENT" />);
    expect(screen.getByText(/ACTIVE/i)).toBeDefined();
    expect(screen.getByText("GOVERNMENT REVIEW")).toBeDefined();
    expect(screen.getByText("BLOCKCHAIN TRANSFER")).toBeDefined();
  });

  it("renders TransferTimeline in REJECTED_BY_BUYER state", () => {
    render(<TransferTimeline status="REJECTED_BY_BUYER" />);
    expect(screen.getByText("REJECTED")).toBeDefined();
    expect(screen.getByText("NOT REQUIRED")).toBeDefined();
    expect(screen.getByText("NOT EXECUTED")).toBeDefined();
  });
});
