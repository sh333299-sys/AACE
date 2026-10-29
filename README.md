# AACE — Next-Gen AICTE Approval & Compliance Engine
**Smart India Hackathon 2026 Prototype**  
**Problem Statement ID:** SIH26262  
**Problem Statement Title:** Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System  
**Category:** Government / Regulatory Administration Portal  

---

## 1. Executive Summary & Design Rationale

The **All India Council for Technical Education (AICTE)** oversees technical institutions across India. Historically, tracking document validities (such as Fire Safety NOCs, Land Titles, Structural Stability, and Fixed Deposit Corpus Receipts) has suffered from scattered offline paperwork, manual verification delays, and delayed deficiency rectifications.

**AACE (AICTE Approval & Compliance Engine)** addresses SIH26262 by providing a restrained, high-efficiency administrative portal with:
1. **End-to-End Workflow Automation:** Configurable regulatory paths (*Scrutiny Only*, *Scrutiny + EVC*, *EVC + SAC/SHC*, *Re-Scrutiny*).
2. **Deficiency Revert Lifecycle:** Formal recording of deficiency grounds by Regional Officers and structured resubmission by colleges.
3. **Dynamic Date-Driven Compliance Engine:** Real-time calculation of days remaining until document expiry (no static mock labels).
4. **Automated Escalation Policy:** Demonstration of a multi-tier escalation rule (*T-30 Days Warning* $\to$ *T+0 Overdue Alert* $\to$ *T+15 Days Draft Show-Cause Notice*).
5. **Human-in-the-Loop Safeguards:** Statutory decisions and Show-Cause Notices **never automatically grant approval** or penalize colleges without formal human officer sign-off.
6. **Append-Only Tamper-Evident Audit Trail:** Deterministic SHA-256 hash chaining ($\text{prevHash} \to \text{eventHash}$) with one-click cryptographic integrity verification.
7. **Simulated Mobile Geo-Tagged EVC Inspections:** Structured physical facility checklist with offline draft saving.

---

## 2. Tech Stack & Architecture

- **Frontend & Core Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Official Government Administrative Aesthetic: `#f8fafc` light background, `#0284c7`/`#0f766e` teal/navy accents, compact data tables, clear status pills)
- **Icons:** Lucide React
- **Cryptographic Security Layer:** Deterministic SHA-256 hash-chaining engine
- **Data Persistence:** LocalStorage-backed reactive state provider (`AppContext`) with instant **Reset Demo Data** capability for repeated judging rounds.
- **Exporting:** CSV Exporters for Application Registers, Document Compliance, and Regulatory Audit Trail.

---

## 3. Setup and Run Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation & Launch
```bash
# 1. Clone or navigate to the repository folder
cd d:\sih

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build & Typecheck
```bash
npm run build
```
*(Transpiles with `tsc -b` and builds production bundle with Vite in < 1 second).*

---

## 4. Core User Roles & Permissions Matrix

The portal features a **Prototype Demo Role Switcher** in the top navigation bar. Switching roles dynamically changes accessible actions and pending queue banners:

| Role | Operational Scope | Key Permitted Actions |
| :--- | :--- | :--- |
| **1. Institution Administrator** | College Registrar / Management | View institutional profile, upload compliance documents, inspect active deficiency memos, and submit formal deficiency rectifications with proof. |
| **2. Regional Officer** | Regional Bureau (NWRO, WRO, SWRO, etc.) | Scrutinize applications, return applications with deficiency grounds, verify/reject uploaded statutory documents, and recommend EVC committee visits. |
| **3. EVC Inspector** | Expert Visit Committee Panel | Open scheduled campus visits, complete structured on-site checklists (Instructional, IT, Safety, Cadre), save offline drafts, and submit final EVC visit reports. |
| **4. Central Director** | Statutory Bureau HQ, New Delhi | Review Standing Hearing Committee (SHC) recommendations, authorize draft Show-Cause Notices (T+15 escalation), and grant final statutory approval / rejection (LoA). |

---

## 5. Seeded Demo Scenario (SIH Evaluation Ready)

The prototype comes pre-seeded with realistic fictional Indian technical institutions:
- **Application 1 (`APP-2026-001` - Kalinga Institute of Technology & Management):** Status is `SCRUTINY_PENDING`. Waiting for Regional Officer review.
- **Application 2 (`APP-2026-002` - Dr. A.P.J. Abdul Kalam Technical Campus):** Status is `DEFICIENCY_RAISED`. Returned by Regional Bureau due to CSE cadre ratio and missing Fire NOC seal. Ready for college resubmission.
- **Application 3 (`APP-2026-003` - Sahyadri College of Engineering & Research):** Status is `EVC_RECOMMENDED`. Scheduled for an on-site physical inspection.
- **Application 4 (`APP-2026-004` - Vidyapeeth Institute of Technology):** Status is `FINAL_APPROVED` by Central Director after SAC/SHC review, with complete historical audit blocks.
- **Document 1 (`DOC-101` - Fire Safety NOC):** Expiring in **18 days** (Triggers amber warning & T-30 escalation stage).
- **Document 2 (`DOC-102` - Fixed Deposit Corpus):** Expired **16 days ago** (Triggers critical red alert & automated **T+15 Draft Show-Cause Notice**).
- **Document 3 (`DOC-103` - Building Completion Certificate):** Marked as `PENDING_VERIFICATION` for Regional Officer audit.

---

## 6. Three-Minute Live Judging Script

Judges can also click the **"3-Min Demo Script"** button in the header at any point to view an interactive walkthrough:

### Minute 1: The Problem & Operational Dashboard
1. **Start on the Overview Dashboard.** Point out that total counts, pending scrutinies, and expired documents are computed dynamically from active records, not arbitrary hardcoded mock numbers.
2. **Switch to Regional Officer.** Point to Application `APP-2026-001` in the Application Register. Click **Inspect** to highlight the configurable workflow path (*Scrutiny Only*). Note the option to either pass scrutiny or return the file with specific deficiency grounds.

### Minute 2: Deficiency Resubmission & Document Expiry Escalation
3. **Switch to Institution Administrator.** Show Application `APP-2026-002` flagged with an active deficiency memo from the Northern Regional Office. Click **Inspect** $\to$ **Submit Deficiency Reply**, select a rectified document, and submit. The application immediately moves to `RESCRUTINY_PENDING` and logs an audit event!
4. **Navigate to Document Compliance.** Show that validity days are calculated from today's date:
   - `DOC-101` (Fire Safety NOC) shows **18 days left** (amber badge).
   - `DOC-102` (Corpus FDR) shows **16 days overdue** (red badge).
   - Click **OCR Audit** to demonstrate side-by-side verification: review extracted registration number, dates, and confidence score ($94\%$), and flag discrepancies if needed.

### Minute 3: Field Inspection, Show-Cause Notice & Audit Integrity
5. **Switch to EVC Inspector $\to$ EVC Inspections.** Open the Sahyadri College inspection. Complete the 5-point physical checklist (Classrooms, 1 Gbps Leased Line, Barrier-Free RPwD Ramps, NBC Fire Sprinklers). Observe simulated GPS coordinates (`12.8681° N, 74.8789° E`). Click **Submit Final EVC Visit Report**. Note that the application pipeline immediately updates to `EVC_REPORT_SUBMITTED` with a score of $100\%$.
6. **Switch to Central Director $\to$ Alerts & Escalations.** Highlight the T+15 breach for the expired FDR. Click **Review Draft Notice**. Emphasize the core governance requirement: *the automated system drafts the notice, but statutory issuance requires human sign-off*. Click **Sign & Issue Notice**.
7. **Navigate to Audit Trail.** Point out the append-only log detailing every action taken in the demo. Click **Verify Cryptographic Chain**: the system calculates deterministic SHA-256 hashes across all blocks and confirms chain validity!

---

## 7. Cryptographic Audit Trail Specifications

Each event in the audit trail is chained to the previous event:
$$\text{eventHash} = \text{SHA-256}(\text{prevHash} \parallel \text{timestamp} \parallel \text{actor} \parallel \text{action} \parallel \text{recordId} \parallel \text{summary})$$

- **Integrity Guarantee:** Any mutation to a historic event's text, actor, or timestamp will cause all subsequent block hashes to fail validation upon clicking **Verify Cryptographic Chain**.
- **Tamper Resistance:** Regular portal users and institutions have no delete or update permissions on audit records.
- **Architectural Scope / Limitation:** In this local evaluation prototype, blocks are persisted in the browser's storage. In enterprise production, root state hashes would be anchored periodically to an immutable government ledger.

---

## 8. Genuine Implemented vs. Simulated Features (Honest Disclosure)

| Feature | Implementation Status | Notes / Limitations |
| :--- | :--- | :--- |
| **Workflow State Machine** | Fully Implemented | Strict state transitions across all 4 workflow paths. |
| **Deficiency Return & Resubmit** | Fully Implemented | Captures reasons, updates stages, and logs audit events. |
| **Dynamic Expiry Calculation** | Fully Implemented | Compares actual dates relative to runtime clock. |
| **Escalation Rules (T-30 / T+0 / T+15)** | Fully Implemented | Configurable thresholds; automated SCN draft generation. |
| **Human Sign-Off Requirement** | Fully Implemented | Enforced across statutory LoA and Show-Cause decisions. |
| **SHA-256 Hash Chain Verification** | Fully Implemented | Deterministic SHA-256 implementation with live verification. |
| **CSV Export of Registers** | Fully Implemented | Downloads valid CSV files formatted with standard RFC 4180. |
| **Reset Demo State** | Fully Implemented | Flushes localStorage and re-seeds clean data on demand. |
| **OCR Text Extraction** | Simulated Review Pipeline | Validates file format and size, but extracts pre-mapped OCR metadata for reviewer verification rather than running a 50MB Tesseract binary. |
| **GPS Device Telemetry** | Simulated Field Geo-Tag | Displays simulated coordinates and timestamp; no hardware device GPS used. |
| **AICTE Central Database API** | Isolated Local Prototype | No production credentials or government servers are accessed. |

---

## 9. Regulatory Compliance References

The prototype models key statutory procedures outlined in the **AICTE Approval Process Handbook (APH) 2024-27**:
- **Chapter I:** Grant of Approval through Online Application & Joint Corpus FDR norms.
- **Chapter II:** Expert Visit Committee (EVC) verification of physical infrastructure.
- **Chapter VIII:** Standing Hearing Committee (SHC) & Standing Appellate Committee (SAC) appellate mechanisms.
- **Rights of Persons with Disabilities (RPwD) Act 2016:** Mandatory barrier-free environment.
- **National Building Code (NBC) 2016 Part IV:** Fire safety compliance.
