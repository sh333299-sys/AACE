import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplianceDocument, DocumentStatus } from '../../types';
import { DocumentUploadModal } from './DocumentUploadModal';
import { OcrReviewModal } from './OcrReviewModal';
import { downloadCsv } from '../../utils/exportCsv';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Scan, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  FileText,
  AlertTriangle,
  Building2
} from 'lucide-react';

export const DocumentRegister: React.FC = () => {
  const { 
    documents, 
    currentRole, 
    getDaysRemaining, 
    computeDocumentStatus, 
    verifyDocument 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedOcrDoc, setSelectedOcrDoc] = useState<ComplianceDocument | null>(null);

  // Rejection modal state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const computedStatus = computeDocumentStatus(doc);

      const matchesSearch = 
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'EXPIRING_SOON' && computedStatus === 'EXPIRING_SOON') ||
        (statusFilter === 'EXPIRED' && computedStatus === 'EXPIRED') ||
        (statusFilter === 'VALID' && computedStatus === 'VALID') ||
        (statusFilter === 'PENDING_VERIFICATION' && doc.verificationStatus === 'PENDING_VERIFICATION');

      const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchQuery, statusFilter, typeFilter, computeDocumentStatus]);

  const handleExportCsv = () => {
    const exportData = filteredDocs.map(d => {
      const days = getDaysRemaining(d.expiryDate);
      return {
        'Document ID': d.id,
        'Document Type': d.type,
        'Registration No': d.documentNumber,
        'Institution Name': d.institutionName,
        'Issue Date': d.issueDate,
        'Expiry Date': d.expiryDate,
        'Days Remaining': days,
        'Verification Status': computeDocumentStatus(d),
        'Responsible Officer': d.responsibleOfficer,
        'Verified By': d.verifiedBy || 'Pending',
        'Verified At': d.verifiedAt || 'Pending'
      };
    });
    downloadCsv(exportData, 'AICTE_Document_Compliance_Register');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId || !rejectionReason.trim()) {
      alert('Please state statutory non-compliance grounds for rejection.');
      return;
    }
    verifyDocument(rejectingDocId, 'REJECT', rejectionReason);
    setRejectingDocId(null);
    setRejectionReason('');
  };

  const getStatusBadge = (doc: ComplianceDocument) => {
    const computed = computeDocumentStatus(doc);
    const days = getDaysRemaining(doc.expiryDate);

    if (computed === 'REJECTED') {
      return (
        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    }

    if (doc.verificationStatus === 'PENDING_VERIFICATION') {
      return (
        <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Pending Check</span>
        </span>
      );
    }

    if (computed === 'EXPIRED') {
      return (
        <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-600" />
          <span>Expired ({Math.abs(days)}d ago)</span>
        </span>
      );
    }

    if (computed === 'EXPIRING_SOON') {
      return (
        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Expiring Soon ({days}d)</span>
        </span>
      );
    }

    return (
      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Valid ({days}d)</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Statutory Document Compliance Register</h2>
          <p className="text-xs text-slate-500">
            Real-time validity monitoring for land deeds, fire safety NOCs, structural stability, and financial corpus FDRs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by registration number or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Document Statuses</option>
            <option value="EXPIRING_SOON">Expiring Soon (≤ 30 Days)</option>
            <option value="EXPIRED">Expired / Non-Compliant (&lt; 0 Days)</option>
            <option value="PENDING_VERIFICATION">Pending Verification Check</option>
            <option value="VALID">Valid / Verified (&gt; 30 Days)</option>
          </select>
        </div>

        {/* Document Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Document Types</option>
            <option value="Fire Safety NOC">Fire Safety NOC</option>
            <option value="Building Completion & Stability Certificate">Building Completion & Stability</option>
            <option value="Fixed Deposit Receipt (FDR) / Corpus Fund">FDR / Corpus Fund</option>
            <option value="Land Ownership / Registered Lease Deed">Land Lease / Deed</option>
            <option value="Affidavit / Institutional Undertaking">Affidavit / Undertaking</option>
            <option value="State Pollution Control Board NOC">Pollution Control NOC</option>
          </select>
        </div>
      </div>

      {/* Documents Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Document Type</th>
                <th className="py-2.5 px-3">Reg. Number</th>
                <th className="py-2.5 px-3">Institution Name</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Days Left</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No compliance documents matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const days = getDaysRemaining(doc.expiryDate);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>{doc.type}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {doc.fileName} ({doc.fileSizeKb} KB)
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {doc.documentNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={doc.institutionName}>
                        {doc.institutionName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {doc.issueDate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {doc.expiryDate}
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span className={days < 0 ? 'text-red-700' : days <= 30 ? 'text-amber-700' : 'text-emerald-700'}>
                          {days < 0 ? `${days}d (Overdue)` : `${days}d`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getStatusBadge(doc)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOcrDoc(doc)}
                            title="Inspect OCR extraction fields & confidence"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded cursor-pointer"
                          >
                            <Scan className="w-3 h-3 text-teal-700" />
                            <span>OCR Audit</span>
                          </button>

                          {/* Verification Buttons for Regional Officer */}
                          {currentRole === 'REGIONAL_OFFICER' && doc.verificationStatus === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => verifyDocument(doc.id, 'VERIFY')}
                                title="Verify statutory validity"
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded cursor-pointer"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => setRejectingDocId(doc.id)}
                                title="Reject non-compliant document"
                                className="px-2 py-1 text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDocs.length} of {documents.length} compliance documents</span>
          <span className="text-[11px]">Dynamic calculation: &lt;0d = Expired (Escalated), ≤30d = Warning, &gt;30d = Valid</span>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploaded={() => {}}
        />
      )}

      {/* OCR Review Screen Modal */}
      {selectedOcrDoc && (
        <OcrReviewModal
          document={selectedOcrDoc}
          onClose={() => setSelectedOcrDoc(null)}
        />
      )}

      {/* Reject Reason Dialog */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmReject} className="bg-white rounded-lg border border-rose-300 p-5 max-w-md w-full shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
              <span>Reject Compliance Document</span>
            </div>
            <p className="text-xs text-slate-600">
              State the specific statutory or technical non-compliance reason for rejecting this document:
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing competent authority sign-off; Structural stability certificate not endorsed by licensed PWD engineer..."
              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-rose-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDocId(null)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded cursor-pointer"
              >
                Confirm Statutory Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
