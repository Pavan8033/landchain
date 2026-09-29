import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { LandRecord } from "../types";

export async function generateLandCertificate(record: LandRecord): Promise<Buffer> {
  const publicVerifyUrl = `${process.env.APP_BASE_URL || "http://localhost:5173"}/verify/${record.landId}`;
  const certificateVersion = (record.transferCount || 0) + 1;
  const certificateStatus = record.verificationState === "VERIFIED_ON_CHAIN" ? "ACTIVE" : "SUPERSEDED";
  
  // Generate QR Code Buffer
  const qrBuffer = await QRCode.toBuffer(publicVerifyUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 140,
    color: {
      dark: "#101827",
      light: "#FFFFFF",
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    const goldColor = "#C6A66B";
    const navyColor = "#101827";
    const slateColor = "#202D40";
    const mutedBlue = "#5278A5";

    // Outer Decorative Border
    doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor(goldColor).stroke();
    doc.rect(24, 24, 547, 794).lineWidth(0.5).strokeColor(slateColor).stroke();

    // Top Brand Header
    doc.fillColor(goldColor).fontSize(10).text("LANDCHAIN ENTERPRISE REGISTRY", 40, 50, {
      align: "center",
      characterSpacing: 2,
    });

    doc.moveDown(0.3);
    doc.fillColor(navyColor).fontSize(20).font("Helvetica-Bold").text(
      "DIGITAL LAND RECORD CERTIFICATE",
      { align: "center" }
    );

    doc.moveDown(0.2);
    doc.fillColor(mutedBlue).fontSize(9.5).font("Helvetica").text(
      "Academic Demonstration Certificate • Decentralized Title Verification & Provenance",
      { align: "center" }
    );

    // Decorative Horizontal Divider
    doc.moveDown(0.8);
    const yPos = doc.y;
    doc.moveTo(80, yPos).lineTo(515, yPos).lineWidth(1).strokeColor(goldColor).stroke();
    doc.moveDown(0.8);

    // Certificate Meta
    doc.fontSize(9).fillColor(slateColor).font("Helvetica");
    doc.text(`Certificate No: CERT-${record.landId}-V${certificateVersion}`, 50, doc.y);
    doc.text(`Version: ${certificateVersion} [${certificateStatus}]`, 260, doc.y - 11);
    doc.text(`Issued: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 420, doc.y - 11, { align: "right" });

    doc.moveDown(1.5);

    // Highlight Box: Land Identifier
    const boxY = doc.y;
    doc.rect(50, boxY, 495, 60).fillAndStroke("#F5F3EE", "#C6A66B");
    doc.fillColor(navyColor).fontSize(11).font("Helvetica-Bold").text("CANONICAL LAND IDENTIFIER", 70, boxY + 12);
    doc.fontSize(18).fillColor(goldColor).text(record.landId, 70, boxY + 28);
    doc.fontSize(10).fillColor(slateColor).font("Helvetica").text(`Parcel / Survey: ${record.parcelNumber}`, 320, boxY + 28);

    doc.y = boxY + 75;

    // Two-Column Section for Details
    const leftX = 50;
    const labelW = 140;
    const rightValX = leftX + labelW;

    const printField = (label: string, value: string, isMono = false) => {
      const currentY = doc.y;
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(slateColor).text(label, leftX, currentY);
      doc.font(isMono ? "Courier" : "Helvetica").fontSize(9.5).fillColor(navyColor).text(value || "N/A", rightValX, currentY, { width: 340 });
      doc.moveDown(0.6);
    };

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(navyColor).text("PROPERTY SPECIFICATIONS", leftX);
    doc.moveDown(0.4);

    printField("Locality & Village:", record.locality);
    printField("District & State:", `${record.district}, ${record.state}`);
    printField("Land Area:", `${record.areaSqMeters.toLocaleString()} Sq. Meters`);
    printField("Zoning Category:", record.landCategory);
    printField("Current Status:", record.verificationState);

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(navyColor).text("BLOCKCHAIN PROVENANCE & OWNERSHIP", leftX);
    doc.moveDown(0.4);

    printField("Recorded Owner Wallet:", record.currentOwnerWallet, true);
    printField("Smart Contract:", record.contractAddress, true);
    printField("Transaction Hash:", record.transactionHash, true);
    printField("Network Environment:", record.blockchainNetwork);
    printField("Document Hash (SHA-256):", record.docIntegrityHash, true);
    printField("IPFS Storage CID:", "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco", true);
    printField("Transfer Events Recorded:", `${record.transferCount} Completed Transfer(s)`);

    // QR Code and Verification Seal Section
    doc.moveDown(1);
    const bottomSectionY = doc.y;

    // Draw QR Code
    doc.image(qrBuffer, 60, bottomSectionY, { width: 90, height: 90 });

    doc.fontSize(8.5).fillColor(slateColor).font("Helvetica");
    doc.text("SCAN TO VERIFY PUBLIC RECORD", 170, bottomSectionY + 15);
    doc.font("Courier").fontSize(8).fillColor(mutedBlue).text(publicVerifyUrl, 170, bottomSectionY + 30, { width: 330 });
    doc.font("Helvetica").fontSize(8).fillColor(slateColor).text(
      "This QR code directly references the immutable on-chain record state deployed to the Ethereum-compatible ledger.",
      170,
      bottomSectionY + 45,
      { width: 330 }
    );

    // Academic Prototype Mandatory Disclaimer
    const disclaimerY = 740;
    doc.rect(40, disclaimerY, 515, 52).fillAndStroke("#FDF6EC", "#E6A23C");
    doc.fillColor("#B77A2F").fontSize(8.5).font("Helvetica-Bold").text(
      "ACADEMIC DEMONSTRATION ONLY - NOT A LEGAL TITLE DEED",
      50,
      disclaimerY + 8,
      { align: "center" }
    );
    doc.font("Helvetica").fontSize(7.5).fillColor("#606266").text(
      "This certificate represents a blockchain verification record within the LandChain academic demonstration system and is not an official government land title. It does not confer statutory ownership, substitute for official state revenue department records, or possess legal standing in a court of law.",
      50,
      disclaimerY + 22,
      { align: "center", width: 495 }
    );

    doc.end();
  });
}
