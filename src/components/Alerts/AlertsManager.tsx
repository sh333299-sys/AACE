import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Alert, AlertStatus, AlertSeverity } from '../../types';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sliders, 
  Check, 
  Send, 
  Info,
  X
} from 'lucide-react';

export const AlertsManager: React.FC = () => {
  const { 
    alerts, 
    currentRole, 
    acknowledgeAlert, 
    resolveAlert, 
    authorizeShowCauseNotice 
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Escalation policy config preview states (demonstrating configurability)
  const [tMinusDays, setTMinusDays] = useState(30);
  const [tPlusDays, setTPlusDays] = useState(15);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Review Draft Show-Cause Notice Modal state
  const [reviewingNoticeAlert, setReviewingNoticeAlert] = useState<Alert | null>(null);
  const [statutoryRemarks, setStatutoryRemarks] = useState('');

  // Resolve alert dialog state
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const handleConfirmAuthorizeNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingNoticeAlert) return;
    authorizeShowCauseNotice(
      reviewingNoticeAlert.id, 
      statutoryRemarks.trim() || 'Approved by Central Director. Issued under AICTE Regulation 2026.'
    );
    alert(`Statutory Show Cause Notice (${reviewingNoticeAlert.showCauseNotice?.noticeNumber}) signed and dispatched to college.`);
    setReviewingNoticeAlert(null);
    setStatutoryRemarks('');
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlertId || !resolutionNote.trim()) {
      alert('Please enter formal resolution notes.');
      return;
    }
    resolveAlert(resolvingAlertId, resolutionNote);
    setResolvingAlertId(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Proposed Escalation Policy Display */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Alerts & Regulatory Escalation Engine</h2>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                Configurable Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated multi-tier compliance escalation policy: Warning alerts, Regional bureau notifications, and Statutory show-cause notice generation.
            </p>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition cursor-pointer self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Configure Policy Rules</span>
          </button>
        </div>

        {/* Visual 3-Stage Escalation Pipeline */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">
            <span>Prototype Proposed Escalation Policy Timeline</span>
            <span className="text-[10px] text-slate-400 font-normal">Subject to Approval Process Handbook provisions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: T-30 */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-mono">1</span>
                  T-{tMinusDays} Days (Advance Warning)
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">College Admin</span>
              </div>
              <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                Automated alert dispatched to Institution Administrator. Initiates document renewal reminder on the institutional dashboard.
              </p>
            </div>

            {/* Step 2: T+0 */}
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-900 flex items-center justify-center text-[10px] font-mono">2</span>
                  Expiry Date (T+0 Days)
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-mono">Regional Officer</span>
              </div>
              <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                Breach recorded. Overdue compliance alert assigned to Regional Bureau desk. Document flagged as expired in statutory register.
              </p>
            </div>

            {/* Step 3: T+15 */}
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 text-xs">
              <div className="flex items-center justify-between font-bold text-purple-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-[10px] font-mono">3</span>
                  T+{tPlusDays} Days (Statutory SCN)
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono">Central Director</span>
              </div>
              <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                Automated Draft Show-Cause Notice formulated. Held in pending draft status until formally authorized by Central Director.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter Alerts:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded text-xs cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded text-xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ESCALATED">Escalated</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div className="text-slate-500 text-[11px]">
          Showing {filteredAlerts.length} active regulatory alert(s)
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No regulatory alerts matching current filters.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.severity === 'CRITICAL';
              const hasDraftNotice = alert.showCauseNotice?.status === 'DRAFT_PENDING_APPROVAL';

              return (
                <div key={alert.id} className="p-4 hover:bg-slate-50 transition text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{alert.id}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">{alert.alertType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Assigned Role: <strong className="text-slate-700">{alert.assignedRole}</strong></span>
                      <span>Due: <strong className="text-slate-700">{alert.dueDate}</strong></span>
                    </div>
                  </div>

                  {/* Title and Institution */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{alert.title}</h3>
                    <p className="text-slate-600 text-xs mt-0.5">{alert.institutionName}</p>
                  </div>

                  {/* Draft Notice Callout */}
                  {hasDraftNotice && (
                    <div className="bg-purple-50 border border-purple-200 p-2.5 rounded text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                        <div>
                          <div className="font-bold text-[11px]">Draft Statutory Show-Cause Notice Generated (T+15)</div>
                          <div className="text-[10px] text-purple-800">
                            Notice No: {alert.showCauseNotice?.noticeNumber} • Requires Central Director authorization
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewingNoticeAlert(alert)}
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded transition cursor-pointer self-start sm:self-auto"
                      >
                        Review Draft Notice
                      </button>
                    </div>
                  )}

                  {/* Action History Preview */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Escalation Trail:
                    </span>
                    {alert.actionHistory.map((act, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 font-mono text-[10px]">{act.timestamp}</span>
                        <span>•</span>
                        <span><strong>{act.action}</strong> ({act.actor}): {act.note}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        alert.status === 'ACKNOWLEDGED' ? 'bg-teal-100 text-teal-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status === 'OPEN' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setResolvingAlertId(alert.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Draft Show-Cause Notice Modal */}
      {reviewingNoticeAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleConfirmAuthorizeNotice} className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold">Statutory Show-Cause Notice Review (T+15 Escalation)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setReviewingNoticeAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded border border-purple-200 text-purple-950">
                <span className="font-bold">Human Statutory Approval Prerequisite: </span>
                <span>
                  The draft show-cause notice was formulated automatically when the compliance deadline exceeded T+15 days.
                  It will not be issued to the institution until signed off by the Central Director / Statutory Competent Authority.
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Draft Notice Text (AICTE Legal Format):
                </label>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800 max-h-60 overflow-y-auto">
                  {reviewingNoticeAlert.showCauseNotice?.statutoryNoticeDraft}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Statutory Officer Remarks / Authorization Note:
                </label>
                <textarea
                  rows={2}
                  value={statutoryRemarks}
                  onChange={(e) => setStatutoryRemarks(e.target.value)}
                  placeholder="e.g. Formally authorized as per Council Standing Regulation. 7-day hearing notice granted..."
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setReviewingNoticeAlert(null)}
                className="px-3 py-1.5 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-bold text-white bg-purple-800 hover:bg-purple-900 rounded cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sign & Issue Statutory Show-Cause Notice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve Alert Modal */}
      {resolvingAlertId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmResolve} className="bg-white rounded-lg border border-slate-200 p-5 max-w-md w-full shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Resolve Regulatory Alert</h3>
            <p className="text-slate-600">
              Provide justification for marking this compliance alert resolved:
            </p>
            <textarea
              required
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Renewed FDR lien endorsement receipt received and verified..."
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolvingAlertId(null)}
                className="px-3 py-1.5 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Escalation Policy Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Configurable Escalation Rules</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600">
              Adjust the threshold intervals for automated regulatory reminders and statutory escalation:
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Advance Warning Trigger (T-Days before expiry):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={7}
                    max={60}
                    value={tMinusDays}
                    onChange={(e) => setTMinusDays(parseInt(e.target.value) || 30)}
                    className="w-20 p-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-500">days prior to document expiry</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Draft Show-Cause Notice Trigger (T+Days past expiry):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={tPlusDays}
                    onChange={(e) => setTPlusDays(parseInt(e.target.value) || 15)}
                    className="w-20 p-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-500">days overdue before SCN generation</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 rounded text-[11px] text-slate-600">
              Note: This is the prototype's proposed escalation policy under SIH 2026. Custom statutory thresholds can be mapped to individual regional bureaus.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  alert('Escalation thresholds updated in active runtime.');
                  setShowConfigModal(false);
                }}
                className="px-4 py-1.5 bg-teal-800 text-white font-semibold rounded hover:bg-teal-900 cursor-pointer"
              >
                Apply Thresholds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
