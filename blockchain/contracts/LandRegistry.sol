// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LandRegistry
 * @dev Academic Prototype for Blockchain-Based Land Registry Management System
 * Enforces multi-party consent (Seller -> Buyer -> Government Verifier) for land registration and transfers.
 * DISCLAIMER: Academic prototype only; does not convey official legal title.
 */
contract LandRegistry {
    // Custom Errors for gas efficiency and clear debugging
    error UnauthorizedCaller(address caller);
    error InvalidAddress();
    error LandAlreadyRegistered(string landId);
    error LandNotFound(string landId);
    error NotCurrentOwner(address caller, address currentOwner);
    error TransferNotPendingBuyer(string landId);
    error TransferNotAcceptedByBuyer(string landId);
    error InvalidBuyerAddress();
    error BuyerCannotBeCurrentOwner();
    error NoActiveTransferRequest(string landId);
    error StringEmpty();

    enum TransferStatus {
        NONE,
        PENDING_BUYER,
        ACCEPTED_BY_BUYER,
        REJECTED_BY_BUYER,
        COMPLETED,
        CANCELLED
    }

    struct LandRecord {
        string landId;          // Canonical Land Reference (e.g., "LAND-KA-BLR-001")
        string parcelNumber;    // Survey / Parcel Identifier
        address currentOwner;   // Recorded owner wallet
        bool isVerified;        // Verification flag
        uint256 registeredAt;   // Block timestamp of registration
        string locality;        // Locality / Village
        uint256 areaSqMeters;   // Land Area in Sq. Meters
        string docHash;         // Document Integrity Hash (SHA-256 or IPFS CID)
        uint256 transferCount;  // Number of transfers completed
    }

    struct TransferRequest {
        string landId;
        address seller;
        address proposedBuyer;
        TransferStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    // Contract Owner / Administrator
    address public admin;

    // Authorized Government Verifier
    address public governmentVerifier;

    // Mapping from normalized Land ID to LandRecord
    mapping(string => LandRecord) private _lands;

    // Mapping from Land ID to existence check
    mapping(string => bool) private _landExists;

    // Mapping from Land ID to active TransferRequest
    mapping(string => TransferRequest) private _transfers;

    // List of all registered Land IDs
    string[] private _allLandIds;

    // Events
    event GovernmentVerifierUpdated(address indexed previousVerifier, address indexed newVerifier);
    event LandRegistered(
        string indexed landIdIndexed,
        string landId,
        string parcelNumber,
        address indexed owner,
        address indexed verifier,
        uint256 registeredAt,
        string docHash
    );
    event TransferInitiated(
        string indexed landIdIndexed,
        string landId,
        address indexed seller,
        address indexed proposedBuyer,
        uint256 createdAt
    );
    event TransferAccepted(
        string indexed landIdIndexed,
        string landId,
        address indexed buyer,
        uint256 acceptedAt
    );
    event TransferRejected(
        string indexed landIdIndexed,
        string landId,
        address indexed buyer,
        uint256 rejectedAt
    );
    event TransferCancelled(
        string indexed landIdIndexed,
        string landId,
        address indexed seller,
        uint256 cancelledAt
    );
    event OwnershipTransferred(
        string indexed landIdIndexed,
        string landId,
        address indexed previousOwner,
        address indexed newOwner,
        address verifier,
        uint256 completedAt
    );

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    modifier onlyGovernmentVerifier() {
        if (msg.sender != governmentVerifier) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    constructor(address _initialVerifier) {
        if (_initialVerifier == address(0)) {
            revert InvalidAddress();
        }
        admin = msg.sender;
        governmentVerifier = _initialVerifier;
        emit GovernmentVerifierUpdated(address(0), _initialVerifier);
    }

    /**
     * @notice Update the authorized government verifier address
     * @param _newVerifier The new verifier address
     */
    function setGovernmentVerifier(address _newVerifier) external onlyAdmin {
        if (_newVerifier == address(0)) {
            revert InvalidAddress();
        }
        address oldVerifier = governmentVerifier;
        governmentVerifier = _newVerifier;
        emit GovernmentVerifierUpdated(oldVerifier, _newVerifier);
    }

    /**
     * @notice Registers a verified land parcel onto the blockchain.
     * @dev Restricted to the authorized government verifier.
     */
    function registerLand(
        string calldata landId,
        string calldata parcelNumber,
        address ownerWallet,
        string calldata locality,
        uint256 areaSqMeters,
        string calldata docHash
    ) external onlyGovernmentVerifier {
        if (bytes(landId).length == 0 || bytes(parcelNumber).length == 0) {
            revert StringEmpty();
        }
        if (ownerWallet == address(0)) {
            revert InvalidAddress();
        }
        if (_landExists[landId]) {
            revert LandAlreadyRegistered(landId);
        }

        LandRecord memory record = LandRecord({
            landId: landId,
            parcelNumber: parcelNumber,
            currentOwner: ownerWallet,
            isVerified: true,
            registeredAt: block.timestamp,
            locality: locality,
            areaSqMeters: areaSqMeters,
            docHash: docHash,
            transferCount: 0
        });

        _lands[landId] = record;
        _landExists[landId] = true;
        _allLandIds.push(landId);

        emit LandRegistered(
            landId,
            landId,
            parcelNumber,
            ownerWallet,
            msg.sender,
            block.timestamp,
            docHash
        );
    }

    /**
     * @notice Initiates a transfer request from the current owner to a buyer.
     * @dev Callable only by the current recorded owner.
     */
    function initiateTransfer(
        string calldata landId,
        address proposedBuyer
    ) external {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        LandRecord storage land = _lands[landId];
        if (msg.sender != land.currentOwner) {
            revert NotCurrentOwner(msg.sender, land.currentOwner);
        }
        if (proposedBuyer == address(0)) {
            revert InvalidBuyerAddress();
        }
        if (proposedBuyer == land.currentOwner) {
            revert BuyerCannotBeCurrentOwner();
        }

        _transfers[landId] = TransferRequest({
            landId: landId,
            seller: msg.sender,
            proposedBuyer: proposedBuyer,
            status: TransferStatus.PENDING_BUYER,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit TransferInitiated(landId, landId, msg.sender, proposedBuyer, block.timestamp);
    }

    /**
     * @notice Buyer explicitly accepts an incoming transfer request.
     * @dev Callable only by the proposed buyer.
     */
    function acceptTransfer(string calldata landId) external {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        TransferRequest storage request = _transfers[landId];
        if (request.status != TransferStatus.PENDING_BUYER) {
            revert TransferNotPendingBuyer(landId);
        }
        if (msg.sender != request.proposedBuyer) {
            revert UnauthorizedCaller(msg.sender);
        }

        request.status = TransferStatus.ACCEPTED_BY_BUYER;
        emit TransferAccepted(landId, landId, msg.sender, block.timestamp);
    }

    /**
     * @notice Buyer explicitly rejects an incoming transfer request.
     * @dev Callable only by the proposed buyer.
     */
    function rejectTransfer(string calldata landId) external {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        TransferRequest storage request = _transfers[landId];
        if (request.status != TransferStatus.PENDING_BUYER) {
            revert TransferNotPendingBuyer(landId);
        }
        if (msg.sender != request.proposedBuyer) {
            revert UnauthorizedCaller(msg.sender);
        }

        request.status = TransferStatus.REJECTED_BY_BUYER;
        emit TransferRejected(landId, landId, msg.sender, block.timestamp);
    }

    /**
     * @notice Seller cancels a pending transfer request before buyer acceptance.
     */
    function cancelTransfer(string calldata landId) external {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        TransferRequest storage request = _transfers[landId];
        if (msg.sender != request.seller) {
            revert UnauthorizedCaller(msg.sender);
        }
        if (request.status != TransferStatus.PENDING_BUYER) {
            revert TransferNotPendingBuyer(landId);
        }

        request.status = TransferStatus.CANCELLED;
        emit TransferCancelled(landId, landId, msg.sender, block.timestamp);
    }

    /**
     * @notice Finalizes ownership transfer after buyer acceptance.
     * @dev Restricted to authorized government verifier.
     */
    function authorizeTransfer(string calldata landId) external onlyGovernmentVerifier {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        TransferRequest storage request = _transfers[landId];
        if (request.status != TransferStatus.ACCEPTED_BY_BUYER) {
            revert TransferNotAcceptedByBuyer(landId);
        }

        LandRecord storage land = _lands[landId];
        address previousOwner = land.currentOwner;
        address newOwner = request.proposedBuyer;

        // Ensure seller is still the owner
        if (previousOwner != request.seller) {
            revert NotCurrentOwner(request.seller, previousOwner);
        }

        // Execute state update
        land.currentOwner = newOwner;
        land.transferCount += 1;

        request.status = TransferStatus.COMPLETED;
        request.completedAt = block.timestamp;

        emit OwnershipTransferred(
            landId,
            landId,
            previousOwner,
            newOwner,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Check if a land record exists
     */
    function landExists(string calldata landId) external view returns (bool) {
        return _landExists[landId];
    }

    /**
     * @notice Get land details
     */
    function getLand(string calldata landId)
        external
        view
        returns (
            string memory id,
            string memory parcelNumber,
            address currentOwner,
            bool isVerified,
            uint256 registeredAt,
            string memory locality,
            uint256 areaSqMeters,
            string memory docHash,
            uint256 transferCount
        )
    {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        LandRecord memory r = _lands[landId];
        return (
            r.landId,
            r.parcelNumber,
            r.currentOwner,
            r.isVerified,
            r.registeredAt,
            r.locality,
            r.areaSqMeters,
            r.docHash,
            r.transferCount
        );
    }

    /**
     * @notice Get transfer request state
     */
    function getTransferRequest(string calldata landId)
        external
        view
        returns (
            address seller,
            address proposedBuyer,
            TransferStatus status,
            uint256 createdAt,
            uint256 completedAt
        )
    {
        if (!_landExists[landId]) {
            revert LandNotFound(landId);
        }
        TransferRequest memory req = _transfers[landId];
        return (
            req.seller,
            req.proposedBuyer,
            req.status,
            req.createdAt,
            req.completedAt
        );
    }

    /**
     * @notice Total number of registered parcels
     */
    function getTotalLandsCount() external view returns (uint256) {
        return _allLandIds.length;
    }

    /**
     * @notice Get land ID by index for pagination/listing
     */
    function getLandIdByIndex(uint256 index) external view returns (string memory) {
        require(index < _allLandIds.length, "Index out of bounds");
        return _allLandIds[index];
    }
}
