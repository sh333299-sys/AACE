export type UserRole = 
  | 'INSTITUTION_ADMIN' 
  | 'REGIONAL_OFFICER' 
  | 'EVC_INSPECTOR' 
  | 'CENTRAL_DIRECTOR';

export interface UserRoleInfo {
  id: UserRole;
  title: string;
  department: string;
  accessScope: string;
  description: string;
}

export type ApplicationStage = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SCRUTINY_PENDING'
  | 'DEFICIENCY_RAISED'
  | 'RESCRUTINY_PENDING'
  | 'EVC_RECOMMENDED'
  | 'EVC_IN_PROGRESS'
  | 'EVC_REPORT_SUBMITTED'
  | 'SAC_SHC_REVIEW'
  | 'FINAL_APPROVED'
  | 'REJECTED';

export type WorkflowPath = 
  | 'SCRUTINY_ONLY'
  | 'SCRUTINY_EVC'
  | 'EVC_SAC_SHC'
  | 'RE_SCRUTINY';

export type ApplicationType = 
  | 'Extension of Approval (EoA)'
  | 'New Technical Institution'
  | 'Introduction of Supernumerary Seats'
  | 'Variation in Intake / Closure';

export interface StageHistoryItem {
  stage: ApplicationStage;
  timestamp: string;
  actor: string;
  role: UserRole;
  remarks: string;
  deficiencyNote?: string;
  deficiencyResponse?: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  academicYear: string;
  type: ApplicationType;
  submissionDate: string;
  currentStage: ApplicationStage;
  workflowPath: WorkflowPath;
  assignedOfficer: string;
  regionalOffice: string;
  complianceScore: number;
  lastUpdated: string;
  stageHistory: StageHistoryItem[];
  deficiencyActive?: {
    reason: string;
    raisedAt: string;
    raisedBy: string;
    resolvedAt?: string;
    responseRemarks?: string;
  };
  finalDecisionRemarks?: string;
}

export type DocumentType = 
  | 'Land Ownership / Registered Lease Deed'
  | 'Building Completion & Stability Certificate'
  | 'Fire Safety NOC'
  | 'Fixed Deposit Receipt (FDR) / Corpus Fund'
  | 'Affidavit / Institutional Undertaking'
  | 'State Pollution Control Board NOC';

export type DocumentStatus = 
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'PENDING_VERIFICATION'
  | 'REJECTED';

export interface ComplianceDocument {
  id: string;
  documentNumber: string;
  institutionId: string;
  institutionName: string;
  type: DocumentType;
  issueDate: string;
  expiryDate: string; // ISO string
  verificationStatus: DocumentStatus;
  responsibleOfficer: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  fileUrl?: string;
  fileName: string;
  fileSizeKb: number;
  extractedOcrData?: OcrExtractedData;
  ocrVerified?: boolean;
}

export interface OcrExtractedData {
  institutionName: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  landSurveyNumber?: string;
  landAreaAcres?: number;
  financialAmountInLakhs?: number;
  issuingAuthority: string;
  confidenceScore: number;
  flaggedDiscrepancy?: string;
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';

export type AlertType = 
  | 'DOCUMENT_EXPIRING_SOON'
  | 'DOCUMENT_EXPIRED'
  | 'COMPLIANCE_OVERDUE'
  | 'EVC_INSPECTION_PENDING'
  | 'DEFICIENCY_UNRESOLVED'
  | 'SHOW_CAUSE_NOTICE_DRAFT';

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';

export interface Alert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  institutionName: string;
  entityId: string; // Document ID or Application ID
  entityType: 'DOCUMENT' | 'APPLICATION' | 'INSPECTION';
  dueDate: string;
  assignedRole: UserRole;
  status: AlertStatus;
  createdAt: string;
  actionHistory: {
    timestamp: string;
    actor: string;
    role: UserRole;
    action: string;
    note?: string;
  }[];
  showCauseNotice?: {
    noticeNumber: string;
    generatedAt: string;
    statutoryNoticeDraft: string;
    authorizedBy?: string;
    authorizedAt?: string;
    status: 'DRAFT_PENDING_APPROVAL' | 'ISSUED_TO_COLLEGE';
  };
}

export interface InspectionChecklistItem {
  id: string;
  category: 'Instructional Area' | 'Laboratories & IT' | 'Safety & Amenities' | 'Faculty & Cadre';
  itemTitle: string;
  requirementSpec: string;
  status: 'COMPLIANT' | 'DEFICIENT' | 'NOT_APPLICABLE' | 'PENDING';
  remarks: string;
  proofFileName?: string;
}

export interface InspectionRecord {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  regionalOffice: string;
  scheduledDate: string;
  inspectorName: string;
  inspectorRole: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'REPORT_SUBMITTED' | 'VERIFIED_BY_REGIONAL';
  overallScore: number; // 0 - 100
  recommendation: 'RECOMMEND_APPROVAL' | 'DEFICIENCIES_FOUND' | 'REJECT';
  summaryRemarks: string;
  checklist: InspectionChecklistItem[];
  submittedAt?: string;
  geoCoordsSimulated: {
    lat: number;
    lng: number;
    locationName: string;
    deviceTimestamp: string;
  };
  attachments: {
    name: string;
    sizeKb: number;
    category: string;
  }[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  entityType: 'APPLICATION' | 'DOCUMENT' | 'INSPECTION' | 'ALERT' | 'SHOW_CAUSE_NOTICE' | 'SECURITY';
  recordId: string;
  summary: string;
  prevHash: string;
  eventHash: string;
  verificationValid?: boolean;
}
