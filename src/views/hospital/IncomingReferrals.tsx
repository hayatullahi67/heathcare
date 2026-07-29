import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useReferral } from '../../context/ReferralContext';
import {
  FileText,
  CheckCircle2,
  Eye,
  X,
  Building,
  Search,
  AlertCircle,
  Clock,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import type { ReferralRequest } from '../../types';

export const IncomingReferrals: React.FC = () => {
  const navigate = useNavigate();
  const { getReferralsForUser } = useReferral();
  const referrals = getReferralsForUser();

  // Filter incoming referrals (only ACCEPTED status)
  const incoming = referrals.filter(r => r.status === 'ACCEPTED');
  
  const [selectedRef, setSelectedRef] = useState<ReferralRequest | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Get unique branches for filtering
  const uniqueBranches = Array.from(new Set(incoming.map(r => r.branchCenter).filter(Boolean)));

  // Filtered referrals
  const filteredIncoming = incoming.filter(ref => {
    const name = (ref.patientName || ref.staffName || '').toLowerCase();
    const pensionId = (ref.pensionId || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || pensionId.includes(query);
    
    const matchesUrgency = urgencyFilter === 'ALL' || ref.urgencyLevel === urgencyFilter;
    const matchesBranch = branchFilter === 'ALL' || ref.branchCenter === branchFilter;

    return matchesSearch && matchesUrgency && matchesBranch;
  });

  // Urgency stats
  const totalCount = incoming.length;
  const emergencyCount = incoming.filter(r => r.urgencyLevel === 'EMERGENCY').length;
  const urgentCount = incoming.filter(r => r.urgencyLevel === 'URGENT').length;
  const routineCount = incoming.filter(r => r.urgencyLevel === 'ROUTINE').length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-bg-primary text-primary flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{totalCount}</h3>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Total Inbound</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-danger-bg text-danger flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{emergencyCount}</h3>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Emergencies</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-warning-bg text-warning flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{urgentCount}</h3>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Urgent Cases</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{routineCount}</h3>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Routine Queue</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base text-text-primary m-0">Incoming Patient Referrals Queue</h3>
        <p className="text-text-muted text-xs m-0 mt-1">
          Overview of authorized patient referrals accepted and forwarded to your facility. Click "Treat Patient" to access their active clinical file.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2.5 bg-bg-primary border border-border-color rounded-lg px-3 py-1.5 w-full md:max-w-md">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search by name or pension ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-text-primary outline-none w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[150px]">
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value as any)}
              className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-1.5 text-xs outline-none w-full cursor-pointer appearance-none pr-8 font-semibold"
            >
              <option value="ALL">All Urgencies</option>
              <option value="ROUTINE">Routine</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-text-muted pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-[150px]">
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-1.5 text-xs outline-none w-full cursor-pointer appearance-none pr-8 font-semibold"
            >
              <option value="ALL">All Branches</option>
              {uniqueBranches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {filteredIncoming.length === 0 ? (
        <div className="bg-bg-secondary border border-border-color rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <CheckCircle2 size={48} className="text-success" />
          <h4 className="font-bold text-sm text-text-primary m-0">No Incoming Referrals Found</h4>
          <p className="text-text-muted text-xs m-0">
            {totalCount === 0
              ? 'There are no incoming patient referrals forwarded to your clinic at this moment.'
              : 'Try adjusting your search query or filter options to find specific referrals.'}
          </p>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-color rounded-xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden-mobile block w-full overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full border-collapse m-0 min-w-[900px]">
              <thead>
                <tr className="border-b border-border-color bg-bg-primary/50 text-text-muted text-xs">
                  <th className="text-left p-3 font-bold uppercase">Patient Details</th>
                  <th className="text-left p-3 font-bold uppercase">Pension ID No.</th>
                  <th className="text-left p-3 font-bold uppercase">Age / Sex</th>
                  <th className="text-left p-3 font-bold uppercase">Urgency</th>
                  <th className="text-left p-3 font-bold uppercase">Branch Center</th>
                  <th className="text-left p-3 font-bold uppercase">Received Date</th>
                  <th className="text-right p-3 font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncoming.map(ref => (
                  <tr key={ref.id} className="border-b border-border-color last:border-none hover:bg-bg-primary/40 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[0.875rem] text-text-primary">
                          {ref.patientName || ref.staffName}
                        </span>
                        <span className="text-text-muted text-[0.7rem]">
                          Relationship: {ref.patientRelationship || 'Self'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm font-semibold text-text-primary">{ref.pensionId || 'N/A'}</span>
                    </td>
                    <td className="p-3 text-[0.875rem] text-text-secondary">
                      <span>{ref.patientAge ? `${ref.patientAge} Yrs / ${ref.patientSex}` : 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap inline-block ${
                        ref.urgencyLevel === 'EMERGENCY'
                          ? 'text-danger bg-danger-bg border-danger/10'
                          : ref.urgencyLevel === 'URGENT'
                          ? 'text-warning bg-warning-bg border-warning/10'
                          : 'text-text-secondary bg-bg-primary border-border-color'
                      }`}>
                        {ref.urgencyLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-primary border border-border-color text-text-secondary">{ref.branchCenter || 'Lafia'}</span>
                    </td>
                    <td className="p-3 text-xs text-text-secondary">
                      {new Date(ref.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedRef(ref)}
                          className="text-xs font-bold px-3 py-1.5 border border-border-color bg-bg-primary text-text-primary hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          <span>Review Details</span>
                        </button>
                        <button
                          onClick={() => navigate('/hospital/patient-care')}
                          className="text-xs font-bold px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          <span>Treat Patient</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="visible-mobile flex flex-col gap-3 p-4 bg-bg-secondary border-t border-border-color">
            {filteredIncoming.map(ref => (
              <div key={ref.id} className="bg-bg-primary border border-border-color rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                    <span className="text-[0.7rem] text-text-muted mt-0.5">Relationship: {ref.patientRelationship || 'Self'}</span>
                  </div>
                  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap inline-block ${
                    ref.urgencyLevel === 'EMERGENCY'
                      ? 'text-danger bg-danger-bg border-danger/10'
                      : ref.urgencyLevel === 'URGENT'
                      ? 'text-warning bg-warning-bg border-warning/10'
                      : 'text-text-secondary bg-bg-primary border-border-color'
                  }`}>
                    {ref.urgencyLevel}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-border-color pt-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Pension ID:</span>
                    <span className="font-mono text-text-secondary font-semibold">{ref.pensionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Age / Sex:</span>
                    <span className="text-text-secondary font-semibold">{ref.patientAge ? `${ref.patientAge} Yrs / ${ref.patientSex}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Branch:</span>
                    <span className="text-text-secondary font-semibold">{ref.branchCenter || 'Lafia'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Received:</span>
                    <span className="text-text-secondary font-semibold">
                      {new Date(ref.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border-color pt-2.5 mt-1">
                  <button
                    onClick={() => setSelectedRef(ref)}
                    className="text-xs font-bold px-3 py-2 border border-border-color bg-bg-primary text-text-primary hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 flex-1"
                  >
                    <Eye size={12} />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/hospital/patient-care');
                    }}
                    className="text-xs font-bold px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 flex-1"
                  >
                    <CheckCircle2 size={12} />
                    <span>Treat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review details modal */}
      {selectedRef && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRef(null)}>
          <div className="bg-bg-secondary border border-border-color rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-color bg-bg-primary/30">
              <h3 className="font-bold text-base text-text-primary m-0">Inbound Referral Review</h3>
              <button className="text-text-muted hover:text-text-primary cursor-pointer border-none bg-transparent" onClick={() => setSelectedRef(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-bg-primary/40 border border-border-color rounded-lg p-4 flex flex-col gap-2.5 text-xs text-text-secondary">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Patient Name:</span>
                  <span className="font-bold text-text-primary">{selectedRef.patientName || selectedRef.staffName} ({selectedRef.patientRelationship || 'Self'})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Pension ID:</span>
                  <span className="font-mono font-bold text-text-primary">{selectedRef.pensionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Age / Sex:</span>
                  <span className="font-bold text-text-primary">{selectedRef.patientAge ? `${selectedRef.patientAge} Yrs / ${selectedRef.patientSex}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Urgency Level:</span>
                  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase ${
                    selectedRef.urgencyLevel === 'EMERGENCY'
                      ? 'text-danger bg-danger-bg border-danger/10'
                      : selectedRef.urgencyLevel === 'URGENT'
                      ? 'text-warning bg-warning-bg border-warning/10'
                      : 'text-text-secondary bg-bg-primary border-border-color'
                  }`}>{selectedRef.urgencyLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Contact Tel:</span>
                  <span className="font-bold text-text-primary">{selectedRef.telephoneNumber || 'N/A'}</span>
                </div>
                {selectedRef.branchCenter && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-muted">Branch Center:</span>
                    <span className="font-bold text-text-primary">{selectedRef.branchCenter}</span>
                  </div>
                )}
                {selectedRef.residentialAddress && (
                  <div className="flex flex-col gap-1 border-t border-border-color border-dashed pt-2.5 mt-1">
                    <span className="font-semibold text-text-muted">Residential Address:</span>
                    <span className="text-[0.8rem] text-text-secondary leading-relaxed">{selectedRef.residentialAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider m-0">Referral Diagnostics</h4>
                <p className="text-xs text-text-secondary bg-bg-primary border border-border-color p-3 rounded-lg leading-relaxed m-0 break-words">
                  {selectedRef.diagnosisDescription}
                </p>
              </div>

              {selectedRef.adminNotes && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider m-0">Administrator Instructions</h4>
                  <p className="text-xs text-text-secondary bg-bg-primary/50 border border-border-color p-3 rounded-lg leading-relaxed m-0 break-words">
                    {selectedRef.adminNotes}
                  </p>
                </div>
              )}

              {selectedRef.attachments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider m-0">Scanned Attachments</h4>
                  <div className="flex flex-col gap-2">
                    {selectedRef.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border border-border-color rounded-lg bg-bg-primary">
                        <FileText size={16} className="text-primary shrink-0" />
                        <span className="text-xs font-semibold text-text-primary break-all">{file.name} ({file.size})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border-color bg-bg-primary/30">
              <button
                onClick={() => setSelectedRef(null)}
                className="flex-1 text-xs font-bold px-3 py-2 border border-border-color bg-bg-primary text-text-primary hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRef(null);
                  navigate('/hospital/patient-care');
                }}
                className="flex-[2] text-xs font-bold px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Begin Treatment</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
