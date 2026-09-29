# LandRegistry Smart Contract Specification

**Contract:** `LandRegistry.sol`  
**Language:** Solidity 0.8.24  
**Optimizer:** Enabled (200 runs)  
**Standard:** Custom State Machine with Multi-Party Consent  

---

## 1. State Structs

### `LandRecord`
```solidity
struct LandRecord {
    string landId;          // e.g. "LAND-KA-BLR-001"
    string parcelNumber;    // e.g. "SY-104/2B"
    address currentOwner;   // Recorded owner wallet
    bool isVerified;        // Verification flag
    uint256 registeredAt;   // Block timestamp
    string locality;        // Locality / Village
    uint256 areaSqMeters;   // Area in Sq.M
    string docHash;         // SHA-256 integrity hash
    uint256 transferCount;  // Cumulative transfers
}
```

### `TransferRequest`
```solidity
struct TransferRequest {
    string landId;
    address seller;
    address proposedBuyer;
    TransferStatus status;  // NONE, PENDING_BUYER, ACCEPTED_BY_BUYER, REJECTED_BY_BUYER, COMPLETED, CANCELLED
    uint256 createdAt;
    uint256 completedAt;
}
```

---

## 2. Core Functions

### `registerLand`
```solidity
function registerLand(
    string calldata landId,
    string calldata parcelNumber,
    address ownerWallet,
    string calldata locality,
    uint256 areaSqMeters,
    string calldata docHash
) external onlyGovernmentVerifier;
```
Registers a verified parcel onto the blockchain. Can only be invoked by the authorized government registrar. Emits `LandRegistered`.

### `initiateTransfer`
```solidity
function initiateTransfer(
    string calldata landId,
    address proposedBuyer
) external;
```
Initiates conveyance request. Can only be invoked by `land.currentOwner`. Emits `TransferInitiated`.

### `acceptTransfer`
```solidity
function acceptTransfer(string calldata landId) external;
```
Buyer explicitly accepts transfer offer. Restricted to `proposedBuyer`. Sets status to `ACCEPTED_BY_BUYER` and emits `TransferAccepted`.

### `rejectTransfer`
```solidity
function rejectTransfer(string calldata landId) external;
```
Buyer explicitly rejects offer. Restricted to `proposedBuyer`. Sets status to `REJECTED_BY_BUYER` and emits `TransferRejected`.

### `authorizeTransfer`
```solidity
function authorizeTransfer(string calldata landId) external onlyGovernmentVerifier;
```
Government registrar authorizes and finalizes transfer. Requires `status == ACCEPTED_BY_BUYER`. Reassigns `land.currentOwner = proposedBuyer`, increments `land.transferCount`, and emits `OwnershipTransferred`.

### `getLand`
```solidity
function getLand(string calldata landId) external view returns (...);
```
Public read function returning all on-chain record attributes.
