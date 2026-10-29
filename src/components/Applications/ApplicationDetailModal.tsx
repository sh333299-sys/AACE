import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStage } from '../../types';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  User, 
  Calendar, 
  Building2, 
  FileText, 
  ShieldCheck, 
  Send,
  MessageSquare,
  FileCheck2
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose }) => {
  const { 
    currentRole, 
    updateApplicationStage, 
    submitDeficiencyResponse, 
    grantFinalDecision,
    documents 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'workflow' | 'documents' | 'deficiency'>('workflow');

  // Form states
  const [deficiencyReason, setDeficiencyReason] = useState('');
  const [isRaisingDeficiency, setIsRaisingDeficiency] = useState(false);

  const [deficiencyResponseNote, setDeficiencyResponseNote] = useState('');
  const [selectedRectifiedDoc, setSelectedRectifiedDoc] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const [finalDecisionType, setFinalDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [finalDecisionRemarks, setFinalDecisionRemarks] = useState('');
  const [isTakingFinalDecision, setIsTakingFinalDecision] = useState(false);

  const [scrutinyRemarks, setScrutinyRemarks] = useState('');

  // Workflow stages ordered representation
  const getWorkflowSteps = (app: Application) => {
    switch (app.workflowPath) {
      case 'SCRUTINY_ONLY':
        return [
          { stage: 'SUBMITTED', label: '1. Online Submission' },
          { stage: 'SCRUTINY_PENDING', label: '2. Regional Scrutiny' },
          { stage: 'FINAL_APPROVED', label: '3. Final Statutory Decision' },
        ];
      case 'SCRUTINY_EVC':
        return [
          { stage: 'SUBMITTED', label: '1. Submission' },
          { stage: 'SCRUTINY_PENDING', label: '2. Scrutiny' },
          { stage: 'EVC_RECOMMENDED', label: '3. EVC Inspection' },
          { stage: 'EVC_REPORT_SUBMITTED', label: '4. Visit Findings' },
          { stage: 'FINAL_APPROVED', label: '5. Final Approval' }
        ];
      case 'EVC_SAC_SHC':
        return [
          { stage: 'SUBMITTED', label: '1. Submission' },
          { stage: 'SCRUTINY_PENDING', label: '2. Scrutiny' },
          { stage: 'EVC_IN_PROGRESS', label: '3. EVC Visit' },
          { stage: 'SAC_SHC_REVIEW', label: '4. SAC / SHC Appellate' },
          { stage: 'FINAL_APPROVED', label: '5. Apex Decision' }
        ];
      case 'RE_SCRUTINY':
        return [
          { stage: 'SUBMITTED', label: '1. Submission' },
          { stage: 'DEFICIENCY_RAISED', label: '2. Deficiency Returned' },
          { stage: 'RESCRUTINY_PENDING', label: '3. Re-Scrutiny Desk' },
          { stage: 'FINAL_APPROVED', label: '4. Final Approval' }
        ];
    }
  };

  const steps = getWorkflowSteps(application);

  // Institution related documents
  const relatedDocs = documents.filter(d => d.institutionId === application.institutionId);

  // Handlers
  const handleRaiseDeficiency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deficiencyReason.trim()) {
      alert('Please specify the exact regulatory deficiencies.');
      return;
    }
    updateApplicationStage(
      application.id, 
      'DEFICIENCY_RAISED', 
      'Application returned to institution for rectification of listed non-compliances.',
      deficiencyReason
    );
    setIsRaisingDeficiency(false);
  };

  const handleDeficiencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deficiencyResponseNote.trim()) {
      alert('Please provide detailed response remarks.');
      return;
    }
    submitDeficiencyResponse(application.id, deficiencyResponseNote, selectedRectifiedDoc);
    setIsSubmittingResponse(false);
  };

  const handleRegionalScrutinyPass = () => {
    let next: ApplicationStage = 'FINAL_APPROVED';
    if (application.workflowPath === 'SCRUTINY_EVC') next = 'EVC_RECOMMENDED';
    if (application.workflowPath === 'EVC_SAC_SHC') next = 'SAC_SHC_REVIEW';

    updateApplicationStage(
      application.id,
      next,
      scrutinyRemarks.trim() || 'Regional scrutiny completed successfully. All mandatory APH norms verified.'
    );
    setScrutinyRemarks('');
  };

  const handleCentralDirectorDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalDecisionRemarks.trim()) {
      alert('Statutory decision must include formal recorded grounds/remarks.');
      return;
    }
    grantFinalDecision(application.id, finalDecisionType, finalDecisionRemarks);
    setIsTakingFinalDecision(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-700">
              {application.applicationNumber}
            </span>
            <div>
              <h2 className="text-sm font-bold leading-tight">{application.institutionName}</h2>
              <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{application.type}</span>
                <span>•</span>
                <span>AY: {application.academicYear}</span>
                <span>•</span>
                <span>Workflow: {application.workflowPath.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
              {application.currentStage.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">Assigned: <strong className="text-slate-800">{application.assignedOfficer}</strong></span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Submitted: {application.submissionDate}</span>
            <span>Compliance: <strong className="text-teal-700">{application.complianceScore}%</strong></span>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'workflow' ? 'border-teal-700 text-teal-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workflow & Actions
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'documents' ? 'border-teal-700 text-teal-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Institutional Documents ({relatedDocs.length})
          </button>
          {application.deficiencyActive && (
            <button
              onClick={() => setActiveTab('deficiency')}
              className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deficiency' ? 'border-amber-600 text-amber-900 font-bold' : 'border-transparent text-amber-700 hover:text-amber-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Active Deficiency</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {activeTab === 'workflow' && (
            <>
              {/* Configured Workflow Pipeline Progression */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Configured Workflow Path: {application.workflowPath}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {steps.map((st, idx) => {
                    const isCompleted = application.stageHistory.some(h => h.stage === st.stage) || application.currentStage === st.stage;
                    const isCurrent = application.currentStage === st.stage;
                    return (
                      <div 
                        key={idx}
                        className={`p-2 rounded text-center border text-xs ${
                          isCurrent ? 'bg-teal-700 text-white border-teal-800 shadow-xs font-bold' :
                          isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] uppercase">{isCurrent ? 'Current Stage' : isCompleted ? 'Completed' : 'Pending'}</div>
                        <div className="truncate mt-0.5">{st.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Deficiency Banner if any */}
              {application.deficiencyActive && (
                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Notice of Regulatory Deficiency Returned by Regional Bureau
                    </span>
                    <span className="text-[10px] text-amber-700">Raised: {application.deficiencyActive.raisedAt}</span>
                  </div>
                  <div className="mt-1.5 text-slate-800 bg-white/70 p-2 rounded border border-amber-200 font-mono text-[11px]">
                    {application.deficiencyActive.reason}
                  </div>
                  {currentRole === 'INSTITUTION_ADMIN' && !isSubmittingResponse && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setIsSubmittingResponse(true)}
                        className="px-3 py-1.5 bg-amber-800 text-white font-semibold rounded text-xs hover:bg-amber-900 transition cursor-pointer"
                      >
                        Submit Deficiency Reply & Rectification Proof
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Final Decision Approved Banner */}
              {application.currentStage === 'FINAL_APPROVED' && (
                <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-300 text-emerald-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    Statutory Approval Granted by Central Director
                  </div>
                  <p className="mt-1 text-emerald-800">
                    {application.finalDecisionRemarks || 'Formal statutory Letter of Approval (LoA) generated and signed.'}
                  </p>
                </div>
              )}

              {/* Role Action Station */}
              <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/40">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-800" />
                    <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                      Officer Action Console ({currentRole.replace(/_/g, ' ')})
                    </h3>
                  </div>
                  <span className="text-[10px] text-teal-800 font-semibold bg-white px-2 py-0.5 rounded border border-teal-300">
                    Human Authorization Required
                  </span>
                </div>

                <div className="mt-3">
                  {/* Regional Officer Actions */}
                  {currentRole === 'REGIONAL_OFFICER' && (
                    <div className="space-y-3">
                      {['SCRUTINY_PENDING', 'RESCRUTINY_PENDING'].includes(application.currentStage) ? (
                        <div>
                          <div className="text-xs text-slate-700 mb-2">
                            Review application documents against Approval Process Handbook norms:
                          </div>

                          {!isRaisingDeficiency ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <input 
                                type="text"
                                placeholder="Scrutiny verification remarks..."
                                value={scrutinyRemarks}
                                onChange={(e) => setScrutinyRemarks(e.target.value)}
                                className="flex-1 min-w-[200px] text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                              />
                              <button
                                onClick={handleRegionalScrutinyPass}
                                className="px-3 py-1.5 bg-teal-800 text-white rounded text-xs font-semibold hover:bg-teal-900 transition cursor-pointer"
                              >
                                {application.workflowPath === 'SCRUTINY_EVC' ? 'Pass Scrutiny & Recommend EVC' : 'Pass Scrutiny & Forward'}
                              </button>
                              <button
                                onClick={() => setIsRaisingDeficiency(true)}
                                className="px-3 py-1.5 bg-rose-700 text-white rounded text-xs font-semibold hover:bg-rose-800 transition cursor-pointer"
                              >
                                Return with Deficiency Notice
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleRaiseDeficiency} className="bg-white p-3 rounded border border-rose-300 space-y-2">
                              <div className="text-xs font-bold text-rose-900">
                                Issue Formal Deficiency Notice to Institution:
                              </div>
                              <textarea
                                value={deficiencyReason}
                                onChange={(e) => setDeficiencyReason(e.target.value)}
                                rows={3}
                                placeholder="Detail missing documents, land title defects, faculty shortfall, or FDR discrepancies..."
                                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-rose-600"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsRaisingDeficiency(false)}
                                  className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 text-xs bg-rose-700 text-white font-semibold rounded hover:bg-rose-800 cursor-pointer"
                                >
                                  Dispatch Deficiency Notice
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          No pending regional scrutiny actions for current stage ({application.currentStage}).
                        </div>
                      )}
                    </div>
                  )}

                  {/* Institution Admin Actions */}
                  {currentRole === 'INSTITUTION_ADMIN' && (
                    <div>
                      {application.currentStage === 'DEFICIENCY_RAISED' ? (
                        isSubmittingResponse ? (
                          <form onSubmit={handleDeficiencySubmit} className="bg-white p-3 rounded border border-amber-300 space-y-2">
                            <div className="text-xs font-bold text-amber-900">
                              Submit Compliance Rectification Response:
                            </div>
                            <textarea
                              value={deficiencyResponseNote}
                              onChange={(e) => setDeficiencyResponseNote(e.target.value)}
                              rows={3}
                              placeholder="Describe the corrective action taken, revised faculty appointments, or renewed certificate..."
                              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] text-slate-600">Attached Rectified Doc:</label>
                              <select
                                value={selectedRectifiedDoc}
                                onChange={(e) => setSelectedRectifiedDoc(e.target.value)}
                                className="text-xs p-1 border border-slate-300 rounded bg-white flex-1"
                              >
                                <option value="">Select rectified document from register...</option>
                                {relatedDocs.map(d => (
                                  <option key={d.id} value={d.fileName}>
                                    {d.type} ({d.documentNumber})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsSubmittingResponse(false)}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-teal-800 text-white font-semibold rounded hover:bg-teal-900 cursor-pointer flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Submit for Re-Scrutiny</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setIsSubmittingResponse(true)}
                            className="px-3 py-1.5 bg-amber-800 text-white rounded text-xs font-semibold hover:bg-amber-900 transition cursor-pointer"
                          >
                            Respond to Active Deficiency Notice
                          </button>
                        )
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          Application is under official regulatory review. No direct college actions pending.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Central Director Actions */}
                  {currentRole === 'CENTRAL_DIRECTOR' && (
                    <div>
                      {['SAC_SHC_REVIEW', 'EVC_REPORT_SUBMITTED', 'SCRUTINY_PENDING'].includes(application.currentStage) ? (
                        !isTakingFinalDecision ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-700">
                              Application has cleared committee stages and is in the final decision queue.
                            </span>
                            <button
                              onClick={() => setIsTakingFinalDecision(true)}
                              className="px-3 py-1.5 bg-teal-800 text-white rounded text-xs font-semibold hover:bg-teal-900 transition cursor-pointer"
                            >
                              Open Statutory Decision Form
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleCentralDirectorDecision} className="bg-white p-3 rounded border border-teal-300 space-y-2">
                            <div className="text-xs font-bold text-slate-900">
                              Central Statutory Authority Final Determination:
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="decision"
                                  checked={finalDecisionType === 'APPROVED'}
                                  onChange={() => setFinalDecisionType('APPROVED')}
                                />
                                <span className="text-emerald-800 font-bold">Grant Statutory Approval (Issue LoA)</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="decision"
                                  checked={finalDecisionType === 'REJECTED'}
                                  onChange={() => setFinalDecisionType('REJECTED')}
                                />
                                <span className="text-rose-800 font-bold">Reject Application</span>
                              </label>
                            </div>
                            <textarea
                              value={finalDecisionRemarks}
                              onChange={(e) => setFinalDecisionRemarks(e.target.value)}
                              rows={2}
                              placeholder="Record official statutory reasons and minutes reference (e.g. Approved as per 142nd Executive Committee resolution)..."
                              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsTakingFinalDecision(false)}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 cursor-pointer"
                              >
                                Sign & Record Statutory Decision
                              </button>
                            </div>
                          </form>
                        )
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          Stage '{application.currentStage}' not in Director final decision queue.
                        </div>
                      )}
                    </div>
                  )}

                  {/* EVC Inspector Notice */}
                  {currentRole === 'EVC_INSPECTOR' && (
                    <div className="text-xs text-slate-600">
                      Physical inspection findings can be logged directly in the <strong>EVC Inspections</strong> workspace.
                    </div>
                  )}
                </div>
              </div>

              {/* Stage History & Audit Trail */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Chronological Stage Progression & Decisions
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                  {application.stageHistory.map((item, idx) => (
                    <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.stage.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-400">by</span>
                          <span className="font-medium text-slate-700">{item.actor}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">
                            {item.role}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{item.remarks}</p>
                        {item.deficiencyNote && (
                          <div className="mt-1 text-amber-800 bg-amber-50 p-1.5 rounded text-[11px] font-mono">
                            Deficiency: {item.deficiencyNote}
                          </div>
                        )}
                        {item.deficiencyResponse && (
                          <div className="mt-1 text-teal-800 bg-teal-50 p-1.5 rounded text-[11px] font-mono">
                            College Response: {item.deficiencyResponse}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap sm:text-right">
                        {item.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Mandatory statutory undertakings and legal documents filed by {application.institutionName}:
              </div>
              {relatedDocs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded border text-xs text-slate-500 text-center">
                  No linked documents on record. Upload documents in the Document Compliance register.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {relatedDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{doc.type}</div>
                        <div className="text-[11px] text-slate-500">
                          Doc No: {doc.documentNumber} • File: {doc.fileName} ({doc.fileSizeKb} KB)
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Validity: {doc.issueDate} to {doc.expiryDate}
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
                          doc.verificationStatus === 'VALID' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          doc.verificationStatus === 'EXPIRING_SOON' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          doc.verificationStatus === 'EXPIRED' ? 'bg-red-50 text-red-800 border-red-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {doc.verificationStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'deficiency' && application.deficiencyActive && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300 text-xs text-amber-950">
                <h4 className="font-bold text-sm text-amber-900">Regulatory Deficiency Details</h4>
                <div className="mt-2 space-y-1">
                  <div><strong>Issued By:</strong> {application.deficiencyActive.raisedBy}</div>
                  <div><strong>Date Issued:</strong> {application.deficiencyActive.raisedAt}</div>
                  <div><strong>Deficiency Memo:</strong></div>
                  <div className="p-3 bg-white rounded border border-amber-200 font-mono text-xs text-slate-900 mt-1">
                    {application.deficiencyActive.reason}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Record ID: {application.id}</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium cursor-pointer transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
