import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ApplicationList } from './components/Applications/ApplicationList';
import { DocumentRegister } from './components/Documents/DocumentRegister';
import { InspectionWorkspace } from './components/Inspections/InspectionWorkspace';
import { AlertsManager } from './components/Alerts/AlertsManager';
import { AuditLogView } from './components/AuditTrail/AuditLogView';
import { ReportsView } from './components/Reports/ReportsView';
import { DemoGuideModal } from './components/DemoGuideModal';
import { ShieldCheck, Info, ExternalLink } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDemoScriptOpen, setIsDemoScriptOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Header with Role Switcher & Disclaimer */}
      <Header onOpenDemoScript={() => setIsDemoScriptOpen(true)} />

      {/* Navigation Tab Bar with Role Badges */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'applications' && <ApplicationList />}
        {activeTab === 'documents' && <DocumentRegister />}
        {activeTab === 'inspections' && <InspectionWorkspace />}
        {activeTab === 'alerts' && <AlertsManager />}
        {activeTab === 'audit' && <AuditLogView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Official Government Prototype Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-teal-800" />
              <span>AACE: Next-Gen AICTE Approval & Compliance Engine</span>
              <span className="text-slate-300">|</span>
              <span className="text-teal-900 font-semibold">SIH26262 Prototype</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Developed for Smart India Hackathon 2026 • Workflow Automation, Compliance Monitoring and Alert Management System.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right space-y-0.5">
            <div>All institutional data is fictional for academic demonstration.</div>
            <div>Append-Only SHA-256 Hash Verification • No production AICTE credentials used.</div>
          </div>
        </div>
      </footer>

      {/* 3-Minute Demo Guide Modal */}
      {isDemoScriptOpen && (
        <DemoGuideModal
          onClose={() => setIsDemoScriptOpen(false)}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
