import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "./types";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { RoleProtectedRoute } from "./components/layout/RoleProtectedRoute";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { AboutPage } from "./pages/public/AboutPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { PublicSearchPage } from "./pages/public/PublicSearchPage";
import { PublicLandDetailsPage } from "./pages/public/PublicLandDetailsPage";
import { PublicVerificationPage } from "./pages/public/PublicVerificationPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";
import { AccessDeniedPage } from "./pages/public/AccessDeniedPage";
import { NotFoundPage } from "./pages/public/NotFoundPage";

// Shared Authenticated Pages
import { ProfilePage } from "./pages/shared/ProfilePage";
import { WalletPage } from "./pages/shared/WalletPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";
import { TransactionDetailsPage } from "./pages/shared/TransactionDetailsPage";

// Seller Pages
import { SellerDashboardPage } from "./pages/seller/SellerDashboardPage";
import { RegisterLandWizardPage } from "./pages/seller/RegisterLandWizardPage";
import { MyLandRecordsPage } from "./pages/seller/MyLandRecordsPage";
import { SellerApplicationsPage } from "./pages/seller/SellerApplicationsPage";
import { CreateTransferPage } from "./pages/seller/CreateTransferPage";
import { SellerTransfersPage } from "./pages/seller/SellerTransfersPage";

// Buyer Pages
import { BuyerDashboardPage } from "./pages/buyer/BuyerDashboardPage";
import { BuyerDiscoveryPage } from "./pages/buyer/BuyerDiscoveryPage";
import { IncomingTransfersPage } from "./pages/buyer/IncomingTransfersPage";
import { BuyerTransferDetailPage } from "./pages/buyer/BuyerTransferDetailPage";
import { BuyerOwnershipHistoryPage } from "./pages/buyer/BuyerOwnershipHistoryPage";

// Government Pages
import { GovDashboardPage } from "./pages/government/GovDashboardPage";
import { PendingApplicationsQueuePage } from "./pages/government/PendingApplicationsQueuePage";
import { GovVerificationWorkspacePage } from "./pages/government/GovVerificationWorkspacePage";
import { PendingTransfersQueuePage } from "./pages/government/PendingTransfersQueuePage";
import { BlockchainExplorerPage } from "./pages/government/BlockchainExplorerPage";
import { AuditLogPage } from "./pages/government/AuditLogPage";
import { RoleAdminPage } from "./pages/government/RoleAdminPage";

// Agent Pages
import { AgentDashboardPage } from "./pages/agent/AgentDashboardPage";
import { AgentDiscoveryPage } from "./pages/agent/AgentDiscoveryPage";
import { ClientEnquiriesPage } from "./pages/agent/ClientEnquiriesPage";
import { AgentTransactionTrackerPage } from "./pages/agent/AgentTransactionTrackerPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/search" element={<PublicSearchPage />} />
          <Route path="/public/search" element={<PublicSearchPage />} />
          <Route path="/records/:landId" element={<PublicLandDetailsPage />} />
          <Route path="/public/land/:landId" element={<PublicLandDetailsPage />} />
          <Route path="/verify/:landId" element={<PublicVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Shared Authenticated */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/transactions/:txHash" element={<TransactionDetailsPage />} />

          {/* Seller Routes - Protected */}
          <Route
            path="/seller/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/register-land"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <RegisterLandWizardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/records"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <MyLandRecordsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/applications"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <SellerApplicationsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/transfers/create"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <CreateTransferPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/create-transfer"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <CreateTransferPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/seller/transfers"
            element={
              <RoleProtectedRoute allowedRoles={["seller"]}>
                <SellerTransfersPage />
              </RoleProtectedRoute>
            }
          />

          {/* Buyer Routes - Protected */}
          <Route
            path="/buyer/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/buyer/discovery"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDiscoveryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/buyer/transfers"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <IncomingTransfersPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/buyer/transfers/:transferId"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <BuyerTransferDetailPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/buyer/properties"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <BuyerOwnershipHistoryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/buyer/history"
            element={
              <RoleProtectedRoute allowedRoles={["buyer"]}>
                <BuyerOwnershipHistoryPage />
              </RoleProtectedRoute>
            }
          />

          {/* Government Routes - Protected */}
          <Route
            path="/government/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <GovDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/queue"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <PendingApplicationsQueuePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/applications/:applicationId"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <GovVerificationWorkspacePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/workspace"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <GovVerificationWorkspacePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/transfers"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <PendingTransfersQueuePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/explorer"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <BlockchainExplorerPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/blockchain"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <BlockchainExplorerPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/audit"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <AuditLogPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/government/roles"
            element={
              <RoleProtectedRoute allowedRoles={["government"]}>
                <RoleAdminPage />
              </RoleProtectedRoute>
            }
          />

          {/* Agent Routes - Protected */}
          <Route
            path="/agent/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["agent"]}>
                <AgentDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/agent/listings"
            element={
              <RoleProtectedRoute allowedRoles={["agent"]}>
                <AgentDiscoveryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/agent/enquiries"
            element={
              <RoleProtectedRoute allowedRoles={["agent"]}>
                <ClientEnquiriesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/agent/transactions"
            element={
              <RoleProtectedRoute allowedRoles={["agent"]}>
                <AgentTransactionTrackerPage />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Fallback 404 */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
