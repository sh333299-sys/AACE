import React from 'react';
import { useApp } from '../context/AppContext';
import { USER_ROLES } from '../data/seedData';
import { UserRole } from '../types';
import { ShieldCheck, RotateCcw, PlayCircle, Building2, UserCheck, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenDemoScript: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDemoScript }) => {
  const { currentRole, setRole, resetDemoData, alerts, applications, documents } = useApp();

  const currentRoleInfo = USER_ROLES.find(r => r.id === currentRole) || USER_ROLES[0];

  // Dynamic counts for quick header badge
  const pendingApps = applications.filter(a => ['SCRUTINY_PENDING', 'RESCRUTINY_PENDING', 'SAC_SHC_REVIEW'].includes(a.currentStage)).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const expiringDocs = documents.filter(d => {
    const exp = new Date(d.expiryDate).getTime();
    const today = new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  }).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Gov Identifier Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-200">Smart India Hackathon 2026</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Problem Statement ID: SIH26262</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">Regulatory Workflow Automation Engine</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-amber-900/60 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Prototype Demo — Fictional Data
          </span>
          <button 
            onClick={resetDemoData}
            title="Reset sample data to initial state"
            className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-xs tracking-tighter shrink-0 border border-teal-900">
            AACE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                AICTE Approval & Compliance Engine
              </h1>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">
                v2026.1
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Integrated Statutory Approval Workflow, Real-Time Compliance Audit & Escalation Management
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDemoScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded transition cursor-pointer shadow-2xs"
          >
            <PlayCircle className="w-4 h-4 text-teal-700" />
            <span>3-Min Demo Script</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300">
            <span className="text-[11px] font-semibold uppercase text-slate-500 px-2 hidden lg:inline">
              Active Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white text-xs font-medium text-slate-800 py-1 px-2.5 rounded border border-slate-300 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              {USER_ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role Banner / Context Info */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-1.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-teal-700" />
          <span className="font-semibold text-slate-800">{currentRoleInfo.title}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{currentRoleInfo.department}</span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-slate-500 hidden md:inline">{currentRoleInfo.description}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">Live Queue:</span>
          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
            Pending Apps: <strong className="text-slate-900">{pendingApps}</strong>
          </span>
          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-amber-700">
            Expiring Soon: <strong>{expiringDocs}</strong>
          </span>
          {criticalAlerts > 0 && (
            <span className="bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-red-700 font-semibold">
              Critical Alerts: {criticalAlerts}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
