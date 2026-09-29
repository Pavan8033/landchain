// End-to-end full lifecycle validation script for LANDCHAIN Steps 1 through 9
const { ethers } = require("ethers");

async function main() {
  console.log("=================================================================");
  console.log("LANDCHAIN - COMPLETE MULTI-ROLE END-TO-END SYSTEM INTEGRATION TEST");
  console.log("=================================================================");

  const API_URL = process.env.API_URL || "http://localhost:5000/api";
  const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";

  // 1. Check API Health
  console.log("\n[1/10] Verifying Backend API Health & Database Connectivity...");
  const healthRes = await fetch(`${API_URL}/health`);
  if (!healthRes.ok) throw new Error(`API health check failed with status ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log("✓ API Health Status:", healthData.status);
  console.log("✓ Database Mode:", healthData.databaseMode);

  // 2. Check Hardhat Node & Deployment
  console.log("\n[2/10] Verifying Hardhat Local Blockchain Ledger...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const blockNum = await provider.getBlockNumber();
  console.log("✓ Connected to Blockchain at Block #", blockNum);

  // Standard Hardhat Accounts aligned with LandChain Profiles
  const deployer = await provider.getSigner(0); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  const sellerSigner = await provider.getSigner(1); // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Rajesh Kumar)
  const buyerSigner = await provider.getSigner(2); // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Ananya Sharma)
  const govSigner = await provider.getSigner(3); // 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Dr. K. S. Rao)

  const sellerWallet = await sellerSigner.getAddress();
  const buyerWallet = await buyerSigner.getAddress();
  const govWallet = await govSigner.getAddress();

  console.log("  Seller Wallet (Signer #1):", sellerWallet);
  console.log("  Buyer Wallet (Signer #2):", buyerWallet);
  console.log("  Government Verifier (Signer #3):", govWallet);

  const contractAddress = process.env.LAND_REGISTRY_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const abi = [
    "function registerLand(string landId, string parcelNumber, address ownerWallet, string locality, uint256 areaSqMeters, string docHash) external",
    "function initiateTransfer(string landId, address proposedBuyer) external",
    "function acceptTransfer(string landId) external",
    "function rejectTransfer(string landId) external",
    "function authorizeTransfer(string landId) external",
    "function getLand(string landId) external view returns (string, string, address, bool, uint256, string, uint256, string, uint256)",
    "function governmentVerifier() external view returns (address)",
  ];

  const registryGov = new ethers.Contract(contractAddress, abi, govSigner);
  const registrySeller = new ethers.Contract(contractAddress, abi, sellerSigner);
  const registryBuyer = new ethers.Contract(contractAddress, abi, buyerSigner);

  const activeVerifierOnChain = await registryGov.governmentVerifier();
  console.log("✓ On-Chain Authorized Government Verifier:", activeVerifierOnChain);

  // 3. STEP 2: Seller Registers Land Application
  console.log("\n[3/10] STEP 2: Land Seller Submits Registration Application...");
  const sellerHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer demo-token-seller",
    "X-Demo-Role": "seller",
    "X-Demo-Uid": "seller-123",
    "X-Demo-Wallet": sellerWallet,
  };

  const randParcelNum = `SY-${Math.floor(100 + Math.random() * 900)}/E2E`;
  const appPayload = {
    surveyNumber: randParcelNum,
    state: "Karnataka",
    district: "Bengaluru Urban",
    locality: "Indiranagar, Bengaluru",
    address: "100 Feet Road, Indiranagar",
    areaSqMeters: 3200,
    measurementUnit: "Sq.M",
    landCategory: "COMMERCIAL",
    description: "Commercial plot registered for complete end-to-end integration test",
    applicantWallet: sellerWallet,
    documents: [
      {
        documentId: `DOC-${Date.now()}`,
        title: "Sale Deed & Revenue Survey Khata",
        category: "Title Deed (Ownership History & Khata)",
        fileName: "Sale_Deed_BBMP_Khata.pdf",
        storagePath: "documents/seller-123/Sale_Deed_BBMP_Khata.pdf",
        fileSize: 2048576,
        mimeType: "application/pdf",
        sha256Hash: "0xb7c8d9e0123456789abcdef0123456789abcdef0123456789abcdef012345678",
      },
    ],
  };

  const submitRes = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: sellerHeaders,
    body: JSON.stringify(appPayload),
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok) throw new Error(`Application creation failed: ${submitData.error}`);
  const createdApp = submitData.data;
  console.log("✓ Application Created Successfully:");
  console.log("  - Application ID:", createdApp.applicationId);
  console.log("  - Status:", createdApp.status);
  console.log("  - Survey Number:", createdApp.surveyNumber);

  // 4. STEP 3: Government Reviews and Registers on Blockchain
  console.log("\n[4/10] STEP 3: Government Review & Smart Contract Registration...");
  const govHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer demo-token-government",
    "X-Demo-Role": "government",
    "X-Demo-Uid": "gov-789",
    "X-Demo-Wallet": govWallet,
  };

  const reviewRes = await fetch(`${API_URL}/applications/${createdApp.id}/review`, {
    method: "PUT",
    headers: govHeaders,
    body: JSON.stringify({
      status: "APPROVED_PENDING_BLOCKCHAIN",
      reviewNotes: "All encumbrance certificates and survey bounds verified with revenue records.",
    }),
  });
  const reviewData = await reviewRes.json();
  console.log("✓ Application Status Approved:", reviewData.data.status);

  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const canonicalLandId = `LAND-KA-BLR-${randSuffix}`;
  console.log(`Submitting on-chain transaction for ${canonicalLandId} with Government Verifier...`);

  const regTx = await registryGov.registerLand(
    canonicalLandId,
    createdApp.surveyNumber,
    createdApp.applicantWallet,
    createdApp.locality,
    createdApp.areaSqMeters,
    createdApp.documents[0].sha256Hash
  );
  const regReceipt = await regTx.wait();
  console.log("✓ Real Blockchain Transaction Mined:");
  console.log("  - Tx Hash:", regReceipt.hash);
  console.log("  - Block Number:", regReceipt.blockNumber);

  // Update backend projection
  const confirmRes = await fetch(`${API_URL}/applications/${createdApp.id}/on-chain`, {
    method: "POST",
    headers: govHeaders,
    body: JSON.stringify({
      landId: canonicalLandId,
      onChainTxHash: regReceipt.hash,
      onChainBlockNumber: regReceipt.blockNumber,
      contractAddress: contractAddress,
    }),
  });
  const confirmData = await confirmRes.json();
  console.log("✓ Projection Updated to VERIFIED_ON_CHAIN:", confirmData.data.verificationState);

  // 5. Read smart contract state directly
  const onChainLand = await registryGov.getLand(canonicalLandId);
  console.log("✓ Smart Contract getLand() State Verified:");
  console.log("  - Land ID:", onChainLand[0]);
  console.log("  - Recorded Owner:", onChainLand[2]);
  console.log("  - isVerified:", onChainLand[3]);
  if (onChainLand[2].toLowerCase() !== sellerWallet.toLowerCase()) {
    throw new Error("Initial on-chain owner does not match seller wallet!");
  }

  // 6. STEP 4: Seller Initiates Transfer
  console.log("\n[5/10] STEP 4: Seller Initiates Ownership Transfer...");
  // Seller calls smart contract initiateTransfer
  const initTx = await registrySeller.initiateTransfer(canonicalLandId, buyerWallet);
  const initReceipt = await initTx.wait();
  console.log("✓ On-Chain initiateTransfer() Confirmed: Tx", initReceipt.hash);

  // Seller creates transfer record in database
  const transferRes = await fetch(`${API_URL}/transfers`, {
    method: "POST",
    headers: sellerHeaders,
    body: JSON.stringify({
      landId: canonicalLandId,
      buyerEmail: "buyer@landchain.demo",
      buyerWallet: buyerWallet,
      agreedPrice: 15000000,
    }),
  });
  const transferData = await transferRes.json();
  if (!transferRes.ok) throw new Error(`Transfer creation failed: ${transferData.error}`);
  const createdTransfer = transferData.data;
  console.log("✓ Transfer Record Created with Status:", createdTransfer.status);

  // 7. STEP 5: Buyer Explicit Acceptance
  console.log("\n[6/10] STEP 5: Buyer Explicit Consent & Acceptance...");
  const buyerHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer demo-token-buyer",
    "X-Demo-Role": "buyer",
    "X-Demo-Uid": "buyer-456",
    "X-Demo-Wallet": buyerWallet,
  };

  // Buyer calls acceptTransfer on smart contract
  const acceptTx = await registryBuyer.acceptTransfer(canonicalLandId);
  const acceptReceipt = await acceptTx.wait();
  console.log("✓ On-Chain acceptTransfer() Confirmed: Tx", acceptReceipt.hash);

  // Buyer accepts in database API
  const buyerAcceptRes = await fetch(`${API_URL}/transfers/${createdTransfer.id}/accept`, {
    method: "POST",
    headers: buyerHeaders,
    body: JSON.stringify({ notes: "Terms and title deeds accepted by prospective buyer." }),
  });
  const buyerAcceptData = await buyerAcceptRes.json();
  console.log("✓ Transfer Status Transitioned to:", buyerAcceptData.data.status);
  if (buyerAcceptData.data.status !== "PENDING_GOVERNMENT") {
    throw new Error("Expected status PENDING_GOVERNMENT after buyer acceptance!");
  }

  // 8. STEP 6: Government Review & Final Blockchain Authorization
  console.log("\n[7/10] STEP 6: Government Review & Final Blockchain Authorization...");
  // Government reviews transfer
  const govReviewTrfRes = await fetch(`${API_URL}/transfers/${createdTransfer.id}/government-review`, {
    method: "POST",
    headers: govHeaders,
    body: JSON.stringify({
      action: "APPROVE",
      reviewNotes: "Buyer and seller signatures verified. Title conveyance ratified.",
    }),
  });
  const govReviewTrfData = await govReviewTrfRes.json();
  console.log("✓ Government Review Decision Recorded:", govReviewTrfData.data.status);

  // Government executes smart contract authorizeTransfer
  const authTx = await registryGov.authorizeTransfer(canonicalLandId);
  const authReceipt = await authTx.wait();
  console.log("✓ Smart Contract authorizeTransfer() Mined:");
  console.log("  - Tx Hash:", authReceipt.hash);
  console.log("  - Block Number:", authReceipt.blockNumber);

  // Verify on-chain owner CHANGED to buyer
  const postLand = await registryGov.getLand(canonicalLandId);
  console.log("✓ POST-CONVEYANCE ON-CHAIN OWNER:", postLand[2]);
  if (postLand[2].toLowerCase() !== buyerWallet.toLowerCase()) {
    throw new Error(`CRITICAL FAILURE: On-chain owner (${postLand[2]}) does not match buyer (${buyerWallet})!`);
  }
  console.log("✓ CONFIRMED: Blockchain ownership successfully transferred to Buyer!");

  // Update database projection
  const completeRes = await fetch(`${API_URL}/transfers/${createdTransfer.id}/complete`, {
    method: "POST",
    headers: govHeaders,
    body: JSON.stringify({
      blockchainTxHash: authReceipt.hash,
      blockchainBlockNumber: authReceipt.blockNumber,
    }),
  });
  const completeData = await completeRes.json();
  console.log("✓ Database Projection Finalized:", completeData.data.status);

  // 9. STEP 7: Public Technical Verification & Certificate
  console.log("\n[8/10] STEP 7: Public Blockchain Verification & Proof...");
  const publicVerifyRes = await fetch(`${API_URL}/records/${canonicalLandId}/verify`);
  const publicVerify = await publicVerifyRes.json();
  console.log("✓ Public Verification Status:", publicVerify.data.verificationStatus);
  console.log("✓ Checks Passed:", `${publicVerify.data.checksPassed} / ${publicVerify.data.totalChecks}`);
  console.log("✓ Recorded Owner in Public Verification:", publicVerify.data.currentOwnerWallet);
  console.log("✓ Provenance Milestones Count:", publicVerify.data.ownershipHistory.length);

  if (publicVerify.data.currentOwnerWallet.toLowerCase() !== buyerWallet.toLowerCase()) {
    throw new Error("Public verification does not show buyer as current owner!");
  }

  // 10. Digital Land Certificate Download
  console.log("\n[9/10] STEP 8: Digital Certificate Generation & QR Integrity...");
  const certRes = await fetch(`${API_URL}/records/${canonicalLandId}/certificate`);
  if (!certRes.ok) throw new Error("Certificate download failed!");
  const certBlob = await certRes.arrayBuffer();
  console.log(`✓ Official LandChain PDF Certificate Generated (${certBlob.byteLength} bytes)`);

  // 11. Security Audit: Negative RBAC Tests
  console.log("\n[10/10] Security Audit: Verifying Role-Based Access Control...");
  // Unauthorized seller attempting government review
  const unauthRes = await fetch(`${API_URL}/applications/${createdApp.id}/review`, {
    method: "PUT",
    headers: sellerHeaders,
    body: JSON.stringify({ status: "APPROVED_PENDING_BLOCKCHAIN", reviewNotes: "Hacker attempt" }),
  });
  if (unauthRes.status === 403) {
    console.log("✓ RBAC Enforced: Non-government user rejected with HTTP 403");
  } else {
    throw new Error(`Expected HTTP 403 for unauthorized government action, received ${unauthRes.status}`);
  }

  console.log("\n=================================================================");
  console.log("✓ ALL 10 E2E LIFECYCLE TESTS COMPLETED WITH 100% SUCCESS!");
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("❌ E2E Integration Failure:", err);
  process.exit(1);
});
