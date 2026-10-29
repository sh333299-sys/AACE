import { Application, ComplianceDocument, Alert, InspectionRecord, AuditEvent, UserRoleInfo } from '../types';
import { calculateEventHashSync } from '../utils/crypto';

export const USER_ROLES: UserRoleInfo[] = [
  {
    id: 'INSTITUTION_ADMIN',
    title: 'Institution Administrator',
    department: 'Campus Administration / Registrar',
    accessScope: 'Institutional Portal',
    description: 'Manages college profile, submits compliance records, uploads undertakings, and responds to deficiencies.'
  },
  {
    id: 'REGIONAL_OFFICER',
    title: 'Regional Officer (NWRO / WRO)',
    department: 'AICTE Regional Bureau',
    accessScope: 'Regional Jurisdiction',
    description: 'Performs document scrutiny, issues deficiency notices, assigns EVC inspections, and verifies submissions.'
  },
  {
    id: 'EVC_INSPECTOR',
    title: 'Expert Visit Committee (EVC) Inspector',
    department: 'Inspection Committee Panel',
    accessScope: 'Field Inspection Panel',
    description: 'Conducts on-site / hybrid facility verifications, checks physical infrastructure specs, and submits visit reports.'
  },
  {
    id: 'CENTRAL_DIRECTOR',
    title: 'Central Director / Statutory Officer',
    department: 'AICTE HQ Approval Bureau, New Delhi',
    accessScope: 'Apex Statutory Level',
    description: 'Reviews SAC/SHC recommendations, authorizes statutory show-cause notices, and grants final statutory approval.'
  }
];

// Helper to compute date relative to now
const now = new Date();
const daysOffset = (days: number): string => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'APP-2026-001',
    applicationNumber: 'AICTE/2026/NW/1-98432101',
    institutionId: 'INST-0842',
    institutionName: 'Kalinga Institute of Technology & Management, Bhubaneswar',
    academicYear: '2026-27',
    type: 'Extension of Approval (EoA)',
    submissionDate: daysOffset(-5),
    currentStage: 'SCRUTINY_PENDING',
    workflowPath: 'SCRUTINY_ONLY',
    assignedOfficer: 'Dr. R. K. Verma (Regional Officer - NWRO)',
    regionalOffice: 'North-Western Regional Office, Chandigarh',
    complianceScore: 92,
    lastUpdated: daysOffset(-1),
    stageHistory: [
      {
        stage: 'DRAFT',
        timestamp: `${daysOffset(-12)} 10:30:00`,
        actor: 'Dr. Suresh Mohapatra (Registrar)',
        role: 'INSTITUTION_ADMIN',
        remarks: 'Application drafted and mandatory documents assembled.'
      },
      {
        stage: 'SUBMITTED',
        timestamp: `${daysOffset(-5)} 16:45:00`,
        actor: 'Dr. Suresh Mohapatra (Registrar)',
        role: 'INSTITUTION_ADMIN',
        remarks: 'Submitted with institutional affidavit and regulatory processing fees.'
      },
      {
        stage: 'SCRUTINY_PENDING',
        timestamp: `${daysOffset(-4)} 09:15:00`,
        actor: 'System Automation Dispatcher',
        role: 'REGIONAL_OFFICER',
        remarks: 'Assigned to Regional Scrutiny Committee Queue for verification.'
      }
    ]
  },
  {
    id: 'APP-2026-002',
    applicationNumber: 'AICTE/2026/NR/1-44781923',
    institutionId: 'INST-0519',
    institutionName: 'Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow',
    academicYear: '2026-27',
    type: 'Variation in Intake / Closure',
    submissionDate: daysOffset(-14),
    currentStage: 'DEFICIENCY_RAISED',
    workflowPath: 'RE_SCRUTINY',
    assignedOfficer: 'Smt. Ananya Trivedi (Regional Officer - NRO)',
    regionalOffice: 'Northern Regional Office, Kanpur',
    complianceScore: 74,
    lastUpdated: daysOffset(-2),
    deficiencyActive: {
      reason: '1. Faculty cadre ratio in Computer Science Dept is below 1:20 norm. 2. Fire Safety Certificate endorsement from Municipal Chief Fire Officer expired/missing renewal seal.',
      raisedAt: `${daysOffset(-3)} 14:10:00`,
      raisedBy: 'Smt. Ananya Trivedi (Regional Officer - NRO)'
    },
    stageHistory: [
      {
        stage: 'SUBMITTED',
        timestamp: `${daysOffset(-14)} 11:20:00`,
        actor: 'Prof. V. N. Pandey (Director)',
        role: 'INSTITUTION_ADMIN',
        remarks: 'Intake expansion proposal for AI & Data Science B.Tech program.'
      },
      {
        stage: 'SCRUTINY_PENDING',
        timestamp: `${daysOffset(-10)} 15:00:00`,
        actor: 'Smt. Ananya Trivedi',
        role: 'REGIONAL_OFFICER',
        remarks: 'Commenced preliminary document scrutiny.'
      },
      {
        stage: 'DEFICIENCY_RAISED',
        timestamp: `${daysOffset(-3)} 14:10:00`,
        actor: 'Smt. Ananya Trivedi',
        role: 'REGIONAL_OFFICER',
        remarks: 'Returned for rectification. Awaiting revised compliance documents within 15 calendar days.',
        deficiencyNote: 'Cadre ratio deficient in CSE department; Municipal Fire Safety NOC renewal receipt pending.'
      }
    ]
  },
  {
    id: 'APP-2026-003',
    applicationNumber: 'AICTE/2026/SW/1-63201948',
    institutionId: 'INST-1120',
    institutionName: 'Sahyadri College of Engineering & Research, Mangaluru',
    academicYear: '2026-27',
    type: 'New Technical Institution',
    submissionDate: daysOffset(-22),
    currentStage: 'EVC_RECOMMENDED',
    workflowPath: 'SCRUTINY_EVC',
    assignedOfficer: 'Dr. B. K. Hegde (EVC Committee Chairman)',
    regionalOffice: 'South-Western Regional Office, Bengaluru',
    complianceScore: 88,
    lastUpdated: daysOffset(-1),
    stageHistory: [
      {
        stage: 'SUBMITTED',
        timestamp: `${daysOffset(-22)} 09:30:00`,
        actor: 'Sri Manjunath Bhat (Secretary)',
        role: 'INSTITUTION_ADMIN',
        remarks: 'New Polytechnic & Engineering campus proposal in Dakshina Kannada.'
      },
      {
        stage: 'SCRUTINY_PENDING',
        timestamp: `${daysOffset(-18)} 11:00:00`,
        actor: 'Sri T. Ramesh (Regional Officer - SWRO)',
        role: 'REGIONAL_OFFICER',
        remarks: 'Primary land titles and FDR verified satisfactorily.'
      },
      {
        stage: 'EVC_RECOMMENDED',
        timestamp: `${daysOffset(-5)} 17:20:00`,
        actor: 'Sri T. Ramesh (Regional Officer - SWRO)',
        role: 'REGIONAL_OFFICER',
        remarks: 'Physical verification required as per APH 2026-27 Chapter II guidelines.'
      }
    ]
  },
  {
    id: 'APP-2026-004',
    applicationNumber: 'AICTE/2026/WRO/1-77192804',
    institutionId: 'INST-0312',
    institutionName: 'Vidyapeeth Institute of Technology, Pune',
    academicYear: '2026-27',
    type: 'Introduction of Supernumerary Seats',
    submissionDate: daysOffset(-40),
    currentStage: 'FINAL_APPROVED',
    workflowPath: 'EVC_SAC_SHC',
    assignedOfficer: 'Dr. Hemant Kulkarni (Adviser-I, AICTE HQ)',
    regionalOffice: 'Western Regional Office, Mumbai',
    complianceScore: 98,
    lastUpdated: daysOffset(-8),
    finalDecisionRemarks: 'Statutory approval granted for 30 FN/PIO and 15 TFW supernumerary seats post SAC/SHC review.',
    stageHistory: [
      {
        stage: 'SUBMITTED',
        timestamp: `${daysOffset(-40)} 10:00:00`,
        actor: 'Dr. Milind Joshi (Principal)',
        role: 'INSTITUTION_ADMIN',
        remarks: 'Supernumerary seat allocation request.'
      },
      {
        stage: 'SCRUTINY_PENDING',
        timestamp: `${daysOffset(-35)} 14:00:00`,
        actor: 'WRO Scrutiny Officer',
        role: 'REGIONAL_OFFICER',
        remarks: 'NBA accreditation records verified.'
      },
      {
        stage: 'EVC_IN_PROGRESS',
        timestamp: `${daysOffset(-25)} 11:30:00`,
        actor: 'Prof. S. R. Patil (EVC Head)',
        role: 'EVC_INSPECTOR',
        remarks: 'On-site physical inspection completed with 96/100 score.'
      },
      {
        stage: 'SAC_SHC_REVIEW',
        timestamp: `${daysOffset(-14)} 16:00:00`,
        actor: 'Standing Hearing Committee',
        role: 'CENTRAL_DIRECTOR',
        remarks: 'Recommended for approval by Standing Appellate Committee.'
      },
      {
        stage: 'FINAL_APPROVED',
        timestamp: `${daysOffset(-8)} 18:30:00`,
        actor: 'Dr. Hemant Kulkarni (Adviser-I)',
        role: 'CENTRAL_DIRECTOR',
        remarks: 'Statutory Letter of Approval (LoA) generated and signed.'
      }
    ]
  }
];

export const INITIAL_DOCUMENTS: ComplianceDocument[] = [
  {
    id: 'DOC-101',
    documentNumber: 'FIRE-NOC/2025/OD-8819',
    institutionId: 'INST-0842',
    institutionName: 'Kalinga Institute of Technology & Management, Bhubaneswar',
    type: 'Fire Safety NOC',
    issueDate: daysOffset(-347),
    expiryDate: daysOffset(18), // Expiring in 18 days! (Amber warning)
    verificationStatus: 'EXPIRING_SOON',
    responsibleOfficer: 'Dr. Suresh Mohapatra (Registrar)',
    fileName: 'Kalinga_FireSafety_NOC_Renewal.pdf',
    fileSizeKb: 1420,
    extractedOcrData: {
      institutionName: 'Kalinga Institute of Technology & Management',
      documentNumber: 'FIRE-NOC/2025/OD-8819',
      issueDate: daysOffset(-347),
      expiryDate: daysOffset(18),
      issuingAuthority: 'Directorate of Fire & Emergency Services, Odisha',
      confidenceScore: 94
    },
    ocrVerified: true
  },
  {
    id: 'DOC-102',
    documentNumber: 'FDR-SBI/2021/7740192',
    institutionId: 'INST-0519',
    institutionName: 'Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow',
    type: 'Fixed Deposit Receipt (FDR) / Corpus Fund',
    issueDate: daysOffset(-1841),
    expiryDate: daysOffset(-16), // Expired 16 days ago! (Critical red alert & Show-cause eligible)
    verificationStatus: 'EXPIRED',
    responsibleOfficer: 'Prof. V. N. Pandey (Director)',
    fileName: 'FDR_Joint_Corpus_Rs35Lakh.pdf',
    fileSizeKb: 980,
    extractedOcrData: {
      institutionName: 'Dr. A.P.J. Abdul Kalam Technical Campus',
      documentNumber: 'FDR-SBI/2021/7740192',
      issueDate: daysOffset(-1841),
      expiryDate: daysOffset(-16),
      financialAmountInLakhs: 35.0,
      issuingAuthority: 'State Bank of India, Hazratganj Branch, Lucknow',
      confidenceScore: 89,
      flaggedDiscrepancy: 'FDR matured on scheduled date; rollover lien endorsement receipt missing.'
    },
    ocrVerified: true
  },
  {
    id: 'DOC-103',
    documentNumber: 'PWD/BLDG/2024/KA-902',
    institutionId: 'INST-1120',
    institutionName: 'Sahyadri College of Engineering & Research, Mangaluru',
    type: 'Building Completion & Stability Certificate',
    issueDate: daysOffset(-60),
    expiryDate: daysOffset(1035),
    verificationStatus: 'PENDING_VERIFICATION',
    responsibleOfficer: 'Sri Manjunath Bhat (Secretary)',
    fileName: 'Sahyadri_BlockC_StructuralStability.pdf',
    fileSizeKb: 3120,
    extractedOcrData: {
      institutionName: 'Sahyadri College of Engineering & Research',
      documentNumber: 'PWD/BLDG/2024/KA-902',
      issueDate: daysOffset(-60),
      expiryDate: daysOffset(1035),
      landAreaAcres: 12.4,
      issuingAuthority: 'Chief Engineer, PWD Karnataka State',
      confidenceScore: 91
    },
    ocrVerified: false
  },
  {
    id: 'DOC-104',
    documentNumber: 'DEED-REG/2018/MAH-4410',
    institutionId: 'INST-0312',
    institutionName: 'Vidyapeeth Institute of Technology, Pune',
    type: 'Land Ownership / Registered Lease Deed',
    issueDate: daysOffset(-2800),
    expiryDate: daysOffset(10800), // 30-year lease
    verificationStatus: 'VALID',
    responsibleOfficer: 'Dr. Milind Joshi (Principal)',
    verifiedBy: 'Smt. P. Deshmukh (WRO Officer)',
    verifiedAt: daysOffset(-35),
    fileName: 'Vidyapeeth_Registered_30Yr_LeaseDeed.pdf',
    fileSizeKb: 4500,
    extractedOcrData: {
      institutionName: 'Vidyapeeth Institute of Technology',
      documentNumber: 'DEED-REG/2018/MAH-4410',
      issueDate: daysOffset(-2800),
      expiryDate: daysOffset(10800),
      landSurveyNumber: 'Gat No. 142/A & 143/B, Haveli, Pune',
      landAreaAcres: 15.2,
      issuingAuthority: 'Sub-Registrar of Assurances, Pune',
      confidenceScore: 98
    },
    ocrVerified: true
  },
  {
    id: 'DOC-105',
    documentNumber: 'PCB-CONSENT/2025/OD-402',
    institutionId: 'INST-0842',
    institutionName: 'Kalinga Institute of Technology & Management, Bhubaneswar',
    type: 'State Pollution Control Board NOC',
    issueDate: daysOffset(-180),
    expiryDate: daysOffset(550),
    verificationStatus: 'VALID',
    responsibleOfficer: 'Dr. Suresh Mohapatra (Registrar)',
    verifiedBy: 'Dr. R. K. Verma (NWRO)',
    verifiedAt: daysOffset(-15),
    fileName: 'OSPCB_Consent_to_Operate_2025.pdf',
    fileSizeKb: 1250,
    ocrVerified: true
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-3001',
    alertType: 'DOCUMENT_EXPIRING_SOON',
    severity: 'WARNING',
    title: 'Fire Safety NOC Expiring in 18 Days (T-30 Policy Trigger)',
    institutionName: 'Kalinga Institute of Technology & Management, Bhubaneswar',
    entityId: 'DOC-101',
    entityType: 'DOCUMENT',
    dueDate: daysOffset(18),
    assignedRole: 'INSTITUTION_ADMIN',
    status: 'OPEN',
    createdAt: daysOffset(-12),
    actionHistory: [
      {
        timestamp: `${daysOffset(-12)} 08:00:00`,
        actor: 'AACE Scheduled Compliance Engine',
        role: 'INSTITUTION_ADMIN',
        action: 'T-30 Escalation Triggered',
        note: 'Automated notice sent to college registrar for municipal renewal upload.'
      }
    ]
  },
  {
    id: 'ALT-3002',
    alertType: 'SHOW_CAUSE_NOTICE_DRAFT',
    severity: 'CRITICAL',
    title: 'Statutory Non-Compliance: Corpus FDR Expired 16 Days Ago (T+15 Escalation Trigger)',
    institutionName: 'Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow',
    entityId: 'DOC-102',
    entityType: 'DOCUMENT',
    dueDate: daysOffset(-1),
    assignedRole: 'CENTRAL_DIRECTOR',
    status: 'ESCALATED',
    createdAt: daysOffset(-16),
    actionHistory: [
      {
        timestamp: `${daysOffset(-16)} 00:01:00`,
        actor: 'AACE Engine',
        role: 'REGIONAL_OFFICER',
        action: 'T+0 Overdue Breach Recorded',
        note: 'Document reached maturity without renewed endorsement.'
      },
      {
        timestamp: `${daysOffset(-1)} 09:30:00`,
        actor: 'AACE Engine Escalation Policy',
        role: 'CENTRAL_DIRECTOR',
        action: 'T+15 Threshold Exceeded',
        note: 'Draft Show-Cause Notice formulated for Central Director statutory review.'
      }
    ],
    showCauseNotice: {
      noticeNumber: 'AICTE/SCN/2026/NR-CORPUS/092',
      generatedAt: `${daysOffset(-1)} 09:30:00`,
      status: 'DRAFT_PENDING_APPROVAL',
      statutoryNoticeDraft: `SHOW CAUSE NOTICE UNDER AICTE REGULATION 2026
Reference: Joint Corpus Fixed Deposit Receipt No. FDR-SBI/2021/7740192 (Rs. 35.0 Lakhs).

WHEREAS Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow was mandated under Chapter I of the Approval Process Handbook to maintain an active joint fixed deposit lien with AICTE;
AND WHEREAS the said deposit matured on ${daysOffset(-16)} and the college failed to submit proof of rollover / encashment protection despite automated reminders;
NOW THEREFORE the Institution is hereby called upon to show cause within seven (7) days of receipt of this notice why approval for academic session 2026-27 should not be placed under the 'No Admission' category or intake curtailed.

(Draft pending statutory sign-off by Central Director / Competent Authority)`
    }
  },
  {
    id: 'ALT-3003',
    alertType: 'EVC_INSPECTION_PENDING',
    severity: 'WARNING',
    title: 'EVC Committee Visit Scheduled within 48 Hours',
    institutionName: 'Sahyadri College of Engineering & Research, Mangaluru',
    entityId: 'APP-2026-003',
    entityType: 'INSPECTION',
    dueDate: daysOffset(2),
    assignedRole: 'EVC_INSPECTOR',
    status: 'ACKNOWLEDGED',
    createdAt: daysOffset(-3),
    actionHistory: [
      {
        timestamp: `${daysOffset(-3)} 11:15:00`,
        actor: 'SWRO Regional Office',
        role: 'REGIONAL_OFFICER',
        action: 'Assigned inspection committee and notified chairman.'
      },
      {
        timestamp: `${daysOffset(-2)} 15:40:00`,
        actor: 'Dr. B. K. Hegde',
        role: 'EVC_INSPECTOR',
        action: 'Acknowledged visit schedule and verified committee member availability.'
      }
    ]
  }
];

export const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'INSP-401',
    applicationId: 'APP-2026-003',
    applicationNumber: 'AICTE/2026/SW/1-63201948',
    institutionName: 'Sahyadri College of Engineering & Research, Mangaluru',
    regionalOffice: 'South-Western Regional Office, Bengaluru',
    scheduledDate: daysOffset(1),
    inspectorName: 'Dr. B. K. Hegde (Professor, NITK Surathkal - EVC Convenor)',
    inspectorRole: 'EVC Committee Chairman',
    status: 'SCHEDULED',
    overallScore: 0,
    recommendation: 'RECOMMEND_APPROVAL',
    summaryRemarks: '',
    geoCoordsSimulated: {
      lat: 12.8681,
      lng: 74.8789,
      locationName: 'Adyar Campus, Mangaluru, Karnataka 575007',
      deviceTimestamp: `${daysOffset(0)} 10:15:22`
    },
    checklist: [
      {
        id: 'CHK-1',
        category: 'Instructional Area',
        itemTitle: 'Adequate Classroom Carpet Area (min 66 sq.m per class)',
        requirementSpec: 'APH 2026 Norm: Min 12 smart classrooms with ceiling projectors & dual display screens.',
        status: 'PENDING',
        remarks: ''
      },
      {
        id: 'CHK-2',
        category: 'Laboratories & IT',
        itemTitle: 'Computer Lab Workstation Ratio & Bandwidth Leased Line',
        requirementSpec: 'Min 1 workstation per 4 students, 1 Gbps dedicated 1:1 uncompressed OFC leased line.',
        status: 'PENDING',
        remarks: ''
      },
      {
        id: 'CHK-3',
        category: 'Safety & Amenities',
        itemTitle: 'Barrier-Free Physical Environment (Ramps, Lifts, Braille Signage)',
        requirementSpec: 'RPwD Act 2016 compliance: Dedicated disabled washroom and wheelchair ramp on all blocks.',
        status: 'PENDING',
        remarks: ''
      },
      {
        id: 'CHK-4',
        category: 'Safety & Amenities',
        itemTitle: 'Fire Fighting System (Wet Risers, Sprinklers & Hose Reels)',
        requirementSpec: 'National Building Code (NBC) 2016 Part IV certified active fire hydrant layout.',
        status: 'PENDING',
        remarks: ''
      },
      {
        id: 'CHK-5',
        category: 'Faculty & Cadre',
        itemTitle: 'Faculty Cadre Ratio (1:2:6 Prof / Assoc Prof / Asst Prof)',
        requirementSpec: 'Norm: 100% faculty approved by affiliating University with valid Form-16 tax records.',
        status: 'PENDING',
        remarks: ''
      }
    ],
    attachments: []
  }
];

// Helper to seed initial audit chain
export function createInitialAuditTrail(): AuditEvent[] {
  const seedEvents: Array<Omit<AuditEvent, 'prevHash' | 'eventHash'>> = [
    {
      id: 'AUD-001',
      timestamp: `${daysOffset(-45)} 10:00:00`,
      actor: 'System Genesis Block',
      role: 'CENTRAL_DIRECTOR',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'SECURITY',
      recordId: 'SYS-AACE-2026',
      summary: 'AACE Core Engine initialized with Approval Process Handbook 2026-27 statutory rules.'
    },
    {
      id: 'AUD-002',
      timestamp: `${daysOffset(-40)} 10:02:15`,
      actor: 'Dr. Milind Joshi (Principal)',
      role: 'INSTITUTION_ADMIN',
      action: 'APPLICATION_SUBMITTED',
      entityType: 'APPLICATION',
      recordId: 'APP-2026-004',
      summary: 'Submitted Supernumerary Seats expansion request with NBA Accreditation certificates.'
    },
    {
      id: 'AUD-003',
      timestamp: `${daysOffset(-25)} 11:30:00`,
      actor: 'Prof. S. R. Patil (EVC Head)',
      role: 'EVC_INSPECTOR',
      action: 'INSPECTION_SUBMITTED',
      entityType: 'INSPECTION',
      recordId: 'INSP-PUNE-392',
      summary: 'Completed physical verification; awarded 96/100 score for instructional infrastructure.'
    },
    {
      id: 'AUD-004',
      timestamp: `${daysOffset(-8)} 18:30:00`,
      actor: 'Dr. Hemant Kulkarni (Adviser-I)',
      role: 'CENTRAL_DIRECTOR',
      action: 'FINAL_APPROVAL_GRANTED',
      entityType: 'APPLICATION',
      recordId: 'APP-2026-004',
      summary: 'Human statutory approval granted for Vidyapeeth Institute of Technology supernumerary intake.'
    },
    {
      id: 'AUD-005',
      timestamp: `${daysOffset(-3)} 14:10:00`,
      actor: 'Smt. Ananya Trivedi (Regional Officer)',
      role: 'REGIONAL_OFFICER',
      action: 'DEFICIENCY_ISSUED',
      entityType: 'APPLICATION',
      recordId: 'APP-2026-002',
      summary: 'Returned Dr. A.P.J. Abdul Kalam Technical Campus application due to deficient CSE faculty ratio.'
    },
    {
      id: 'AUD-006',
      timestamp: `${daysOffset(-1)} 09:30:00`,
      actor: 'AACE Automated Escalation Policy',
      role: 'CENTRAL_DIRECTOR',
      action: 'SHOW_CAUSE_DRAFTED',
      entityType: 'SHOW_CAUSE_NOTICE',
      recordId: 'ALT-3002',
      summary: 'T+15 days milestone reached for expired FDR-SBI/2021/7740192; draft statutory show-cause notice generated.'
    }
  ];

  let currentPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const finalAuditEvents: AuditEvent[] = [];

  for (const item of seedEvents) {
    const hash = calculateEventHashSync(
      currentPrevHash,
      item.timestamp,
      item.actor,
      item.action,
      item.recordId,
      item.summary
    );

    finalAuditEvents.push({
      ...item,
      prevHash: currentPrevHash,
      eventHash: hash,
      verificationValid: true
    });

    currentPrevHash = hash;
  }

  return finalAuditEvents;
}
