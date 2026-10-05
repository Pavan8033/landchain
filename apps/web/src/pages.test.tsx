import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { LandingPage } from "./pages/public/LandingPage";
import { AboutPage } from "./pages/public/AboutPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { NotFoundPage } from "./pages/public/NotFoundPage";
import { AccessDeniedPage } from "./pages/public/AccessDeniedPage";
import { LoginPage } from "./pages/public/LoginPage";

describe("LandChain Web Pages & Routing Test Suite", () => {
  describe("LandingPage", () => {
    it("renders hero headline, metrics badges, and quick CTA buttons", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <LandingPage />
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Secure Land Records/i)).toBeDefined();
      expect(screen.getByText(/Transparent Ownership/i)).toBeDefined();
      expect(screen.getByText(/Verify Record/i)).toBeDefined();
      expect(screen.getByText(/Multi-Party Verification/i)).toBeDefined();
    });
  });

  describe("AboutPage & HowItWorksPage", () => {
    it("renders About Page academic prototype disclaimers and system architecture", () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );

      expect(screen.getAllByText(/About LandChain/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Academic Research Prototype/i)).toBeDefined();
    });

    it("renders How It Works step-by-step lifecycle workflow", () => {
      render(
        <BrowserRouter>
          <HowItWorksPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/How LandChain Works/i)).toBeDefined();
      expect(screen.getByText(/Seller Submits Land Application/i)).toBeDefined();
      expect(screen.getByText(/Authorized On-Chain Minting/i)).toBeDefined();
      expect(screen.getByText(/Buyer Explicit Cryptographic Consent/i)).toBeDefined();
    });
  });

  describe("NotFoundPage & AccessDeniedPage", () => {
    it("renders 404 NotFoundPage with navigation link", () => {
      render(
        <BrowserRouter>
          <NotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/404 - Page Not Found/i)).toBeDefined();
      expect(screen.getByText(/Return to Public Home/i)).toBeDefined();
    });

    it("renders AccessDeniedPage with role explanation and redirect link", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AccessDeniedPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Access Restricted/i)).toBeDefined();
      expect(screen.getByText(/Dashboard/i)).toBeDefined();
    });
  });

  describe("LoginPage", () => {
    it("renders demo role login tabs (Seller, Buyer, Government)", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <LoginPage />
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Sign In to LandChain/i)).toBeDefined();
      expect(screen.getByText(/Instant Evaluator Demo Login/i)).toBeDefined();
      expect(screen.getByText(/Land Seller/i)).toBeDefined();
      expect(screen.getByText(/Land Buyer/i)).toBeDefined();
      expect(screen.getByText(/Gov Registrar/i)).toBeDefined();
    });
  });
});
