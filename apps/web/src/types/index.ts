export type UserRole = "seller" | "buyer" | "government" | "agent" | "public";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  walletAddress?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "APPROVED_PENDING_BLOCKCHAIN"
  | "VERIFIED_ON_CHAIN";

export type DocumentCategory =
  | "TITLE_DEED"
  | "LAND_SURVEY"
  | "LEGAL_DOCUMENT"
  | "SUPPORTING_EVIDENCE";

export type StorageStatus = "STORED" | "STORAGE_UNAVAILABLE" | "HASH_ONLY" | "DISABLED";

export interface LandDocument {
  documentId: string;
  title: string;
  fileName?: string;
  storagePath?: string;
  storageStatus?: StorageStatus;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  ipfsCid?: string;
  ipfsUrl?: string;
  category?: DocumentCategory;
  uploadedAt: string;
}

export interface LandApplication {
  id: string;
  applicationId: string;
  applicantUid: string;
  applicantEmail: string;
  applicantWallet: string;
  surveyNumber: string;
  state: string;
  district: string;
  locality: string;
  address?: string;
  areaSqMeters: number;
  measurementUnit: string;
  landCategory: "RESIDENTIAL" | "COMMERCIAL" | "AGRICULTURAL" | "INDUSTRIAL" | "MIXED_USE";
  description: string;
  documents: LandDocument[];
  status: ApplicationStatus;
  reviewNotes?: string;
  reviewerUid?: string;
  reviewerWallet?: string;
  reviewedAt?: string;
  assignedLandId?: string;
  contractAddress?: string;
  onChainTxHash?: string;
  onChainBlockNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicationState = "DRAFT" | "PUBLISHED" | "RESTRICTED";
export type VerificationState = "PENDING" | "VERIFIED_ON_CHAIN" | "REVOKED";

export interface LandRecord {
  id: string;
  landId: string;
  applicationId: string;
  parcelNumber: string;
  locality: string;
  district: string;
  state: string;
  areaSqMeters: number;
  landCategory: string;
  description: string;
  currentOwnerWallet: string;
  currentOwnerUid?: string;
  currentOwnerEmail?: string;
  blockchainNetwork: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  docIntegrityHash: string;
  verificationState: VerificationState;
  publicationState: PublicationState;
  transferCount: number;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TransferStatus =
  | "PENDING_BUYER"
  | "ACCEPTED_BY_BUYER"
  | "REJECTED_BY_BUYER"
  | "PENDING_GOVERNMENT"
  | "APPROVED_PENDING_BLOCKCHAIN"
  | "TRANSFERRED_ON_CHAIN"
  | "REJECTED_BY_GOVERNMENT"
  | "CANCELLED"
  | "FAILED_RETRYABLE";

export interface TransferRequest {
  id: string;
  transferId: string;
  landId: string;
  sellerUid: string;
  sellerEmail: string;
  sellerWallet: string;
  buyerUid: string;
  buyerEmail: string;
  buyerWallet: string;
  agreedPrice?: number;
  currency?: string;
  status: TransferStatus;
  buyerResponseAt?: string;
  buyerNotes?: string;
  governmentReviewNotes?: string;
  governmentReviewerUid?: string;
  governmentReviewedAt?: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: "APPLICATION" | "RECORD" | "TRANSFER" | "USER" | "SYSTEM";
  targetId: string;
  metadata?: Record<string, any>;
  transactionHash?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  type: "APPLICATION_UPDATE" | "TRANSFER_REQUEST" | "TRANSFER_UPDATE" | "BLOCKCHAIN_EVENT" | "SYSTEM";
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AgentEnquiry {
  id: string;
  enquiryId: string;
  landId: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  message: string;
  agentUid: string;
  status: string;
  createdAt: string;
}
