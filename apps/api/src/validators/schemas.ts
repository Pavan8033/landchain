import { z } from "zod";

export const CreateApplicationSchema = z.object({
  surveyNumber: z.string().min(2, "Survey or parcel number is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  locality: z.string().min(2, "Locality / village is required"),
  address: z.string().optional(),
  areaSqMeters: z.number().positive("Land area must be greater than zero"),
  measurementUnit: z.enum(["SQ_METERS", "SQ_FEET", "ACRES", "HECTARES", "Sq.M", "Sq.Ft", "Acres", "Hectares"]).default("Sq.M"),
  landCategory: z.enum(["RESIDENTIAL", "COMMERCIAL", "AGRICULTURAL", "INDUSTRIAL", "MIXED_USE"]),
  description: z.string().min(5, "Please provide a property description"),
  applicantWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format"),
  documents: z
    .array(
      z.object({
        documentId: z.string(),
        title: z.string().min(2),
        fileName: z.string().optional(),
        storagePath: z.string().optional().default(""),
        fileSize: z.number(),
        mimeType: z.string(),
        sha256Hash: z.string().regex(/^(0x)?[a-fA-F0-9]{64}$/, "Must be a valid 32-byte hex hash"),
        ipfsCid: z.string().optional(),
        ipfsUrl: z.string().optional(),
        category: z.string().optional(),
        storageStatus: z
          .enum(["STORED", "STORAGE_UNAVAILABLE", "HASH_ONLY", "DISABLED"])
          .optional()
          .default("HASH_ONLY"),
      })
    )
    .min(1, "At least one supporting ownership document is required"),
});

export const ReviewApplicationSchema = z.object({
  status: z.enum(["APPROVED_PENDING_BLOCKCHAIN", "REJECTED", "UNDER_REVIEW"]),
  reviewNotes: z.string().min(5, "Review notes or justification must be provided"),
  onChainTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format")
    .optional(),
  onChainBlockNumber: z.number().optional(),
});

export const CreateTransferRequestSchema = z.object({
  landId: z.string().min(3, "Land ID is required"),
  buyerEmail: z.string().email("Valid buyer email is required"),
  buyerWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Valid buyer wallet address is required"),
  agreedPrice: z.number().nonnegative().optional(),
  currency: z.string().default("INR"),
});

export const BuyerConsentSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  notes: z.string().optional(),
});

export const GovernmentTransferReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reviewNotes: z.string().min(5, "Government decision notes required"),
  blockchainTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Valid blockchain transaction hash required")
    .optional(),
  blockchainBlockNumber: z.number().optional(),
});

export const SetRoleSchema = z.object({
  targetUid: z.string().min(1, "Target UID is required"),
  targetRole: z.enum(["seller", "buyer", "government", "agent", "public"]),
  adminSecret: z.string().min(6, "Administrative authorization secret required"),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format")
    .optional(),
});
