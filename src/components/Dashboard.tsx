import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Navigation';
import { 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ClipboardList, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    applications, 
    documents, 
    alerts, 
    inspections, 
    auditTrail, 
    currentRole,
    getDaysRemaining 
  } = useApp();

  // Operational metrics derived directly from state
  const totalApps = applications.length;
  const pendingReviews = applications.filter(a => 
    ['SCRUTINY_PENDING', 'RESCRUTINY_PENDING'].includes(a.currentStage)
  ).length;
  const appsWithDeficiencies = applications.filter(a => a.currentStage === 'DEFICIENCY_RAISED').length;
  
  const expiringSoonDocs = documents.filter(d => {
    const days = getDaysRemaining(d.expiryDate);
    return days <= 30 && days >= 0 && d.verificationStatus !== 'REJECTED';
  }).length;

  const expiredDocs = documents.filter(d => {
    const days = getDaysRemaining(d.expiryDate);
    return days < 0;
  }).length;

  const pendingInspections = inspections.filter(i => 
    ['SCHEDULED', 'IN_PROGRESS'].includes(i.status)
  ).length;

  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');

  // Role action prompt
  const getRolePrompt = () => {
    switch (currentRole) {
      case 'INSTITUTION_ADMIN':
        return {
          title: 'Action Required for College Registrar',
          desc: appsWithDeficiencies > 0 
            ? `${appsWithDeficiencies} application has an active deficiency returned by Regional Office. Review and submit response.`
            : expiringSoonDocs > 0 
              ? `${expiringSoonDocs} compliance document(s) expiring within 30 days. Upload renewal certificate.`
              : 'All college compliance documents and submissions are up to date.',
          actionLabel: appsWithDeficiencies > 0 ? 'Review Deficiency' : 'View Documents',
          actionTab: appsWithDeficiencies > 0 ? ('applications' as NavTab) : ('documents' as NavTab),
          urgency: appsWithDeficiencies > 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-800'
        };
      case 'REGIONAL_OFFICER':
        return {
          title: 'Regional Scrutiny Desk Queue',
          desc: pendingReviews > 0
            ? `${pendingReviews} technical institution application(s) awaiting regulatory scrutiny and document verification.`
            : 'No applications pending preliminary scrutiny in your regional queue.',
          actionLabel: 'Open Application Queue',
          actionTab: 'applications' as NavTab,
          urgency: pendingReviews > 0 ? 'bg-teal-50 border-teal-300 text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-800'
        };
      case 'EVC_INSPECTOR':
        return {
          title: 'Field Committee Inspection Queue',
          desc: pendingInspections > 0
            ? `${pendingInspections} campus physical inspection(s) scheduled. Complete on-site checklist and submit findings.`
            : 'No active campus inspections pending.',
          actionLabel: 'Open Inspection Workspace',
          actionTab: 'inspections' as NavTab,
          urgency: pendingInspections > 0 ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-slate-50 border-slate-200 text-slate-800'
        };
      case 'CENTRAL_DIRECTOR':
        const draftScnCount = alerts.filter(a => a.showCauseNotice?.status === 'DRAFT_PENDING_APPROVAL').length;
        return {
          title: 'Apex Statutory Authority Queue',
          desc: draftScnCount > 0
            ? `${draftScnCount} automated Draft Show-Cause Notice awaiting statutory sign-off by Central Director.`
            : 'Review final SAC/SHC recommendations and statutory approval queues.',
          actionLabel: draftScnCount > 0 ? 'Review Draft Notices' : 'Review Applications',
          actionTab: draftScnCount > 0 ? ('alerts' as NavTab) : ('applications' as NavTab),
          urgency: draftScnCount > 0 ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-800'
        };
    }
  };

  const rolePrompt = getRolePrompt();

  return (
    <div className="space-y-6">
      {/* Role Action Card */}
      <div className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${rolePrompt.urgency}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-white/80 border border-slate-200 shrink-0">
            <UserCheck className="w-5 h-5 text-teal-800" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{rolePrompt.title}</h2>
            <p className="text-xs text-slate-700 mt-0.5">{rolePrompt.desc}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate(rolePrompt.actionTab)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded transition cursor-pointer shrink-0"
        >
          <span>{rolePrompt.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Operational Dashboard Cards (Derived directly from demo data) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Applications */}
        <div 
          onClick={() => onNavigate('applications')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Apps</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalApps}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>2026-27 Cycle</span>
          </div>
        </div>

        {/* Pending Scrutiny */}
        <div 
          onClick={() => onNavigate('applications')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-800 mt-1">{pendingReviews}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            Regional scrutiny
          </div>
        </div>

        {/* Deficiencies */}
        <div 
          onClick={() => onNavigate('applications')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-amber-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Deficiencies</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{appsWithDeficiencies}</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Awaiting college reply
          </div>
        </div>

        {/* Expiring Soon */}
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-amber-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Expiring &lt;30d</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{expiringSoonDocs}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            T-30 Warning active
          </div>
        </div>

        {/* Overdue / Expired */}
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-rose-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Expired Docs</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{expiredDocs}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            T+15 Escalation active
          </div>
        </div>

        {/* Pending Inspections */}
        <div 
          onClick={() => onNavigate('inspections')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-sky-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>EVC Inspections</span>
            <ClipboardList className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-800 mt-1">{pendingInspections}</div>
          <div className="text-[11px] text-sky-700 mt-1">
            Physical verification
          </div>
        </div>
      </div>

      {/* Grid: Practical Distribution & Actionable Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Workflow Pipeline & Document Health */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Pipeline Status */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Application Approval Workflow Pipeline</h3>
                <p className="text-xs text-slate-500">Configured SIH paths: Scrutiny Only, Scrutiny + EVC, EVC + SAC/SHC</p>
              </div>
              <button 
                onClick={() => onNavigate('applications')} 
                className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline flex items-center gap-1"
              >
                <span>View Register</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {applications.map(app => {
                const stageColor = 
                  app.currentStage === 'FINAL_APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  app.currentStage === 'DEFICIENCY_RAISED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  app.currentStage === 'EVC_RECOMMENDED' || app.currentStage === 'EVC_IN_PROGRESS' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                  'bg-teal-50 text-teal-800 border-teal-200';

                return (
                  <div key={app.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{app.applicationNumber}</span>
                        <span className="text-[10px] text-slate-500">({app.type})</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium truncate max-w-md mt-0.5">
                        {app.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assigned: {app.assignedOfficer}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${stageColor}`}>
                          {app.currentStage.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Score: {app.complianceScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance Documents Health Breakdown */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Compliance Health</h3>
                <p className="text-xs text-slate-500">Calculated strictly from statutory issue/expiry timestamps</p>
              </div>
              <button 
                onClick={() => onNavigate('documents')} 
                className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline flex items-center gap-1"
              >
                <span>View Documents</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="text-xs font-medium text-emerald-800">Valid & Verified</div>
                <div className="text-xl font-bold mt-1">
                  {documents.filter(d => getDaysRemaining(d.expiryDate) > 30 && d.verificationStatus === 'VALID').length}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">&gt; 30 Days Remaining</div>
              </div>

              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-950">
                <div className="text-xs font-medium text-amber-800">Expiring Soon</div>
                <div className="text-xl font-bold mt-1">{expiringSoonDocs}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">0 - 30 Days Remaining</div>
              </div>

              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-950">
                <div className="text-xs font-medium text-rose-800">Expired / Overdue</div>
                <div className="text-xl font-bold mt-1">{expiredDocs}</div>
                <div className="text-[10px] text-rose-700 mt-0.5">Escalated to Director</div>
              </div>

              <div className="p-3 rounded bg-slate-100 border border-slate-200 text-slate-800">
                <div className="text-xs font-medium text-slate-600">Pending Review</div>
                <div className="text-xl font-bold mt-1">
                  {documents.filter(d => d.verificationStatus === 'PENDING_VERIFICATION').length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Regional Officer Check</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Actionable Alerts & Recent Audit Activity */}
        <div className="space-y-6">
          {/* Actionable Alerts Panel */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Regulatory Alerts</h3>
              </div>
              <button 
                onClick={() => onNavigate('alerts')}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline"
              >
                All Alerts ({activeAlerts.length})
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {activeAlerts.slice(0, 3).map(alert => (
                <div 
                  key={alert.id}
                  className={`p-2.5 rounded border text-xs ${
                    alert.severity === 'CRITICAL' ? 'bg-red-50/60 border-red-200' :
                    alert.severity === 'WARNING' ? 'bg-amber-50/60 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">Due: {alert.dueDate}</span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1 leading-snug">
                    {alert.title}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">
                    {alert.institutionName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Log Feed */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Live Regulatory Audit Feed</h3>
              <button 
                onClick={() => onNavigate('audit')}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline"
              >
                Full Trail
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {auditTrail.slice(-4).reverse().map(event => (
                <div key={event.id} className="text-xs border-l-2 border-teal-600 pl-2.5 py-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-medium text-slate-600">{event.actor}</span>
                    <span>{event.timestamp.split(' ')[1]}</span>
                  </div>
                  <div className="font-medium text-slate-800 mt-0.5 leading-snug">
                    {event.summary}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                    Hash: {event.eventHash.slice(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
