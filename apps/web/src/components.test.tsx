import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Badge } from "./components/common/Badge";
import { Button } from "./components/common/Button";
import { Card } from "./components/common/Card";
import { EmptyState } from "./components/common/EmptyState";
import { Input } from "./components/common/Input";
import { Modal } from "./components/common/Modal";
import { Select } from "./components/common/Select";
import { Skeleton } from "./components/common/Skeleton";
import { TransferTimeline } from "./components/common/TransferTimeline";
import { Breadcrumbs } from "./components/common/Breadcrumbs";
import { BrowserRouter } from "react-router-dom";

describe("LandChain Web Common Components Test Suite", () => {
  describe("Badge Component", () => {
    it("renders with various color variants", () => {
      const { rerender } = render(<Badge variant="success">Verified On-Chain</Badge>);
      expect(screen.getByText("Verified On-Chain")).toBeDefined();

      rerender(<Badge variant="danger">Rejected</Badge>);
      expect(screen.getByText("Rejected")).toBeDefined();

      rerender(<Badge variant="warning">Pending Review</Badge>);
      expect(screen.getByText("Pending Review")).toBeDefined();

      rerender(<Badge variant="gold">Academic Protocol</Badge>);
      expect(screen.getByText("Academic Protocol")).toBeDefined();
    });
  });

  describe("Button Component", () => {
    it("renders correctly and handles click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Submit Application</Button>);

      const btn = screen.getByRole("button", { name: /Submit Application/i });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("displays loading state and disables button", () => {
      const handleClick = vi.fn();
      render(<Button isLoading onClick={handleClick}>Processing...</Button>);

      const btn = screen.getByRole("button");
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Card Component", () => {
    it("renders card content, title and actions", () => {
      render(
        <Card title="Parcel Metadata" action={<Button size="sm">Edit</Button>}>
          <p>Area: 2500 Sq. Meters</p>
        </Card>
      );

      expect(screen.getByText("Parcel Metadata")).toBeDefined();
      expect(screen.getByText("Area: 2500 Sq. Meters")).toBeDefined();
      expect(screen.getByRole("button", { name: /Edit/i })).toBeDefined();
    });
  });

  describe("EmptyState Component", () => {
    it("renders title, description and action", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Records Found"
          description="Try adjusting your search filters or parcel number."
          actionText="Clear Filters"
          onAction={handleAction}
        />
      );

      expect(screen.getByText("No Records Found")).toBeDefined();
      expect(screen.getByText(/Try adjusting your search filters/i)).toBeDefined();
      const actionBtn = screen.getByRole("button", { name: /Clear Filters/i });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Input and Select Components", () => {
    it("renders Input with label, error and handles change", () => {
      const handleChange = vi.fn();
      render(
        <Input
          label="Survey Number"
          placeholder="e.g. SY-101/A"
          error="Survey number is required"
          onChange={handleChange}
        />
      );

      expect(screen.getByText("Survey Number")).toBeDefined();
      expect(screen.getByText("Survey number is required")).toBeDefined();

      const inputElem = screen.getByPlaceholderText("e.g. SY-101/A");
      fireEvent.change(inputElem, { target: { value: "SY-999" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("renders Select with options and handles selection", () => {
      const handleChange = vi.fn();
      render(
        <Select
          label="Land Category"
          options={[
            { value: "RESIDENTIAL", label: "Residential" },
            { value: "COMMERCIAL", label: "Commercial" },
          ]}
          onChange={handleChange}
        />
      );

      expect(screen.getByText("Land Category")).toBeDefined();
      const selectElem = screen.getByRole("combobox");
      fireEvent.change(selectElem, { target: { value: "COMMERCIAL" } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Modal Component", () => {
    it("renders when isOpen is true and calls onClose when backdrop/close clicked", () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={false} onClose={handleClose} title="Confirm Transfer">
          <p>Are you sure you want to transfer ownership?</p>
        </Modal>
      );

      expect(screen.queryByText("Confirm Transfer")).toBeNull();

      rerender(
        <Modal isOpen={true} onClose={handleClose} title="Confirm Transfer">
          <p>Are you sure you want to transfer ownership?</p>
        </Modal>
      );

      expect(screen.getByText("Confirm Transfer")).toBeDefined();
      expect(screen.getByText("Are you sure you want to transfer ownership?")).toBeDefined();

      // Close button
      const closeBtn = screen.getByRole("button", { name: /Close modal/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("Skeleton Loading Component", () => {
    it("renders skeleton placeholder", () => {
      const { container } = render(<Skeleton className="h-6 w-32" />);
      expect(container.querySelector(".animate-pulse")).toBeDefined();
    });
  });

  describe("Breadcrumbs Component", () => {
    it("renders breadcrumb navigation items", () => {
      render(
        <BrowserRouter>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Explorer", href: "/records" },
              { label: "LAND-KA-001" },
            ]}
          />
        </BrowserRouter>
      );

      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getByText("Explorer")).toBeDefined();
      expect(screen.getByText("LAND-KA-001")).toBeDefined();
    });
  });

  describe("TransferTimeline Component Full State Matrix", () => {
    it("renders PENDING_BUYER state", () => {
      render(<TransferTimeline status="PENDING_BUYER" />);
      expect(screen.getByText("TRANSFER CREATED")).toBeDefined();
      expect(screen.getByText("BUYER CONSENT")).toBeDefined();
      expect(screen.getByText("CURRENT STEP")).toBeDefined();
    });

    it("renders ACCEPTED_BY_BUYER / PENDING_GOVERNMENT state", () => {
      render(<TransferTimeline status="PENDING_GOVERNMENT" />);
      expect(screen.getByText("GOVERNMENT REVIEW")).toBeDefined();
      expect(screen.getByText("ACTIVE / AWAITING")).toBeDefined();
    });

    it("renders TRANSFERRED_ON_CHAIN state", () => {
      render(<TransferTimeline status="TRANSFERRED_ON_CHAIN" />);
      expect(screen.getByText("BLOCKCHAIN TRANSFER")).toBeDefined();
      expect(screen.getByText("CONFIRMED ON-CHAIN")).toBeDefined();
      expect(screen.getByText("TITLE UPDATED")).toBeDefined();
    });

    it("renders CANCELLED state", () => {
      render(<TransferTimeline status="CANCELLED" />);
      expect(screen.getByText("NOT REQUIRED")).toBeDefined();
      expect(screen.getByText("NOT EXECUTED")).toBeDefined();
      expect(screen.getByText("CLOSED")).toBeDefined();
    });
  });
});
