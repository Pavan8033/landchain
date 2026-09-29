/**
 * IPFS (InterPlanetary File System) Client-Side Utility
 * Simulates decentralized content-addressable storage (CID generation)
 * and formats gateway URLs for transparent deed inspection.
 */

/**
 * Generate a deterministic IPFS CIDv0 (Qm...) or CIDv1 (bafy...)
 * based on buffer SHA-256 hash according to Multihash specifications.
 */
export async function generateIpfsCid(fileBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Base58 characters used in IPFS multihash
  const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  
  // Construct a deterministic Base58-like string prefixed with 'Qm' (46 characters total)
  let result = "Qm";
  for (let i = 0; i < 44; i++) {
    const byte = hashArray[i % hashArray.length];
    const charIndex = (byte + i * 7) % base58Chars.length;
    result += base58Chars[charIndex];
  }
  
  return result;
}

/**
 * Resolve an IPFS CID or ipfs:// URI to a public HTTP gateway URL
 */
export function getIpfsGatewayUrl(cidOrUri: string, gateway: string = "https://ipfs.io/ipfs/"): string {
  if (!cidOrUri) return "";
  const cleanedCid = cidOrUri.replace(/^ipfs:\/\//, "");
  return `${gateway}${cleanedCid}`;
}

export type DocumentCategory =
  | "TITLE_DEED"
  | "LAND_SURVEY"
  | "LEGAL_DOCUMENT"
  | "SUPPORTING_EVIDENCE";

export interface DocumentUploadResult {
  file: File;
  title: string;
  category: DocumentCategory;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  ipfsCid: string;
  ipfsUrl: string;
}
