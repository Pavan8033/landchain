import { expect } from "chai";
import { ethers } from "hardhat";
import { LandRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LandRegistry Smart Contract - Comprehensive Edge Cases & Performance", function () {
  let landRegistry: LandRegistry;
  let admin: SignerWithAddress;
  let govVerifier: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;
  let buyer3: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;

  const sampleLandId = "LAND-EDGE-001";
  const sampleParcel = "PLOT-EDGE-101";
  const sampleLocality = "Indiranagar, Bengaluru";
  const sampleArea = 2500;
  const sampleDocHash = "0x" + "a".repeat(64);

  beforeEach(async function () {
    [admin, govVerifier, seller, buyer1, buyer2, buyer3, unauthorizedUser] = await ethers.getSigners();

    const LandRegistryFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistryFactory.deploy(govVerifier.address);
    await landRegistry.waitForDeployment();
  });

  describe("Edge Case 1: Multi-Hop Ownership Transfer Chain (Seller -> Buyer1 -> Buyer2 -> Buyer3)", function () {
    it("Should successfully execute sequential transfers across 3 different owners", async function () {
      // 1. Initial registration by Verifier for Seller
      await landRegistry.connect(govVerifier).registerLand(
        sampleLandId,
        sampleParcel,
        seller.address,
        sampleLocality,
        sampleArea,
        sampleDocHash
      );

      let record = await landRegistry.getLand(sampleLandId);
      expect(record.currentOwner).to.equal(seller.address);
      expect(record.transferCount).to.equal(0);

      // Hop 1: Seller -> Buyer1
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(buyer1).acceptTransfer(sampleLandId);
      await landRegistry.connect(govVerifier).authorizeTransfer(sampleLandId);

      record = await landRegistry.getLand(sampleLandId);
      expect(record.currentOwner).to.equal(buyer1.address);
      expect(record.transferCount).to.equal(1);

      // Verify old seller cannot initiate transfer anymore
      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer2.address)
      ).to.be.revertedWithCustomError(landRegistry, "NotCurrentOwner");

      // Hop 2: Buyer1 -> Buyer2
      await landRegistry.connect(buyer1).initiateTransfer(sampleLandId, buyer2.address);
      await landRegistry.connect(buyer2).acceptTransfer(sampleLandId);
      await landRegistry.connect(govVerifier).authorizeTransfer(sampleLandId);

      record = await landRegistry.getLand(sampleLandId);
      expect(record.currentOwner).to.equal(buyer2.address);
      expect(record.transferCount).to.equal(2);

      // Hop 3: Buyer2 -> Buyer3
      await landRegistry.connect(buyer2).initiateTransfer(sampleLandId, buyer3.address);
      await landRegistry.connect(buyer3).acceptTransfer(sampleLandId);
      await landRegistry.connect(govVerifier).authorizeTransfer(sampleLandId);

      record = await landRegistry.getLand(sampleLandId);
      expect(record.currentOwner).to.equal(buyer3.address);
      expect(record.transferCount).to.equal(3);
    });
  });

  describe("Edge Case 2: Illegal State Transitions & Concurrency Protections", function () {
    beforeEach(async function () {
      await landRegistry.connect(govVerifier).registerLand(
        sampleLandId,
        sampleParcel,
        seller.address,
        sampleLocality,
        sampleArea,
        sampleDocHash
      );
    });

    it("Should reject buyer accepting a cancelled transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(seller).cancelTransfer(sampleLandId);

      await expect(
        landRegistry.connect(buyer1).acceptTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "TransferNotPendingBuyer");
    });

    it("Should reject buyer rejecting an already accepted transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(buyer1).acceptTransfer(sampleLandId);

      await expect(
        landRegistry.connect(buyer1).rejectTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "TransferNotPendingBuyer");
    });

    it("Should reject seller cancelling an already accepted transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(buyer1).acceptTransfer(sampleLandId);

      await expect(
        landRegistry.connect(seller).cancelTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "TransferNotPendingBuyer");
    });

    it("Should allow seller to initiate a new transfer after a previous one was rejected", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(buyer1).rejectTransfer(sampleLandId);

      // Now seller can initiate transfer to buyer2
      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer2.address)
      ).to.emit(landRegistry, "TransferInitiated");

      const req = await landRegistry.getTransferRequest(sampleLandId);
      expect(req.proposedBuyer).to.equal(buyer2.address);
      expect(req.status).to.equal(1); // PENDING_BUYER
    });

    it("Should allow seller to initiate a new transfer after a previous one was cancelled", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer1.address);
      await landRegistry.connect(seller).cancelTransfer(sampleLandId);

      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer2.address)
      ).to.emit(landRegistry, "TransferInitiated");
    });
  });

  describe("Edge Case 3: Contract Bounds, Nonexistent Queries & Input Validation", function () {
    it("Should revert getLand for nonexistent land", async function () {
      await expect(
        landRegistry.getLand("DOES-NOT-EXIST")
      ).to.be.revertedWithCustomError(landRegistry, "LandNotFound");
    });

    it("Should revert getTransferRequest for nonexistent land", async function () {
      await expect(
        landRegistry.getTransferRequest("DOES-NOT-EXIST")
      ).to.be.revertedWithCustomError(landRegistry, "LandNotFound");
    });

    it("Should revert getLandIdByIndex when index is out of bounds", async function () {
      await expect(
        landRegistry.getLandIdByIndex(0)
      ).to.be.revertedWith("Index out of bounds");

      await landRegistry.connect(govVerifier).registerLand(
        sampleLandId,
        sampleParcel,
        seller.address,
        sampleLocality,
        sampleArea,
        sampleDocHash
      );

      // Index 0 valid
      expect(await landRegistry.getLandIdByIndex(0)).to.equal(sampleLandId);

      // Index 1 out of bounds
      await expect(
        landRegistry.getLandIdByIndex(1)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("Should reject registration with empty parcel number", async function () {
      await expect(
        landRegistry.connect(govVerifier).registerLand(
          "LAND-FAIL-1",
          "",
          seller.address,
          sampleLocality,
          sampleArea,
          sampleDocHash
        )
      ).to.be.revertedWithCustomError(landRegistry, "StringEmpty");
    });

    it("Should correctly return landExists as false for unregistered land", async function () {
      expect(await landRegistry.landExists("UNREGISTERED-123")).to.be.false;
    });
  });

  describe("Performance & Stress Test: High-Volume Registrations & Transfers", function () {
    it("Should handle registering 25 land parcels in batch and verify count and indexing", async function () {
      const count = 25;
      for (let i = 0; i < count; i++) {
        const landId = `LAND-STRESS-${i.toString().padStart(3, "0")}`;
        const parcel = `PLOT-STRESS-${i}`;
        const tx = await landRegistry.connect(govVerifier).registerLand(
          landId,
          parcel,
          seller.address,
          "Stress Locality",
          1000 + i * 10,
          sampleDocHash
        );
        const receipt = await tx.wait();
        expect(receipt?.status).to.equal(1);
      }

      expect(await landRegistry.getTotalLandsCount()).to.equal(count);

      // Verify first, middle and last index
      expect(await landRegistry.getLandIdByIndex(0)).to.equal("LAND-STRESS-000");
      expect(await landRegistry.getLandIdByIndex(12)).to.equal("LAND-STRESS-012");
      expect(await landRegistry.getLandIdByIndex(24)).to.equal("LAND-STRESS-024");
    });

    it("Gas Benchmark: Registration and Full Transfer Lifecycle Gas Consumption", async function () {
      // 1. Measure Gas for Registration
      const regTx = await landRegistry.connect(govVerifier).registerLand(
        "LAND-GAS-BENCH",
        "PLOT-GAS-01",
        seller.address,
        sampleLocality,
        sampleArea,
        sampleDocHash
      );
      const regReceipt = await regTx.wait();
      const regGas = regReceipt?.gasUsed ?? 0n;
      console.log(`      ⛽ Gas Used for registerLand: ${regGas.toString()}`);
      expect(Number(regGas)).to.be.lessThan(400000); // Gas limit constraint for cold SSTORE + multi-string struct

      // 2. Measure Gas for initiateTransfer
      const initTx = await landRegistry.connect(seller).initiateTransfer("LAND-GAS-BENCH", buyer1.address);
      const initReceipt = await initTx.wait();
      const initGas = initReceipt?.gasUsed ?? 0n;
      console.log(`      ⛽ Gas Used for initiateTransfer: ${initGas.toString()}`);
      expect(Number(initGas)).to.be.lessThan(150000);

      // 3. Measure Gas for acceptTransfer
      const acceptTx = await landRegistry.connect(buyer1).acceptTransfer("LAND-GAS-BENCH");
      const acceptReceipt = await acceptTx.wait();
      const acceptGas = acceptReceipt?.gasUsed ?? 0n;
      console.log(`      ⛽ Gas Used for acceptTransfer: ${acceptGas.toString()}`);
      expect(Number(acceptGas)).to.be.lessThan(60000);

      // 4. Measure Gas for authorizeTransfer
      const authTx = await landRegistry.connect(govVerifier).authorizeTransfer("LAND-GAS-BENCH");
      const authReceipt = await authTx.wait();
      const authGas = authReceipt?.gasUsed ?? 0n;
      console.log(`      ⛽ Gas Used for authorizeTransfer: ${authGas.toString()}`);
      expect(Number(authGas)).to.be.lessThan(100000);
    });
  });
});
