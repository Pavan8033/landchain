import { expect } from "chai";
import { ethers } from "hardhat";
import { LandRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LandRegistry Smart Contract Tests", function () {
  let landRegistry: LandRegistry;
  let admin: SignerWithAddress;
  let govVerifier: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;
  let newVerifier: SignerWithAddress;

  const sampleLandId = "LAND-TEST-001";
  const sampleParcel = "PLOT-99/A";
  const sampleLocality = "Koramangala, Bengaluru";
  const sampleArea = 1500;
  const sampleDocHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

  beforeEach(async function () {
    [admin, govVerifier, seller, buyer, unauthorizedUser, newVerifier] = await ethers.getSigners();

    const LandRegistryFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistryFactory.deploy(govVerifier.address);
    await landRegistry.waitForDeployment();
  });

  describe("Deployment and Configuration", function () {
    it("Should initialize the admin and government verifier correctly", async function () {
      expect(await landRegistry.admin()).to.equal(admin.address);
      expect(await landRegistry.governmentVerifier()).to.equal(govVerifier.address);
    });

    it("Should reject deployment with zero address for verifier", async function () {
      const Factory = await ethers.getContractFactory("LandRegistry");
      await expect(Factory.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        landRegistry,
        "InvalidAddress"
      );
    });

    it("Should allow admin to update the government verifier", async function () {
      await expect(landRegistry.connect(admin).setGovernmentVerifier(newVerifier.address))
        .to.emit(landRegistry, "GovernmentVerifierUpdated")
        .withArgs(govVerifier.address, newVerifier.address);

      expect(await landRegistry.governmentVerifier()).to.equal(newVerifier.address);
    });

    it("Should reject non-admin updating government verifier", async function () {
      await expect(
        landRegistry.connect(unauthorizedUser).setGovernmentVerifier(newVerifier.address)
      ).to.be.revertedWithCustomError(landRegistry, "UnauthorizedCaller");
    });
  });

  describe("Land Registration", function () {
    it("Should allow the authorized government verifier to register land", async function () {
      await expect(
        landRegistry.connect(govVerifier).registerLand(
          sampleLandId,
          sampleParcel,
          seller.address,
          sampleLocality,
          sampleArea,
          sampleDocHash
        )
      )
        .to.emit(landRegistry, "LandRegistered")
        .withArgs(
          sampleLandId,
          sampleLandId,
          sampleParcel,
          seller.address,
          govVerifier.address,
          (val: any) => typeof val === "bigint" || typeof val === "number",
          sampleDocHash
        );

      expect(await landRegistry.landExists(sampleLandId)).to.be.true;

      const record = await landRegistry.getLand(sampleLandId);
      expect(record.id).to.equal(sampleLandId);
      expect(record.parcelNumber).to.equal(sampleParcel);
      expect(record.currentOwner).to.equal(seller.address);
      expect(record.isVerified).to.be.true;
      expect(record.locality).to.equal(sampleLocality);
      expect(record.areaSqMeters).to.equal(sampleArea);
      expect(record.docHash).to.equal(sampleDocHash);
      expect(record.transferCount).to.equal(0);
    });

    it("Should reject duplicate land registration with LandAlreadyRegistered", async function () {
      await landRegistry.connect(govVerifier).registerLand(
        sampleLandId,
        sampleParcel,
        seller.address,
        sampleLocality,
        sampleArea,
        sampleDocHash
      );

      await expect(
        landRegistry.connect(govVerifier).registerLand(
          sampleLandId,
          "DIFF-PARCEL",
          buyer.address,
          "Delhi",
          2000,
          sampleDocHash
        )
      ).to.be.revertedWithCustomError(landRegistry, "LandAlreadyRegistered");
    });

    it("Should reject registration by unauthorized non-verifier address", async function () {
      await expect(
        landRegistry.connect(seller).registerLand(
          sampleLandId,
          sampleParcel,
          seller.address,
          sampleLocality,
          sampleArea,
          sampleDocHash
        )
      ).to.be.revertedWithCustomError(landRegistry, "UnauthorizedCaller");
    });

    it("Should reject registration with invalid zero address owner", async function () {
      await expect(
        landRegistry.connect(govVerifier).registerLand(
          sampleLandId,
          sampleParcel,
          ethers.ZeroAddress,
          sampleLocality,
          sampleArea,
          sampleDocHash
        )
      ).to.be.revertedWithCustomError(landRegistry, "InvalidAddress");
    });

    it("Should reject registration with empty strings", async function () {
      await expect(
        landRegistry.connect(govVerifier).registerLand(
          "",
          sampleParcel,
          seller.address,
          sampleLocality,
          sampleArea,
          sampleDocHash
        )
      ).to.be.revertedWithCustomError(landRegistry, "StringEmpty");
    });
  });

  describe("Land Ownership Transfer Lifecycle", function () {
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

    it("Should allow the current recorded owner to initiate a transfer", async function () {
      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address)
      )
        .to.emit(landRegistry, "TransferInitiated")
        .withArgs(
          sampleLandId,
          sampleLandId,
          seller.address,
          buyer.address,
          (val: any) => typeof val === "bigint" || typeof val === "number"
        );

      const request = await landRegistry.getTransferRequest(sampleLandId);
      expect(request.seller).to.equal(seller.address);
      expect(request.proposedBuyer).to.equal(buyer.address);
      expect(request.status).to.equal(1); // TransferStatus.PENDING_BUYER
    });

    it("Should reject initiation by a non-owner", async function () {
      await expect(
        landRegistry.connect(unauthorizedUser).initiateTransfer(sampleLandId, buyer.address)
      ).to.be.revertedWithCustomError(landRegistry, "NotCurrentOwner");
    });

    it("Should reject initiation for nonexistent land", async function () {
      await expect(
        landRegistry.connect(seller).initiateTransfer("NONEXISTENT", buyer.address)
      ).to.be.revertedWithCustomError(landRegistry, "LandNotFound");
    });

    it("Should reject initiation with zero address buyer", async function () {
      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(landRegistry, "InvalidBuyerAddress");
    });

    it("Should reject buyer being the current owner", async function () {
      await expect(
        landRegistry.connect(seller).initiateTransfer(sampleLandId, seller.address)
      ).to.be.revertedWithCustomError(landRegistry, "BuyerCannotBeCurrentOwner");
    });

    it("Should allow the designated buyer to accept transfer request", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);

      await expect(landRegistry.connect(buyer).acceptTransfer(sampleLandId))
        .to.emit(landRegistry, "TransferAccepted")
        .withArgs(
          sampleLandId,
          sampleLandId,
          buyer.address,
          (val: any) => typeof val === "bigint" || typeof val === "number"
        );

      const request = await landRegistry.getTransferRequest(sampleLandId);
      expect(request.status).to.equal(2); // TransferStatus.ACCEPTED_BY_BUYER
    });

    it("Should reject someone other than designated buyer accepting transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);

      await expect(
        landRegistry.connect(unauthorizedUser).acceptTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "UnauthorizedCaller");
    });

    it("Should allow designated buyer to reject transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);

      await expect(landRegistry.connect(buyer).rejectTransfer(sampleLandId))
        .to.emit(landRegistry, "TransferRejected")
        .withArgs(
          sampleLandId,
          sampleLandId,
          buyer.address,
          (val: any) => typeof val === "bigint" || typeof val === "number"
        );

      const request = await landRegistry.getTransferRequest(sampleLandId);
      expect(request.status).to.equal(3); // TransferStatus.REJECTED_BY_BUYER
    });

    it("Should allow seller to cancel a pending transfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);

      await expect(landRegistry.connect(seller).cancelTransfer(sampleLandId))
        .to.emit(landRegistry, "TransferCancelled")
        .withArgs(
          sampleLandId,
          sampleLandId,
          seller.address,
          (val: any) => typeof val === "bigint" || typeof val === "number"
        );

      const request = await landRegistry.getTransferRequest(sampleLandId);
      expect(request.status).to.equal(5); // TransferStatus.CANCELLED
    });

    it("Should allow government verifier to authorize transfer only after buyer accepts", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);

      // Verifier attempts to authorize BEFORE buyer accepted -> Reverted!
      await expect(
        landRegistry.connect(govVerifier).authorizeTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "TransferNotAcceptedByBuyer");

      // Buyer accepts
      await landRegistry.connect(buyer).acceptTransfer(sampleLandId);

      // Verifier authorizes
      await expect(landRegistry.connect(govVerifier).authorizeTransfer(sampleLandId))
        .to.emit(landRegistry, "OwnershipTransferred")
        .withArgs(
          sampleLandId,
          sampleLandId,
          seller.address,
          buyer.address,
          govVerifier.address,
          (val: any) => typeof val === "bigint" || typeof val === "number"
        );

      // Verify on-chain state update
      const updatedLand = await landRegistry.getLand(sampleLandId);
      expect(updatedLand.currentOwner).to.equal(buyer.address);
      expect(updatedLand.transferCount).to.equal(1);

      const request = await landRegistry.getTransferRequest(sampleLandId);
      expect(request.status).to.equal(4); // TransferStatus.COMPLETED
    });

    it("Should reject non-verifier executing authorizeTransfer", async function () {
      await landRegistry.connect(seller).initiateTransfer(sampleLandId, buyer.address);
      await landRegistry.connect(buyer).acceptTransfer(sampleLandId);

      await expect(
        landRegistry.connect(seller).authorizeTransfer(sampleLandId)
      ).to.be.revertedWithCustomError(landRegistry, "UnauthorizedCaller");
    });
  });

  describe("Public Query and Total Count", function () {
    it("Should return correct total count and land ID by index", async function () {
      expect(await landRegistry.getTotalLandsCount()).to.equal(0);

      await landRegistry.connect(govVerifier).registerLand(
        "LAND-001",
        "P-1",
        seller.address,
        "City A",
        1000,
        sampleDocHash
      );
      await landRegistry.connect(govVerifier).registerLand(
        "LAND-002",
        "P-2",
        buyer.address,
        "City B",
        2000,
        sampleDocHash
      );

      expect(await landRegistry.getTotalLandsCount()).to.equal(2);
      expect(await landRegistry.getLandIdByIndex(0)).to.equal("LAND-001");
      expect(await landRegistry.getLandIdByIndex(1)).to.equal("LAND-002");
    });
  });
});
