import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType, ComplianceDocument, OcrExtractedData } from '../../types';
import { X, UploadCloud, FileCheck, AlertCircle, Sparkles, FileText } from 'lucide-react';

interface DocumentUploadModalProps {
  onClose: () => void;
  onUploaded: (docId?: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ onClose, onUploaded }) => {
  const { uploadDocumentWithOcr, applications } = useApp();

  const [documentType, setDocumentType] = useState<DocumentType>('Fire Safety NOC');
  const [institutionName, setInstitutionName] = useState(
    applications[0]?.institutionName || 'Kalinga Institute of Technology & Management, Bhubaneswar'
  );
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Size check (max 10MB)
      if (selected.size > 10 * 1024 * 1024) {
        setFileError('File size exceeds the 10 MB statutory limit.');
        return;
      }
      // Type check
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selected.type)) {
        setFileError('Invalid file format. Only PDF, JPG, or PNG files are supported.');
        return;
      }
      setFile(selected);
      if (!docNumber) {
        // Auto-generate realistic demo doc registration number
        setDocNumber(`REG/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a valid document file to upload.');
      return;
    }
    if (!docNumber.trim()) {
      alert('Please specify the registration / certificate number.');
      return;
    }

    setIsProcessingOcr(true);

    // Simulate reliable OCR extraction pipeline
    setTimeout(() => {
      const simulatedOcr: OcrExtractedData = {
        institutionName,
        documentNumber: docNumber,
        issueDate,
        expiryDate,
        issuingAuthority: 'Competent Statutory Fire / Revenue Authority',
        confidenceScore: 93,
        landAreaAcres: documentType.includes('Land') ? 10.5 : undefined,
        financialAmountInLakhs: documentType.includes('FDR') ? 50.0 : undefined
      };

      uploadDocumentWithOcr({
        documentNumber: docNumber,
        institutionName,
        type: documentType,
        issueDate,
        expiryDate,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024)
      }, simulatedOcr);

      setIsProcessingOcr(false);
      alert('Document uploaded and automated OCR extraction completed. Awaiting Regional Officer verification.');
      onUploaded();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold">Upload Statutory Compliance Document</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="text-slate-700 font-bold block mb-1">Target Institution:</label>
            <select
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="Kalinga Institute of Technology & Management, Bhubaneswar">
                Kalinga Institute of Technology & Management, Bhubaneswar
              </option>
              <option value="Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow">
                Dr. A.P.J. Abdul Kalam Technical Campus, Lucknow
              </option>
              <option value="Sahyadri College of Engineering & Research, Mangaluru">
                Sahyadri College of Engineering & Research, Mangaluru
              </option>
              <option value="Vidyapeeth Institute of Technology, Pune">
                Vidyapeeth Institute of Technology, Pune
              </option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Compliance Document Type:</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="Fire Safety NOC">Fire Safety NOC</option>
              <option value="Building Completion & Stability Certificate">Building Completion & Stability Certificate</option>
              <option value="Fixed Deposit Receipt (FDR) / Corpus Fund">Fixed Deposit Receipt (FDR) / Corpus Fund</option>
              <option value="Land Ownership / Registered Lease Deed">Land Ownership / Registered Lease Deed</option>
              <option value="Affidavit / Institutional Undertaking">Affidavit / Institutional Undertaking</option>
              <option value="State Pollution Control Board NOC">State Pollution Control Board NOC</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Certificate / Registration Number:</label>
            <input
              type="text"
              required
              placeholder="e.g. FIRE-NOC/2026/OD-901"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Issue Date:</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Expiry Date:</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="text-slate-700 font-bold block mb-1">Select File (PDF / JPEG / PNG, Max 10MB):</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition">
              <input
                type="file"
                id="docFileInput"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="docFileInput" className="cursor-pointer block">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-teal-800 font-semibold">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-teal-700 font-semibold hover:underline">Click to browse file</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Government stamped PDF or high-resolution scan</p>
                  </div>
                )}
              </label>
            </div>
            {fileError && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fileError}
              </p>
            )}
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-[11px] text-teal-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Automated OCR pipeline will parse and extract metadata for human audit upon upload.</span>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessingOcr}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessingOcr}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded cursor-pointer transition flex items-center gap-1.5"
            >
              {isProcessingOcr ? 'Ingesting & OCR Parsing...' : 'Upload & Initiate Verification'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
