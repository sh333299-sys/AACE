import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileCheck2, 
  ClipboardCheck, 
  BellRing, 
  History, 
  BarChart3 
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'applications' 
  | 'documents' 
  | 'inspections' 
  | 'alerts' 
  | 'audit' 
  | 'reports';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { applications, documents, alerts, inspections, currentRole } = useApp();

  // Badges
  const pendingAppsCount = applications.filter(a => {
    if (currentRole === 'INSTITUTION_ADMIN') return a.currentStage === 'DEFICIENCY_RAISED';
    if (currentRole === 'REGIONAL_OFFICER') return ['SCRUTINY_PENDING', 'RESCRUTINY_PENDING'].includes(a.currentStage);
    if (currentRole === 'CENTRAL_DIRECTOR') return a.currentStage === 'SAC_SHC_REVIEW';
    return false;
  }).length;

  const urgentDocsCount = documents.filter(d => {
    const exp = new Date(d.expiryDate).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const pendingInspectionsCount = inspections.filter(i => ['SCHEDULED', 'IN_PROGRESS'].includes(i.status)).length;
  const activeAlertsCount = alerts.filter(a => a.status !== 'RESOLVED').length;

  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'applications' as NavTab,
      label: 'Application Register',
      icon: FileSpreadsheet,
      badge: pendingAppsCount > 0 ? pendingAppsCount : null,
      badgeColor: 'bg-teal-700 text-white'
    },
    {
      id: 'documents' as NavTab,
      label: 'Document Compliance',
      icon: FileCheck2,
      badge: urgentDocsCount > 0 ? urgentDocsCount : null,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'inspections' as NavTab,
      label: 'EVC Inspections',
      icon: ClipboardCheck,
      badge: pendingInspectionsCount > 0 ? pendingInspectionsCount : null,
      badgeColor: 'bg-sky-600 text-white'
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts & Escalations',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'bg-rose-600 text-white'
    },
    {
      id: 'audit' as NavTab,
      label: 'Audit Trail',
      icon: History,
      badge: null
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border-b-2 border-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
