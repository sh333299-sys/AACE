import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditEvent } from '../../types';
import { calculateEventHashSync } from '../../utils/crypto';
import { downloadCsv } from '../../utils/exportCsv';
import { 
  History, 
  ShieldCheck, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Search, 
  Hash, 
  Info,
  Link as LinkIcon
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditTrail } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid: boolean;
    verifiedBlocks: number;
    errorNote?: string;
  } | null>(null);

  // Filtered audit events
  const filteredEvents = auditTrail.filter(event => {
    const matchesRole = roleFilter === 'ALL' || event.role === roleFilter;
    const matchesEntity = entityFilter === 'ALL' || event.entityType === entityFilter;
    const matchesSearch = 
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.recordId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesEntity && matchesSearch;
  });

  // Verify full cryptographic chain from genesis to tip
  const handleVerifyChainIntegrity = () => {
    let currentPrev = '0000000000000000000000000000000000000000000000000000000000000000';
    let isValid = true;
    let failedIndex = -1;

    for (let i = 0; i < auditTrail.length; i++) {
      const ev = auditTrail[i];
      if (ev.prevHash !== currentPrev) {
        isValid = false;
        failedIndex = i;
        break;
      }

      const calculated = calculateEventHashSync(
        ev.prevHash,
        ev.timestamp,
        ev.actor,
        ev.action,
        ev.recordId,
        ev.summary
      );

      if (calculated !== ev.eventHash) {
        isValid = false;
        failedIndex = i;
        break;
      }

      currentPrev = ev.eventHash;
    }

    if (isValid) {
      setVerificationResult({
        tested: true,
        valid: true,
        verifiedBlocks: auditTrail.length
      });
    } else {
      setVerificationResult({
        tested: true,
        valid: false,
        verifiedBlocks: failedIndex,
        errorNote: `Hash mismatch at event block index #${failedIndex + 1}`
      });
    }
  };

  const handleExportCsv = () => {
    const exportData = filteredEvents.map(e => ({
      'Event ID': e.id,
      'Timestamp': e.timestamp,
      'Actor': e.actor,
      'Role': e.role,
      'Action': e.action,
      'Entity Type': e.entityType,
      'Record ID': e.recordId,
      'Summary': e.summary,
      'Previous Block Hash': e.prevHash,
      'Deterministic SHA-256 Hash': e.eventHash
    }));
    downloadCsv(exportData, 'AICTE_Regulatory_Audit_Trail');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Tamper-Evident Regulatory Audit Trail</h2>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-700" />
              Append-Only SHA-256 Hash Chained
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological event log for institutional filings, scrutiny decisions, inspections, and statutory notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChainIntegrity}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verify Cryptographic Chain</span>
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

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
          verificationResult.valid 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {verificationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {verificationResult.valid ? 'Audit Trail Integrity Verified: ' : 'Integrity Check Failed: '}
              </span>
              <span>
                {verificationResult.valid 
                  ? `All ${verificationResult.verifiedBlocks} chained event blocks passed deterministic SHA-256 sequence validation without discrepancies.`
                  : verificationResult.errorNote}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setVerificationResult(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transparency & Integrity Model Callout */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Cryptographic Hash Chaining Mechanism & Prototype Integrity Boundaries</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong>Guarantees:</strong> Each event hash is computed deterministically as <code className="bg-slate-200 px-1 py-0.2 rounded font-mono text-[10px]">SHA-256(prevHash + timestamp + actor + action + recordId + summary)</code>. Modifying any past event or altering chronological sequence causes immediate hash mismatch upon verification. Regular users and college admins cannot edit or delete audit events.
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Limitations:</strong> In this local evaluation prototype, data is stored in browser local storage. In a full production rollout, root hashes would be anchored to an immutable distributed ledger or a write-once regulatory log service.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, record ID, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="INSTITUTION_ADMIN">Institution Administrator</option>
            <option value="REGIONAL_OFFICER">Regional Officer</option>
            <option value="EVC_INSPECTOR">EVC Inspector</option>
            <option value="CENTRAL_DIRECTOR">Central Director</option>
          </select>
        </div>

        {/* Entity Type Filter */}
        <div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="ALL">All Entity Types</option>
            <option value="APPLICATION">Applications</option>
            <option value="DOCUMENT">Documents</option>
            <option value="INSPECTION">Inspections</option>
            <option value="ALERT">Alerts</option>
            <option value="SHOW_CAUSE_NOTICE">Show Cause Notices</option>
            <option value="SECURITY">Security / System</option>
          </select>
        </div>
      </div>

      {/* Chronological Event Stream */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No audit events found matching the search criteria.
            </div>
          ) : (
            filteredEvents.slice().reverse().map((event, idx) => (
              <div key={event.id} className="p-4 hover:bg-slate-50/80 transition text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-800 text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {event.id}
                    </span>
                    <span className="font-bold text-slate-900">{event.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      {event.entityType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {event.timestamp}
                  </div>
                </div>

                {/* Summary */}
                <div className="text-slate-800 font-medium">
                  {event.summary}
                </div>

                {/* Actor & Record ID */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Actor: <strong className="text-slate-700">{event.actor}</strong> ({event.role})</span>
                  <span>Target Record: <code className="bg-slate-100 px-1 rounded font-mono text-slate-700">{event.recordId}</code></span>
                </div>

                {/* Cryptographic Hash Chaining Metadata */}
                <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1 text-slate-500 truncate">
                    <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Prev Hash:</span>
                    <span className="text-slate-600 truncate">{event.prevHash}</span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-800 truncate font-semibold">
                    <Hash className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>Event SHA-256:</span>
                    <span className="truncate">{event.eventHash}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEvents.length} of {auditTrail.length} total event blocks</span>
          <span>Append-only immutable record</span>
        </div>
      </div>
    </div>
  );
};
