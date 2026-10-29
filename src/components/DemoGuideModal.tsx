import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  X, 
  PlayCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileText,
  UserCheck,
  Printer,
  Download
} from 'lucide-react';

interface DemoGuideModalProps {
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ onClose, onNavigateToTab }) => {
  const { setRole, currentRole } = useApp();

  const handlePrintPdf = () => {
    window.open('/script_to_pdf.html', '_blank');
  };

  const demoSteps = [
    {
      step: '1',
      title: 'Operational Overview & Live Metric Auditing',
      role: 'REGIONAL_OFFICER' as UserRole,
      roleName: 'Regional Officer',
      actionPrompt: 'Observe that counts for Total Applications, Pending Scrutiny, Deficiencies, and Expiring Documents are calculated dynamically from underlying records, not hardcoded mock numbers.',
      clickAction: () => {
        setRole('REGIONAL_OFFICER');
        onNavigateToTab('dashboard');
        onClose();
      },
      actionBtnLabel: 'Go to Dashboard'
    },
    {
      step: '2',
      title: 'Application Scrutiny & Deficiency Return',
      role: 'REGIONAL_OFFICER' as UserRole,
      roleName: 'Regional Officer',
      actionPrompt: 'Open application APP-2026-001 (Kalinga Institute) in Scrutiny Pending. Click "Inspect" to see its configured workflow path (SCRUTINY_ONLY). Review documents or return with deficiency note.',
      clickAction: () => {
        setRole('REGIONAL_OFFICER');
        onNavigateToTab('applications');
        onClose();
      },
      actionBtnLabel: 'Open Application Register'
    },
    {
      step: '3',
      title: 'College Deficiency Response & Re-Scrutiny Cycle',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Institution Administrator',
      actionPrompt: 'Switch role to Institution Admin. Notice application APP-2026-002 (Dr. A.P.J. Abdul Kalam Technical Campus) is returned with an active deficiency memo. Click "Inspect" -> "Submit Deficiency Reply & Rectification Proof" to transition it to Re-Scrutiny!',
      clickAction: () => {
        setRole('INSTITUTION_ADMIN');
        onNavigateToTab('applications');
        onClose();
      },
      actionBtnLabel: 'Switch to College Role'
    },
    {
      step: '4',
      title: 'Expiring Document Alert & OCR Review',
      role: 'REGIONAL_OFFICER' as UserRole,
      roleName: 'Regional Officer',
      actionPrompt: 'Go to Document Compliance register. Notice Fire Safety NOC (DOC-101) expiring in 18 days (amber warning) and Corpus FDR (DOC-102) expired 16 days ago. Click "OCR Audit" to test side-by-side verification and discrepancy flagging.',
      clickAction: () => {
        setRole('REGIONAL_OFFICER');
        onNavigateToTab('documents');
        onClose();
      },
      actionBtnLabel: 'Open Document Register'
    },
    {
      step: '5',
      title: 'EVC On-Site Physical Inspection Checklist',
      role: 'EVC_INSPECTOR' as UserRole,
      roleName: 'EVC Inspector',
      actionPrompt: 'Switch role to EVC Inspector. Open Sahyadri College inspection. Complete classroom, laboratory, and fire safety checklist items. View simulated GPS coordinates and submit final findings to update application pipeline!',
      clickAction: () => {
        setRole('EVC_INSPECTOR');
        onNavigateToTab('inspections');
        onClose();
      },
      actionBtnLabel: 'Switch to EVC Inspector'
    },
    {
      step: '6',
      title: 'T+15 Draft Show-Cause Notice & Statutory Sign-off',
      role: 'CENTRAL_DIRECTOR' as UserRole,
      roleName: 'Central Director',
      actionPrompt: 'Switch role to Central Director. Open Alerts & Escalation. Notice critical T+15 breach for expired FDR. Click "Review Draft Notice" -> inspect legal text -> sign and formally authorize issuance to the college!',
      clickAction: () => {
        setRole('CENTRAL_DIRECTOR');
        onNavigateToTab('alerts');
        onClose();
      },
      actionBtnLabel: 'Switch to Central Director'
    },
    {
      step: '7',
      title: 'Cryptographic Audit Trail & Hash Integrity Check',
      role: 'CENTRAL_DIRECTOR' as UserRole,
      roleName: 'Central Director',
      actionPrompt: 'Navigate to Audit Trail. View the chronological append-only record of all actions taken in the demo. Click "Verify Cryptographic Chain" to run deterministic SHA-256 validation across all blocks!',
      clickAction: () => {
        onNavigateToTab('audit');
        onClose();
      },
      actionBtnLabel: 'Verify Audit Trail'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold">SIH 2026: 3-Minute Live Evaluation Script</h2>
              <p className="text-[11px] text-slate-300">Problem Statement ID: SIH26262 — AACE Prototype Walkthrough</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              title="Open print-ready PDF view"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-teal-800 hover:bg-teal-700 text-white rounded cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">Judge Presentation Note: </span>
              <span>
                Follow these 7 sequential steps to showcase the complete statutory workflow.
              </span>
            </div>
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-900 bg-white hover:bg-teal-100 border border-teal-300 rounded cursor-pointer shrink-0"
            >
              <Download className="w-3 h-3 text-teal-700" />
              <span>Open PDF Script</span>
            </button>
          </div>

          <div className="space-y-3">
            {demoSteps.map(st => (
              <div key={st.step} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 hover:bg-slate-100/60 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      {st.step}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{st.title}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-semibold">
                    Role: {st.roleName}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {st.actionPrompt}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={st.clickAction}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded cursor-pointer transition"
                  >
                    <span>{st.actionBtnLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Clicking any step automatically updates the role and context</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-3 py-1.5 text-xs text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 rounded font-semibold cursor-pointer transition flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
