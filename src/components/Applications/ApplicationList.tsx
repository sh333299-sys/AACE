import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStage, ApplicationType } from '../../types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { downloadCsv } from '../../utils/exportCsv';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus, 
  ArrowUpDown, 
  FileText,
  AlertCircle,
  Building
} from 'lucide-react';

export const ApplicationList: React.FC = () => {
  const { applications, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'submission'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Filtered and sorted applications
  const filteredApps = useMemo(() => {
    return applications
      .filter(app => {
        const matchesSearch = 
          app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.assignedOfficer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStage = stageFilter === 'ALL' || app.currentStage === stageFilter;
        const matchesType = typeFilter === 'ALL' || app.type === typeFilter;

        return matchesSearch && matchesStage && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(sortBy === 'updated' ? a.lastUpdated : a.submissionDate).getTime();
        const dateB = new Date(sortBy === 'updated' ? b.lastUpdated : b.submissionDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchQuery, stageFilter, typeFilter, sortBy, sortOrder]);

  const handleExportCsv = () => {
    const exportData = filteredApps.map(a => ({
      'Application ID': a.applicationNumber,
      'Institution Name': a.institutionName,
      'Academic Year': a.academicYear,
      'Type': a.type,
      'Current Stage': a.currentStage,
      'Workflow Path': a.workflowPath,
      'Assigned Officer': a.assignedOfficer,
      'Regional Office': a.regionalOffice,
      'Compliance Score': `${a.complianceScore}%`,
      'Submission Date': a.submissionDate,
      'Last Updated': a.lastUpdated
    }));
    downloadCsv(exportData, 'AICTE_Applications_Register');
  };

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case 'FINAL_APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold">Approved</span>;
      case 'DEFICIENCY_RAISED':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">Deficiency Raised</span>;
      case 'SCRUTINY_PENDING':
        return <span className="bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded text-[11px] font-semibold">Scrutiny Pending</span>;
      case 'RESCRUTINY_PENDING':
        return <span className="bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded text-[11px] font-semibold">Re-Scrutiny</span>;
      case 'EVC_RECOMMENDED':
      case 'EVC_IN_PROGRESS':
        return <span className="bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded text-[11px] font-semibold">EVC Visit</span>;
      case 'SAC_SHC_REVIEW':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded text-[11px] font-semibold">SAC / SHC Review</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[11px] font-semibold">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">{stage}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">AICTE Approval Applications Register</h2>
          <p className="text-xs text-slate-500">
            Automated statutory workflow tracking: Scrutiny, EVC Physical Verification, SAC/SHC Appellate, and Final Approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID or college name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        {/* Stage Filter */}
        <div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Workflow Stages</option>
            <option value="SCRUTINY_PENDING">Scrutiny Pending</option>
            <option value="DEFICIENCY_RAISED">Deficiency Raised</option>
            <option value="RESCRUTINY_PENDING">Re-Scrutiny Pending</option>
            <option value="EVC_RECOMMENDED">EVC Recommended</option>
            <option value="SAC_SHC_REVIEW">SAC / SHC Review</option>
            <option value="FINAL_APPROVED">Approved</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Application Types</option>
            <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
            <option value="New Technical Institution">New Technical Institution</option>
            <option value="Variation in Intake / Closure">Variation in Intake / Closure</option>
            <option value="Introduction of Supernumerary Seats">Supernumerary Seats</option>
          </select>
        </div>

        {/* Sort Trigger */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="updated">Sort: Last Updated</option>
            <option value="submission">Sort: Submission Date</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title="Toggle sort direction"
            className="p-1.5 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Application ID</th>
                <th className="py-2.5 px-3">Institution Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Submission Date</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Assigned Officer</th>
                <th className="py-2.5 px-3 text-center">Compliance</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No applications found matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-teal-50/40 transition cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                      {app.applicationNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 max-w-xs sm:max-w-sm truncate" title={app.institutionName}>
                        {app.institutionName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {app.regionalOffice}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {app.type}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {app.submissionDate}
                    </td>
                    <td className="py-2.5 px-3">
                      {getStageBadge(app.currentStage)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]" title={app.assignedOfficer}>
                      {app.assignedOfficer}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block font-bold text-[11px] ${
                        app.complianceScore >= 90 ? 'text-emerald-700' :
                        app.complianceScore >= 75 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {app.complianceScore}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3 text-teal-700" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredApps.length} of {applications.length} applications</span>
          <span>Click any row to view workflow path, deficiency memos, and officer actions</span>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => {
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
};
