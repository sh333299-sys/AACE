import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { USER_ROLES } from '../../data/seedData';
import { downloadCsv } from '../../utils/exportCsv';
import { 
  BarChart3, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users,
  ShieldCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { applications, documents, alerts, inspections, getDaysRemaining } = useApp();

  // Summary counts
  const stageCounts: Record<string, number> = {};
  applications.forEach(a => {
    stageCounts[a.currentStage] = (stageCounts[a.currentStage] || 0) + 1;
  });

  const urgentDocs = documents.filter(d => getDaysRemaining(d.expiryDate) <= 30);
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');

  // Workload by role
  const roleWorkload = [
    {
      role: 'Institution Administrator',
      count: applications.filter(a => a.currentStage === 'DEFICIENCY_RAISED').length + urgentDocs.length,
      detail: 'Active deficiencies to rectify + documents needing renewal'
    },
    {
      role: 'Regional Officer',
      count: applications.filter(a => ['SCRUTINY_PENDING', 'RESCRUTINY_PENDING'].includes(a.currentStage)).length + documents.filter(d => d.verificationStatus === 'PENDING_VERIFICATION').length,
      detail: 'Preliminary scrutinies + document verification checks'
    },
    {
      role: 'EVC Inspector',
      count: inspections.filter(i => ['SCHEDULED', 'IN_PROGRESS'].includes(i.status)).length,
      detail: 'Pending field campus inspections'
    },
    {
      role: 'Central Director',
      count: alerts.filter(a => a.showCauseNotice?.status === 'DRAFT_PENDING_APPROVAL').length + applications.filter(a => a.currentStage === 'SAC_SHC_REVIEW').length,
      detail: 'Draft Show-Cause Notices + final SAC/SHC appellate queue'
    }
  ];

  const handleExportSummaryReport = () => {
    const data = [
      { Metric: 'Total Applications Ingested', Value: applications.length },
      { Metric: 'Applications in Scrutiny', Value: stageCounts['SCRUTINY_PENDING'] || 0 },
      { Metric: 'Applications with Active Deficiencies', Value: stageCounts['DEFICIENCY_RAISED'] || 0 },
      { Metric: 'Applications Recommended for EVC', Value: stageCounts['EVC_RECOMMENDED'] || 0 },
      { Metric: 'Applications Approved by Central Director', Value: stageCounts['FINAL_APPROVED'] || 0 },
      { Metric: 'Total Monitored Compliance Documents', Value: documents.length },
      { Metric: 'Documents Expiring ≤ 30 Days (T-30 Warning)', Value: documents.filter(d => {
        const days = getDaysRemaining(d.expiryDate);
        return days <= 30 && days >= 0;
      }).length },
      { Metric: 'Documents Overdue / Expired (T+15 SCN)', Value: documents.filter(d => getDaysRemaining(d.expiryDate) < 0).length },
      { Metric: 'Pending EVC Inspections', Value: inspections.filter(i => i.status !== 'REPORT_SUBMITTED').length },
      { Metric: 'Active Regulatory Alerts', Value: activeAlerts.length }
    ];
    downloadCsv(data, 'AICTE_Executive_Compliance_Summary');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Regulatory Analytics & Compliance Reports</h2>
          <p className="text-xs text-slate-500">
            Workload distribution by regulatory bureau, application stage velocity, and institutional risk matrix.
          </p>
        </div>
        <button
          onClick={handleExportSummaryReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Executive Summary CSV</span>
        </button>
      </div>

      {/* Grid: Practical Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Stage Distribution Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Application Stage Pipeline Distribution
            </h3>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {applications.length} Applications Total
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const percentage = Math.round((count / applications.length) * 100);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">{stage.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-teal-700 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Pending Workload by Role */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pending Operational Workload by Role
            </h3>
            <span className="text-xs text-slate-400">Live Task Queue</span>
          </div>

          <div className="mt-4 space-y-3">
            {roleWorkload.map((rw, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{rw.role}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{rw.detail}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 font-bold text-xs bg-white text-teal-900 rounded border border-teal-300 shadow-2xs">
                    {rw.count} Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Upcoming Document Expiries & Overdue Risk */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Critical Document Expiry Watchlist
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {urgentDocs.length} Flagged
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {urgentDocs.length === 0 ? (
              <div className="text-slate-400 py-4 text-center">No documents in critical expiry window.</div>
            ) : (
              urgentDocs.map(doc => {
                const days = getDaysRemaining(doc.expiryDate);
                return (
                  <div key={doc.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{doc.type}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{doc.institutionName}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        days < 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {days < 0 ? `${days}d (Overdue)` : `${days}d left`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Inspection Status Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              EVC Inspection Completion Summary
            </h3>
            <span className="text-xs text-slate-400">AY 2026-27</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {inspections.map(insp => (
              <div key={insp.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-xs">{insp.institutionName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    insp.status === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {insp.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Inspector: {insp.inspectorName}</span>
                  <span>Score: <strong className="text-teal-800">{insp.overallScore}%</strong></span>
                </div>
                {insp.summaryRemarks && (
                  <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                    {insp.summaryRemarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
