# LANDCHAIN — Ganache, Remix IDE & IPFS Integration Guide

This guide walks you through deploying and interacting with the **LandChain** smart contracts using **Ganache**, **Remix IDE**, **Hardhat**, **MetaMask**, and **IPFS**, aligning with the system architecture diagram.

---

## 1. Ganache Local Blockchain Setup

You can use either **Ganache CLI** or **Ganache GUI** as your local Ethereum development blockchain.

### Option A: Ganache GUI
1. Download and launch **Ganache** from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/).
2. Select **Quickstart (Ethereum)**.
3. In **Settings -> Server**:
   - **Hostname:** `127.0.0.1`
   - **Port:** `7545` (or `8545`)
   - **Network ID:** `5777` (or `1337`)
4. Save and restart Ganache.

### Option B: Hardhat Built-in Local Node (Pre-configured)
From the project root:
```bash
npm run blockchain:node
```
Runs at `http://127.0.0.1:8545` with **Chain ID 31337**.

---

## 2. Remix IDE Setup (`remix.ethereum.org`)

You can compile, debug, and test `LandRegistry.sol` directly in your browser using Remix IDE:

1. Open [https://remix.ethereum.org](https://remix.ethereum.org).
2. Under the **File Explorer** tab, create a file: `contracts/LandRegistry.sol`.
3. Copy the contents of [`blockchain/contracts/LandRegistry.sol`](../blockchain/contracts/LandRegistry.sol) into Remix.
4. Go to **Solidity Compiler** tab:
   - **Compiler Version:** `0.8.24` (or `0.8.20+`)
   - Click **Compile LandRegistry.sol**.
5. Go to **Deploy & Run Transactions** tab:
   - **ENVIRONMENT:** Select **"Injected Provider - MetaMask"** (or **"External HTTP Provider"** pointing to `http://127.0.0.1:8545` or `http://127.0.0.1:7545`).
   - Under **Deploy**, supply the constructor parameter `_governmentVerifier` (e.g. Account #0 address).
   - Click **Deploy (transact)**.
6. Once deployed, expand the contract interface to invoke:
   - `registerLand(...)`
   - `initiateTransfer(...)`
   - `acceptTransfer(...)`
   - `authorizeTransfer(...)`
   - `getLand(...)`

---

## 3. MetaMask Wallet Integration

To connect MetaMask to your local blockchain:
1. Open MetaMask -> Network Selector -> **Add network manually**:
   - **Network Name:** `Hardhat / Ganache Local`
   - **New RPC URL:** `http://127.0.0.1:8545` (or `http://127.0.0.1:7545` for Ganache)
   - **Chain ID:** `31337` (for Hardhat) or `1337` / `5777` (for Ganache)
   - **Currency Symbol:** `ETH`
2. Import private keys from your local node output into MetaMask:
   - **Account #0 (Registrar):** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Account #1 (Seller):** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Account #2 (Buyer):** `0x5de4111afa1a4b94908f83103eb2f954b14eec649780ee56157326c21e6c1a85`

---

## 4. IPFS (InterPlanetary File System) File Storage

LandChain implements decentralized, content-addressable storage for supporting documents:
- **Title Deeds** (`TITLE_DEED`)
- **Cadastral Land Surveys** (`LAND_SURVEY`)
- **Legal Sale Agreements** (`LEGAL_DOCUMENT`)
- **Identity & Geo-Tagged Photos** (`SUPPORTING_EVIDENCE`)

### How IPFS Works in LandChain:
1. During the 4-step registration wizard, the user uploads a deed.
2. The browser calculates:
   - **SHA-256 Hash:** 32-byte cryptographic integrity proof stored on the Ethereum blockchain.
   - **IPFS CID:** Multihash Content Identifier (e.g. `QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco`).
3. The IPFS CID is registered on the land application and displayed on:
   - Government Scrutiny Workspace
   - Public Record Inspection Page
   - Vector PDF Demonstration Certificate
4. Files can be retrieved via any public IPFS gateway:
   - `https://ipfs.io/ipfs/<CID>`
   - `https://gateway.pinata.cloud/ipfs/<CID>`

---

## 5. Postman Testing Workflow

Import [`landchain.postman_collection.json`](../landchain.postman_collection.json) into Postman:
1. Click **Import** in Postman -> Drag and drop `landchain.postman_collection.json`.
2. Ensure the backend API is running (`npm run dev --workspace=apps/api` at `http://localhost:5000`).
3. Execute the 13 sequenced requests from `01. System Health Check` to `13. Agent Properties`.
