import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferral } from '../../context/ReferralContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getReferralsForUser } = useReferral();
  const userReferrals = getReferralsForUser();

  if (!currentUser) return null;

  // Count authorizations pending review
  const pendingReviewsCount = userReferrals.filter(
    r => r.status === 'PENDING_ADMIN' || r.status === 'INFO_REQUESTED'
  ).length;

  // Count active clinical authorizations
  const activeAuthCount = userReferrals.filter(
    r => r.status === 'APPROVED_FORWARDED' || r.status === 'ACCEPTED'
  ).length;

  // Count completed treatments
  const completedCount = userReferrals.filter(
    r => r.status === 'TREATMENT_COMPLETED'
  ).length;

  // Format date helper (e.g., Oct 12, 2023)
  const formatDateString = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to resolve request procedure type from diagnosis description
  const resolveProcedureType = (desc: string) => {
    const text = desc.toLowerCase();
    if (text.includes('osteoarthritis') || text.includes('orthopedic') || text.includes('knee')) {
      return 'Orthopedic Consultation';
    }
    if (text.includes('cataract') || text.includes('eye') || text.includes('ophthalm')) {
      return 'Ophthalmology Exam';
    }
    if (text.includes('cardiac') || text.includes('hypertension') || text.includes('heart')) {
      return 'Cardiac Sync';
    }
    if (text.includes('blood') || text.includes('lab') || text.includes('panel')) {
      return 'Blood Panel';
    }
    return 'General Diagnostic';
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Welcome & Start Request Row */}
      <div className="flex  justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight m-0">Welcome back, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-text-muted text-sm mt-1 mb-0">
            You have {pendingReviewsCount} medical requests pending authorization review.
          </p>
        </div>

        <div className='w-[150px]'>
        <button
          onClick={() => navigate('/staff/new-request')}
          className="bg-[#005f73] hover:bg-[#005f73]/90 text-white w-full sm:w-[170px] h-10 flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all shrink-0"
        >
          {/* <Zap size={16} fill="white" /> */}
          <span>Start New Request</span>
        </button>
        </div>
      </div>

      {/* Metrics Grid (Stats Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pending */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-secondary">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-warning-bg text-warning flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
            {pendingReviewsCount}
          </div>
          <span className="text-xs text-text-muted font-medium">Awaiting admin routing</span>
        </div>

        {/* Card 2: Active */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-secondary">Active Treatments</span>
            <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
            {activeAuthCount}
          </div>
          <span className="text-xs text-text-muted font-medium">Forwarded to clinic node</span>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-secondary">Completed Cases</span>
            <div className="w-8 h-8 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
            {completedCount}
          </div>
          <span className="text-xs text-text-muted font-medium">Discharged from clinic care</span>
        </div>

        {/* Card 4: Total */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-secondary">Total Claims</span>
            <div className="w-8 h-8 rounded-lg bg-bg-primary text-text-secondary flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
            {userReferrals.length}
          </div>
          <span className="text-xs text-text-muted font-medium">Total requested authorizations</span>
        </div>
      </div>

      {/* Card 4: Recent Medical Requests Table */}
      <div className="bg-bg-secondary border border-border-color rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border-color pb-3">
          <h3 className="font-bold text-base text-text-primary m-0">Recent Medical Requests</h3>
          <button
            onClick={() => navigate('/staff/history')}
            className="text-xs font-bold text-primary bg-transparent border-none hover:underline cursor-pointer"
          >
            View All History
          </button>
        </div>

        {userReferrals.length === 0 ? (
          <p className="text-text-muted text-sm text-center p-4 m-0">No requests submitted.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden-mobile w-full overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full border-collapse m-0 min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-color text-text-muted text-xs">
                    <th className="text-left pb-3 font-bold uppercase">Patient Name</th>
                    <th className="text-left pb-3 font-bold uppercase">Type</th>
                    <th className="text-left pb-3 font-bold uppercase">Date</th>
                    <th className="text-left pb-3 font-bold uppercase">Reference</th>
                    <th className="text-left pb-3 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userReferrals.slice(0, 4).map(ref => (
                    <tr key={ref.id} className="border-b border-border-color last:border-none hover:bg-bg-primary/50 transition-colors">
                      <td className="py-3 font-bold text-[0.875rem] text-text-primary">{ref.patientName || ref.staffName}</td>
                      <td className="py-3 text-[0.875rem] text-text-secondary">{resolveProcedureType(ref.diagnosisDescription)}</td>
                      <td className="py-3 text-[0.875rem] text-text-secondary">{formatDateString(ref.createdAt)}</td>
                      <td className="py-3 font-mono text-xs text-text-secondary">{ref.id}</td>
                      <td className="py-3">
                        <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded whitespace-nowrap uppercase ${ref.status === 'TREATMENT_COMPLETED' || ref.status === 'APPROVED_FORWARDED' || ref.status === 'ACCEPTED'
                            ? 'text-success bg-success-bg border border-success/10'
                            : ref.status === 'INFO_REQUESTED'
                              ? 'text-warning bg-warning-bg border border-warning/10'
                              : ref.status === 'REJECTED'
                                ? 'text-danger bg-danger-bg border border-danger/10'
                                : 'text-text-secondary bg-bg-primary border border-border-color'
                          }`}>
                          {ref.status === 'TREATMENT_COMPLETED'
                            ? 'Completed'
                            : ref.status === 'APPROVED_FORWARDED' || ref.status === 'ACCEPTED'
                              ? 'Approved'
                              : ref.status === 'INFO_REQUESTED'
                                ? 'Pending Info'
                                : ref.status === 'REJECTED'
                                  ? 'Rejected'
                                  : 'Reviewing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="visible-mobile flex flex-col gap-3">
              {userReferrals.slice(0, 4).map(ref => (
                <div 
                  key={ref.id} 
                  onClick={() => navigate('/staff/history')}
                  className="bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col gap-3 hover:bg-bg-primary/50 transition-colors cursor-pointer active:scale-[0.99] shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                      <span className="font-mono text-[0.7rem] text-text-muted mt-0.5">{ref.id}</span>
                    </div>
                    <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded whitespace-nowrap uppercase ${ref.status === 'TREATMENT_COMPLETED' || ref.status === 'APPROVED_FORWARDED' || ref.status === 'ACCEPTED'
                        ? 'text-success bg-success-bg border border-success/10'
                        : ref.status === 'INFO_REQUESTED'
                          ? 'text-warning bg-warning-bg border border-warning/10'
                          : ref.status === 'REJECTED'
                            ? 'text-danger bg-danger-bg border border-danger/10'
                            : 'text-text-secondary bg-bg-primary border border-border-color'
                      }`}>
                      {ref.status === 'TREATMENT_COMPLETED'
                        ? 'Completed'
                        : ref.status === 'APPROVED_FORWARDED' || ref.status === 'ACCEPTED'
                          ? 'Approved'
                          : ref.status === 'INFO_REQUESTED'
                            ? 'Pending Info'
                            : ref.status === 'REJECTED'
                              ? 'Rejected'
                              : 'Reviewing'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-t border-border-color pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Procedure Type:</span>
                      <span className="text-text-secondary font-semibold">{resolveProcedureType(ref.diagnosisDescription)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Date Submitted:</span>
                      <span className="text-text-secondary font-semibold">{formatDateString(ref.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
