import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Application, 
  ComplianceDocument, 
  Alert, 
  InspectionRecord, 
  AuditEvent, 
  ApplicationStage, 
  DocumentStatus,
  OcrExtractedData,
  InspectionChecklistItem
} from '../types';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_DOCUMENTS, 
  INITIAL_ALERTS, 
  INITIAL_INSPECTIONS, 
  createInitialAuditTrail 
} from '../data/seedData';
import { calculateEventHashSync } from '../utils/crypto';

interface AppContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  applications: Application[];
  documents: ComplianceDocument[];
  alerts: Alert[];
  inspections: InspectionRecord[];
  auditTrail: AuditEvent[];
  
  // Dynamic helpers
  getDaysRemaining: (expiryDate: string) => number;
  computeDocumentStatus: (doc: ComplianceDocument) => DocumentStatus;
  
  // Actions
  updateApplicationStage: (appId: string, nextStage: ApplicationStage, remarks: string, deficiencyNote?: string) => void;
  submitDeficiencyResponse: (appId: string, responseRemarks: string, rectifiedDocTitle?: string) => void;
  grantFinalDecision: (appId: string, decision: 'APPROVED' | 'REJECTED', remarks: string) => void;
  
  verifyDocument: (docId: string, action: 'VERIFY' | 'REJECT', rejectionReason?: string) => void;
  uploadDocumentWithOcr: (doc: Partial<ComplianceDocument>, ocrData?: OcrExtractedData) => void;
  updateExtractedOcrData: (docId: string, updatedOcr: Partial<OcrExtractedData>, markVerified?: boolean) => void;
  
  updateInspectionItem: (inspId: string, itemId: string, status: InspectionChecklistItem['status'], remarks: string) => void;
  saveInspectionDraft: (inspId: string, remarks: string) => void;
  submitInspectionFindings: (inspId: string, overallScore: number, recommendation: InspectionRecord['recommendation'], summaryRemarks: string) => void;
  
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, resolutionNote: string) => void;
  authorizeShowCauseNotice: (alertId: string, statutoryRemarks: string) => void;
  
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'aace_role_v1',
  APPLICATIONS: 'aace_applications_v1',
  DOCUMENTS: 'aace_documents_v1',
  ALERTS: 'aace_alerts_v1',
  INSPECTIONS: 'aace_inspections_v1',
  AUDIT_TRAIL: 'aace_audit_trail_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'REGIONAL_OFFICER';
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [documents, setDocuments] = useState<ComplianceDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_TRAIL);
    return saved ? JSON.parse(saved) : createInitialAuditTrail();
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_TRAIL, JSON.stringify(auditTrail));
  }, [auditTrail]);

  // Dynamic date calculation
  const getDaysRemaining = (expiryDate: string): number => {
    const exp = new Date(expiryDate).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const computeDocumentStatus = (doc: ComplianceDocument): DocumentStatus => {
    if (doc.verificationStatus === 'REJECTED') return 'REJECTED';
    if (doc.verificationStatus === 'PENDING_VERIFICATION') return 'PENDING_VERIFICATION';

    const days = getDaysRemaining(doc.expiryDate);
    if (days < 0) return 'EXPIRED';
    if (days <= 30) return 'EXPIRING_SOON';
    return 'VALID';
  };

  // Append-only audit logger with deterministic SHA-256 hash chaining
  const logAudit = (
    action: string,
    entityType: AuditEvent['entityType'],
    recordId: string,
    summary: string,
    customActor?: string,
    customRole?: UserRole
  ) => {
    setAuditTrail(prevTrail => {
      const prevHash = prevTrail.length > 0 
        ? prevTrail[prevTrail.length - 1].eventHash 
        : '0000000000000000000000000000000000000000000000000000000000000000';
      
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const actorName = customActor || (
        currentRole === 'INSTITUTION_ADMIN' ? 'Institution Administrator (Registrar)' :
        currentRole === 'REGIONAL_OFFICER' ? 'Regional Officer (NWRO / WRO)' :
        currentRole === 'EVC_INSPECTOR' ? 'EVC Committee Inspector' :
        'Central Director (HQ New Delhi)'
      );

      const hash = calculateEventHashSync(
        prevHash,
        nowStr,
        actorName,
        action,
        recordId,
        summary
      );

      const newEvent: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-6)}`,
        timestamp: nowStr,
        actor: actorName,
        role: customRole || currentRole,
        action,
        entityType,
        recordId,
        summary,
        prevHash,
        eventHash: hash,
        verificationValid: true
      };

      return [...prevTrail, newEvent];
    });
  };

  // Actions
  const updateApplicationStage = (
    appId: string, 
    nextStage: ApplicationStage, 
    remarks: string, 
    deficiencyNote?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const actorName = currentRole === 'REGIONAL_OFFICER' 
      ? 'Regional Scrutiny Officer' 
      : currentRole === 'CENTRAL_DIRECTOR' 
        ? 'Central Director' 
        : 'Officer in Charge';

    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;

      const historyEntry = {
        stage: nextStage,
        timestamp,
        actor: actorName,
        role: currentRole,
        remarks,
        deficiencyNote
      };

      const updated: Application = {
        ...app,
        currentStage: nextStage,
        lastUpdated: new Date().toISOString().split('T')[0],
        stageHistory: [...app.stageHistory, historyEntry],
        deficiencyActive: nextStage === 'DEFICIENCY_RAISED' ? {
          reason: deficiencyNote || remarks,
          raisedAt: timestamp,
          raisedBy: actorName
        } : app.deficiencyActive
      };

      return updated;
    }));

    logAudit(
      nextStage === 'DEFICIENCY_RAISED' ? 'DEFICIENCY_RETURNED' : 'STAGE_TRANSITION',
      'APPLICATION',
      appId,
      `Application ${appId} transitioned to ${nextStage}. Remarks: ${remarks}`
    );
  };

  const submitDeficiencyResponse = (appId: string, responseRemarks: string, rectifiedDocTitle?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;

      const updatedHistory = [...app.stageHistory, {
        stage: 'RESCRUTINY_PENDING' as ApplicationStage,
        timestamp,
        actor: 'Institution Administrator (Registrar)',
        role: 'INSTITUTION_ADMIN' as UserRole,
        remarks: `Deficiency response submitted. Document rectified: ${rectifiedDocTitle || 'Submitted online'}. Notes: ${responseRemarks}`,
        deficiencyResponse: responseRemarks
      }];

      return {
        ...app,
        currentStage: 'RESCRUTINY_PENDING',
        lastUpdated: new Date().toISOString().split('T')[0],
        stageHistory: updatedHistory,
        deficiencyActive: app.deficiencyActive ? {
          ...app.deficiencyActive,
          resolvedAt: timestamp,
          responseRemarks
        } : undefined
      };
    }));

    logAudit(
      'DEFICIENCY_RESPONSE_SUBMITTED',
      'APPLICATION',
      appId,
      `Institution responded to deficiency notice for ${appId}. Response: ${responseRemarks}`
    );
  };

  const grantFinalDecision = (appId: string, decision: 'APPROVED' | 'REJECTED', remarks: string) => {
    const nextStage: ApplicationStage = decision === 'APPROVED' ? 'FINAL_APPROVED' : 'REJECTED';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;

      return {
        ...app,
        currentStage: nextStage,
        lastUpdated: new Date().toISOString().split('T')[0],
        finalDecisionRemarks: remarks,
        stageHistory: [...app.stageHistory, {
          stage: nextStage,
          timestamp,
          actor: 'Dr. Statutory Authority (Central Director)',
          role: 'CENTRAL_DIRECTOR',
          remarks
        }]
      };
    }));

    logAudit(
      decision === 'APPROVED' ? 'STATUTORY_APPROVAL_GRANTED' : 'STATUTORY_APPLICATION_REJECTED',
      'APPLICATION',
      appId,
      `Central Director human statutory decision: ${decision} for ${appId}. Notes: ${remarks}`
    );
  };

  const verifyDocument = (docId: string, action: 'VERIFY' | 'REJECT', rejectionReason?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const actor = currentRole === 'REGIONAL_OFFICER' ? 'Regional Officer' : 'Verification Desk';

    setDocuments(prev => prev.map(d => {
      if (d.id !== docId) return d;
      if (action === 'VERIFY') {
        return {
          ...d,
          verificationStatus: 'VALID',
          verifiedBy: actor,
          verifiedAt: today,
          rejectionReason: undefined
        };
      } else {
        return {
          ...d,
          verificationStatus: 'REJECTED',
          rejectionReason: rejectionReason || 'Failed regulatory compliance norms'
        };
      }
    }));

    logAudit(
      action === 'VERIFY' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      'DOCUMENT',
      docId,
      `Document ${docId} ${action === 'VERIFY' ? 'verified as genuine and compliant' : `rejected: ${rejectionReason}`}`
    );
  };

  const uploadDocumentWithOcr = (docData: Partial<ComplianceDocument>, ocrData?: OcrExtractedData) => {
    const newDocId = `DOC-${Date.now().toString().slice(-4)}`;
    const fullDoc: ComplianceDocument = {
      id: newDocId,
      documentNumber: docData.documentNumber || `REG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      institutionId: docData.institutionId || 'INST-0842',
      institutionName: docData.institutionName || 'Kalinga Institute of Technology & Management, Bhubaneswar',
      type: docData.type || 'Affidavit / Institutional Undertaking',
      issueDate: docData.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: docData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verificationStatus: 'PENDING_VERIFICATION',
      responsibleOfficer: 'Institution Administrator',
      fileName: docData.fileName || 'Uploaded_Document.pdf',
      fileSizeKb: docData.fileSizeKb || 1240,
      extractedOcrData: ocrData,
      ocrVerified: false
    };

    setDocuments(prev => [fullDoc, ...prev]);

    logAudit(
      'DOCUMENT_UPLOADED',
      'DOCUMENT',
      newDocId,
      `New document ${fullDoc.documentNumber} (${fullDoc.type}) uploaded with automated OCR metadata extraction.`
    );
  };

  const updateExtractedOcrData = (docId: string, updatedOcr: Partial<OcrExtractedData>, markVerified = false) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== docId) return d;
      return {
        ...d,
        extractedOcrData: d.extractedOcrData ? {
          ...d.extractedOcrData,
          ...updatedOcr
        } : undefined,
        ocrVerified: markVerified ? true : d.ocrVerified
      };
    }));

    logAudit(
      'OCR_METADATA_UPDATED',
      'DOCUMENT',
      docId,
      `OCR extracted fields audited and verified for document ${docId}. Human correction applied.`
    );
  };

  const updateInspectionItem = (
    inspId: string, 
    itemId: string, 
    status: InspectionChecklistItem['status'], 
    remarks: string
  ) => {
    setInspections(prev => prev.map(insp => {
      if (insp.id !== inspId) return insp;
      const updatedChecklist = insp.checklist.map(item => {
        if (item.id !== itemId) return item;
        return { ...item, status, remarks };
      });
      return { ...insp, checklist: updatedChecklist, status: 'IN_PROGRESS' };
    }));
  };

  const saveInspectionDraft = (inspId: string, remarks: string) => {
    setInspections(prev => prev.map(insp => {
      if (insp.id !== inspId) return insp;
      return { ...insp, summaryRemarks: remarks, status: 'IN_PROGRESS' };
    }));

    logAudit(
      'INSPECTION_DRAFT_SAVED',
      'INSPECTION',
      inspId,
      `EVC inspection draft saved locally by inspector.`
    );
  };

  const submitInspectionFindings = (
    inspId: string, 
    overallScore: number, 
    recommendation: InspectionRecord['recommendation'], 
    summaryRemarks: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let relatedAppId = '';
    setInspections(prev => prev.map(insp => {
      if (insp.id !== inspId) return insp;
      relatedAppId = insp.applicationId;
      return {
        ...insp,
        overallScore,
        recommendation,
        summaryRemarks,
        status: 'REPORT_SUBMITTED',
        submittedAt: timestamp
      };
    }));

    // Update related application timeline & stage
    if (relatedAppId) {
      setApplications(prev => prev.map(app => {
        if (app.id !== relatedAppId) return app;
        return {
          ...app,
          currentStage: 'EVC_REPORT_SUBMITTED',
          lastUpdated: new Date().toISOString().split('T')[0],
          complianceScore: overallScore,
          stageHistory: [
            ...app.stageHistory,
            {
              stage: 'EVC_REPORT_SUBMITTED',
              timestamp,
              actor: 'Dr. B. K. Hegde (EVC Committee Chairman)',
              role: 'EVC_INSPECTOR',
              remarks: `EVC Report submitted with score ${overallScore}/100. Recommendation: ${recommendation}. ${summaryRemarks}`
            }
          ]
        };
      }));
    }

    logAudit(
      'INSPECTION_REPORT_SUBMITTED',
      'INSPECTION',
      inspId,
      `EVC field report submitted with score ${overallScore}/100. Recommendation: ${recommendation}`
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        status: 'ACKNOWLEDGED',
        actionHistory: [
          ...a.actionHistory,
          {
            timestamp,
            actor: currentRole === 'INSTITUTION_ADMIN' ? 'Registrar' : 'Bureau Desk',
            role: currentRole,
            action: 'Alert Acknowledged',
            note: 'Compliance officer flagged alert for active resolution.'
          }
        ]
      };
    }));

    logAudit(
      'ALERT_ACKNOWLEDGED',
      'ALERT',
      alertId,
      `Alert ${alertId} acknowledged by ${currentRole}.`
    );
  };

  const resolveAlert = (alertId: string, resolutionNote: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        status: 'RESOLVED',
        actionHistory: [
          ...a.actionHistory,
          {
            timestamp,
            actor: currentRole === 'REGIONAL_OFFICER' ? 'Regional Officer' : 'Authorized Officer',
            role: currentRole,
            action: 'Alert Resolved',
            note: resolutionNote
          }
        ]
      };
    }));

    logAudit(
      'ALERT_RESOLVED',
      'ALERT',
      alertId,
      `Alert ${alertId} resolved. Resolution note: ${resolutionNote}`
    );
  };

  const authorizeShowCauseNotice = (alertId: string, statutoryRemarks: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId || !a.showCauseNotice) return a;
      return {
        ...a,
        status: 'RESOLVED',
        showCauseNotice: {
          ...a.showCauseNotice,
          status: 'ISSUED_TO_COLLEGE',
          authorizedBy: 'Central Director / Statutory Member Secretary, AICTE HQ',
          authorizedAt: timestamp
        },
        actionHistory: [
          ...a.actionHistory,
          {
            timestamp,
            actor: 'Central Director (HQ New Delhi)',
            role: 'CENTRAL_DIRECTOR',
            action: 'Show Cause Notice Statutory Sign-Off',
            note: `Formally signed and issued to college. Remarks: ${statutoryRemarks}`
          }
        ]
      };
    }));

    logAudit(
      'SHOW_CAUSE_NOTICE_AUTHORIZED',
      'SHOW_CAUSE_NOTICE',
      alertId,
      `Statutory Show-Cause Notice officially authorized by Central Director. Dispatched to college email and portal.`
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_TRAIL);
    localStorage.removeItem(STORAGE_KEYS.ROLE);

    setApplications(INITIAL_APPLICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setAlerts(INITIAL_ALERTS);
    setInspections(INITIAL_INSPECTIONS);
    setAuditTrail(createInitialAuditTrail());
    setCurrentRole('REGIONAL_OFFICER');

    alert('Demo scenario data has been reset to initial prototype state. Ready for fresh evaluation!');
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      setRole: setCurrentRole,
      applications,
      documents,
      alerts,
      inspections,
      auditTrail,
      getDaysRemaining,
      computeDocumentStatus,
      updateApplicationStage,
      submitDeficiencyResponse,
      grantFinalDecision,
      verifyDocument,
      uploadDocumentWithOcr,
      updateExtractedOcrData,
      updateInspectionItem,
      saveInspectionDraft,
      submitInspectionFindings,
      acknowledgeAlert,
      resolveAlert,
      authorizeShowCauseNotice,
      resetDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
