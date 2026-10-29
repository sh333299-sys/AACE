import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplianceDocument, OcrExtractedData } from '../../types';
import { 
  X, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Check, 
  Edit3, 
  ShieldAlert,
  Info
} from 'lucide-react';

interface OcrReviewModalProps {
  document: ComplianceDocument;
  onClose: () => void;
}

export const OcrReviewModal: React.FC<OcrReviewModalProps> = ({ document, onClose }) => {
  const { updateExtractedOcrData, currentRole } = useApp();

  const ocr = document.extractedOcrData || {
    institutionName: document.institutionName,
    documentNumber: document.documentNumber,
    issueDate: document.issueDate,
    expiryDate: document.expiryDate,
    issuingAuthority: 'State Regulatory Board / Municipal Fire Authority',
    confidenceScore: 92
  };

  const [formData, setFormData] = useState<OcrExtractedData>({ ...ocr });
  const [flagReason, setFlagReason] = useState(formData.flaggedDiscrepancy || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveAndAccept = () => {
    updateExtractedOcrData(document.id, {
      ...formData,
      flaggedDiscrepancy: flagReason.trim() ? flagReason : undefined
    }, true);
    alert('OCR extracted data verified and updated successfully in the compliance register.');
    onClose();
  };

  const handleFlagDiscrepancy = () => {
    if (!flagReason.trim()) {
      alert('Please enter discrepancy notes for human regulatory review.');
      return;
    }
    updateExtractedOcrData(document.id, {
      ...formData,
      flaggedDiscrepancy: flagReason
    }, false);
    alert('Discrepancy flagged for regulatory officer re-inspection.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scan className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold">OCR Document Extraction & Validation Review</h2>
              <div className="text-[11px] text-slate-300">
                {document.type} • {document.fileName}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="bg-sky-50 border-b border-sky-200 px-5 py-2.5 text-xs text-sky-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Demonstration OCR Extraction Engine: </span>
            <span>
              The values shown below represent extracted regulatory parameters processed by the document ingestion pipeline.
              Reviewers can correct extracted text, compare with institutional metadata, and flag inconsistencies for manual verification.
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Side-by-Side: Document Details vs Extracted OCR Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Submitted Record Details */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                1. Institutional Registry Record
              </div>
              <div>
                <span className="text-slate-500">Document Type:</span>
                <div className="font-semibold text-slate-800">{document.type}</div>
              </div>
              <div>
                <span className="text-slate-500">Institution:</span>
                <div className="font-semibold text-slate-800">{document.institutionName}</div>
              </div>
              <div>
                <span className="text-slate-500">Submitted Registration No:</span>
                <div className="font-mono text-slate-800">{document.documentNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500">Issue Date:</span>
                  <div className="font-semibold text-slate-800">{document.issueDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Expiry Date:</span>
                  <div className="font-semibold text-slate-800">{document.expiryDate}</div>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-slate-500">Verification Status:</span>
                <div className="mt-0.5">
                  <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-200 text-slate-800">
                    {document.verificationStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: OCR Extracted Fields */}
            <div className="p-3.5 bg-teal-50/40 rounded-lg border border-teal-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-teal-200">
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  2. OCR Extracted Fields
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono font-bold">
                  Confidence: {formData.confidenceScore}%
                </span>
              </div>

              <div>
                <label className="text-slate-600 block text-[11px]">Extracted College Name:</label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-slate-600 block text-[11px]">Extracted Registration/Serial No:</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block text-[11px]">Extracted Issue Date:</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block text-[11px]">Extracted Expiry Date:</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              {formData.landSurveyNumber !== undefined && (
                <div>
                  <label className="text-slate-600 block text-[11px]">Land Survey Number / Demarcation:</label>
                  <input
                    type="text"
                    value={formData.landSurveyNumber}
                    onChange={(e) => setFormData({ ...formData, landSurveyNumber: e.target.value })}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              )}

              {formData.financialAmountInLakhs !== undefined && (
                <div>
                  <label className="text-slate-600 block text-[11px]">FDR Corpus Amount (₹ Lakhs):</label>
                  <input
                    type="number"
                    value={formData.financialAmountInLakhs}
                    onChange={(e) => setFormData({ ...formData, financialAmountInLakhs: parseFloat(e.target.value) })}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-bold"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-600 block text-[11px]">Issuing Authority / Agency:</label>
                <input
                  type="text"
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

            </div>
          </div>

          {/* Discrepancy Flagging Area */}
          <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Regulatory Discrepancy & Verification Notes</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              If extracted dates, stamp seals, or financial values deviate from submitted declaration, enter the discrepancy notes below for human officer review.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={2}
              placeholder="e.g. Municipal fire seal missing on page 2; Expiry date mismatch between certificate stamp and portal metadata..."
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-600"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlagDiscrepancy}
              className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded cursor-pointer transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>Flag Discrepancy</span>
            </button>
            <button
              onClick={handleSaveAndAccept}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded cursor-pointer transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Verify OCR Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
