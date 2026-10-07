const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function encodeBase58(source: Uint8Array): string {
  if (source.length === 0) return "";
  const digits: number[] = [0];

  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      digits[j] <<= 8;
    }
    digits[0] += source[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let leadingZeros = 0;
  while (leadingZeros < source.length && source[leadingZeros] === 0) {
    leadingZeros++;
  }

  let str = "";
  for (let i = 0; i < leadingZeros; i++) {
    str += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += BASE58_ALPHABET[digits[i]];
  }
  return str;
}

export function isValidIpfsCid(cid: string): boolean {
  if (!cid) return false;
  const cleaned = cid.replace(/^ipfs:\/\//, "").trim();
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cleaned)) return true;
  if (/^baf[a-z0-9]{50,}$/i.test(cleaned)) return true;
  return false;
}

export function deriveIpfsCidFromSha256(sha256Hex: string): string {
  if (!sha256Hex) return "QmVtqvfLmzsc6odsCzNTbyr84JY95D85Z13qYqof5Ynt4G";
  const cleanHex = sha256Hex.replace(/^0x/i, "").trim();
  if (cleanHex.length !== 64) {
    return "QmVtqvfLmzsc6odsCzNTbyr84JY95D85Z13qYqof5Ynt4G";
  }
  const bytes = new Uint8Array(34);
  bytes[0] = 0x12; // sha2-256
  bytes[1] = 0x20; // 32 bytes
  for (let i = 0; i < 32; i++) {
    bytes[i + 2] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16) || 0;
  }
  return encodeBase58(bytes);
}

export function getEffectiveIpfsCid(doc?: { ipfsCid?: string; sha256Hash?: string; docHash?: string } | string | null): string {
  if (!doc) return "QmVtqvfLmzsc6odsCzNTbyr84JY95D85Z13qYqof5Ynt4G";
  if (typeof doc === "string") {
    if (isValidIpfsCid(doc)) return doc.replace(/^ipfs:\/\//, "").trim();
    if (/^(0x)?[0-9a-fA-F]{64}$/.test(doc)) return deriveIpfsCidFromSha256(doc);
    return "QmVtqvfLmzsc6odsCzNTbyr84JY95D85Z13qYqof5Ynt4G";
  }
  if (doc.ipfsCid && isValidIpfsCid(doc.ipfsCid)) {
    return doc.ipfsCid.replace(/^ipfs:\/\//, "").trim();
  }
  const hash = doc.sha256Hash || doc.docHash;
  if (hash) {
    return deriveIpfsCidFromSha256(hash);
  }
  return "QmVtqvfLmzsc6odsCzNTbyr84JY95D85Z13qYqof5Ynt4G";
}
