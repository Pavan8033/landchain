/**
 * LandChain - Administrative Provisioning Script
 * Grants the privileged 'government' authority role to an explicitly configured UID or email.
 * Uses Firebase Admin SDK custom claims or the secure backend role endpoint.
 *
 * Usage:
 *   npx ts-node scripts/setup-admin.ts <TARGET_UID> <ADMIN_SECRET>
 */

async function main() {
  const targetUid = process.argv[2] || "gov-789";
  const adminSecret = process.argv[3] || process.env.ADMIN_SETUP_SECRET || "landchain-academic-secret-key-2026";
  const apiUrl = process.env.API_BASE_URL || "http://localhost:5000/api";

  console.log("=========================================");
  console.log("LandChain Government Role Provisioning");
  console.log("=========================================");
  console.log(`Target UID: ${targetUid}`);
  console.log(`Target Role: government (Authorized Registrar)`);
  console.log(`Endpoint: ${apiUrl}/auth/set-role`);

  try {
    const res = await fetch(`${apiUrl}/auth/set-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUid,
        targetRole: "government",
        adminSecret,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    console.log("SUCCESS:", data.message);
    console.log("The target user now possesses authorized government scrutiny & minting clearance.");
  } catch (err: any) {
    console.error("Provisioning failed:", err.message);
    process.exit(1);
  }
}

main();
