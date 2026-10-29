import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InspectionRecord, InspectionChecklistItem } from '../../types';
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  UserCheck, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  Send, 
  Camera, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';

export const InspectionWorkspace: React.FC = () => {
  const { 
    inspections, 
    currentRole, 
    updateInspectionItem, 
    saveInspectionDraft, 
    submitInspectionFindings 
  } = useApp();

  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(
    inspections[0]?.id || ''
  );

  const activeInspection = inspections.find(i => i.id === selectedInspectionId) || inspections[0];

  const [overallRemarks, setOverallRemarks] = useState(activeInspection?.summaryRemarks || '');
  const [recommendation, setRecommendation] = useState<InspectionRecord['recommendation']>(
    activeInspection?.recommendation || 'RECOMMEND_APPROVAL'
  );

  if (!activeInspection) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
        No active EVC inspection records found.
      </div>
    );
  }

  // Calculate live score based on compliant items
  const totalItems = activeInspection.checklist.length;
  const compliantItems = activeInspection.checklist.filter(c => c.status === 'COMPLIANT').length;
  const liveScore = Math.round((compliantItems / (totalItems || 1)) * 100);

  const handleItemStatusChange = (
    itemId: string, 
    status: InspectionChecklistItem['status'], 
    remarks: string
  ) => {
    updateInspectionItem(activeInspection.id, itemId, status, remarks);
  };

  const handleSaveDraft = () => {
    saveInspectionDraft(activeInspection.id, overallRemarks);
    alert('Inspection checklist and field notes saved as local draft.');
  };

  const handleSubmitFindings = (e: React.FormEvent) => {
    e.preventDefault();
    const pendingItems = activeInspection.checklist.filter(c => c.status === 'PENDING').length;
    if (pendingItems > 0) {
      if (!confirm(`There are still ${pendingItems} item(s) marked as PENDING in the checklist. Submit anyway?`)) {
        return;
      }
    }

    if (!overallRemarks.trim()) {
      alert('Please enter statutory committee summary remarks before submitting findings.');
      return;
    }

    submitInspectionFindings(activeInspection.id, liveScore, recommendation, overallRemarks);
    alert(`EVC Inspection Report submitted successfully with a compliance score of ${liveScore}/100. Related application timeline updated!`);
  };

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Expert Visit Committee (EVC) Workspace</h2>
            <span className="text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
              Physical Verification Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured on-site facility verification against Approval Process Handbook norms, geo-location validation, and committee reporting.
          </p>
        </div>

        {/* Inspection Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Select Campus:</span>
          <select
            value={selectedInspectionId}
            onChange={(e) => {
              setSelectedInspectionId(e.target.value);
              const insp = inspections.find(i => i.id === e.target.value);
              if (insp) {
                setOverallRemarks(insp.summaryRemarks || '');
                setRecommendation(insp.recommendation || 'RECOMMEND_APPROVAL');
              }
            }}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded text-xs cursor-pointer max-w-xs truncate"
          >
            {inspections.map(insp => (
              <option key={insp.id} value={insp.id}>
                {insp.institutionName} ({insp.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campus & Inspector Details Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold">Institution / Campus:</span>
          <div className="font-bold text-slate-900 mt-0.5">{activeInspection.institutionName}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">App No: {activeInspection.applicationNumber}</div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold">Committee Lead:</span>
          <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>{activeInspection.inspectorName}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{activeInspection.regionalOffice}</div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold">Simulated GPS Geo-Tag (Demo):</span>
          <div className="font-mono text-slate-800 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>{activeInspection.geoCoordsSimulated.lat}° N, {activeInspection.geoCoordsSimulated.lng}° E</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate" title={activeInspection.geoCoordsSimulated.locationName}>
            {activeInspection.geoCoordsSimulated.locationName}
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold">Visit Status & Score:</span>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              activeInspection.status === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-800' :
              activeInspection.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
            }`}>
              {activeInspection.status.replace(/_/g, ' ')}
            </span>
            <span className="font-bold text-teal-800 text-sm">
              {activeInspection.status === 'REPORT_SUBMITTED' ? `${activeInspection.overallScore}%` : `${liveScore}%`}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Scheduled: {activeInspection.scheduledDate}
          </div>
        </div>
      </div>

      {/* Main Checklist and Reporting Interface */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Statutory Infrastructure & Norms Checklist
            </h3>
          </div>
          <span className="text-xs text-slate-300">
            {compliantItems} of {totalItems} Requirements Compliant
          </span>
        </div>

        {/* Checklist Rows */}
        <div className="divide-y divide-slate-100">
          {activeInspection.checklist.map((item, index) => (
            <div key={item.id} className="p-4 hover:bg-slate-50/70 transition text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-900">{item.itemTitle}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {item.category}
                  </span>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleItemStatusChange(item.id, 'COMPLIANT', item.remarks)}
                    className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer transition ${
                      item.status === 'COMPLIANT' 
                        ? 'bg-emerald-700 text-white shadow-xs font-bold' 
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                    Compliant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemStatusChange(item.id, 'DEFICIENT', item.remarks)}
                    className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer transition ${
                      item.status === 'DEFICIENT' 
                        ? 'bg-rose-700 text-white shadow-xs font-bold' 
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                    }`}
                  >
                    Deficient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemStatusChange(item.id, 'NOT_APPLICABLE', item.remarks)}
                    className={`px-2 py-1 text-xs rounded font-medium cursor-pointer transition ${
                      item.status === 'NOT_APPLICABLE' 
                        ? 'bg-slate-700 text-white shadow-xs font-bold' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>

              {/* Requirement spec */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                <strong>Regulatory Specification:</strong> {item.requirementSpec}
              </div>

              {/* Inspector Remarks Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Record on-site measurement / physical observation..."
                  value={item.remarks}
                  onChange={(e) => handleItemStatusChange(item.id, item.status, e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Committee Final Determination and Submission Form */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
          <div className="font-bold text-slate-900 text-sm">
            EVC Committee Final Recommendation & Statutory Report
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Recommendation to Standing Hearing Committee (SHC):
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-xs cursor-pointer"
              >
                <option value="RECOMMEND_APPROVAL">Recommend Approval (All Critical Norms Met)</option>
                <option value="DEFICIENCIES_FOUND">Deficiencies Found (Require Rectification)</option>
                <option value="REJECT">Reject Application (Major Discrepancy)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Simulated Proof Attachments (Photos/Inspection Logs):
              </label>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-white border border-slate-300 rounded text-slate-600 flex items-center gap-1.5 flex-1">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">Campus_Entrance_Ramp_OFC_Lab.zip (4.8 MB)</span>
                </span>
                <button
                  type="button"
                  onClick={() => alert('Simulated photo upload proof attached.')}
                  className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Committee Comprehensive Inspection Findings:
            </label>
            <textarea
              rows={3}
              required
              value={overallRemarks}
              onChange={(e) => setOverallRemarks(e.target.value)}
              placeholder="Summarize physical classroom readiness, lab equipment functioning, faculty verification, and safety systems..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Offline-ready draft persistence via browser local storage</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium rounded cursor-pointer transition"
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span>Save Local Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitFindings}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded cursor-pointer transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final EVC Visit Report</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
