import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useReferral } from '../../context/ReferralContext';
import { Badge } from '../../components/common/Badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileCheck,
  Building,
  User,
  Download,
  X,
  Clock,
  CheckCircle2,
  Phone,
  ClipboardList,
  Stethoscope,
  Paperclip,
  Activity,
  History
} from 'lucide-react';
import type { ReferralRequest } from '../../types';

export const ReferralReview: React.FC = () => {
  const { referrals, updateReferralStatus } = useReferral();
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return referrals.length > 0 ? referrals[0].id : null;
  });
  const [showDetailedReport, setShowDetailedReport] = useState<ReferralRequest | null>(null);

  // Filters state
  const [referralSearch, setReferralSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  // Action states
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'MORE_INFO' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [moreInfoNotes, setMoreInfoNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const selectedRef = referrals.find(r => r.id === selectedId);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef) return;

    setActionLoading(true);
    let success = false;

    if (actionType === 'APPROVE') {
      const res = await updateReferralStatus(selectedRef.id, 'APPROVED_FORWARDED', {
        adminNotes: adminNotes || 'Approved by system administrator.'
      });
      success = res.success;
    } else if (actionType === 'REJECT') {
      const res = await updateReferralStatus(selectedRef.id, 'REJECTED', {
        adminNotes: adminNotes || 'Rejected. Does not meet retirement benefit guidelines.'
      });
      success = res.success;
    } else if (actionType === 'MORE_INFO') {
      const res = await updateReferralStatus(selectedRef.id, 'INFO_REQUESTED', {
        moreInfoNotes: moreInfoNotes
      });
      success = res.success;
    }

    setActionLoading(false);
    if (success) {
      // Clear forms and return to list
      setActionType(null);
      setAdminNotes('');
      setMoreInfoNotes('');
      setViewMode('LIST');
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch =
      ref.staffName.toLowerCase().includes(referralSearch.toLowerCase()) ||
      (ref.pensionId && ref.pensionId.toLowerCase().includes(referralSearch.toLowerCase())) ||
      ref.hospitalName.toLowerCase().includes(referralSearch.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ref.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || ref.urgencyLevel === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const totalCount = referrals.length;
  const pendingCount = referrals.filter(r => r.status === 'PENDING_ADMIN').length;
  const activeCount = referrals.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED_FORWARDED').length;
  const completedCount = referrals.filter(r => r.status === 'TREATMENT_COMPLETED').length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {viewMode === 'LIST' ? (
        <>
          {/* Title Header */}
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-text-primary m-0">Referral Review Queue</h2>
            <p className="text-text-muted text-sm mt-1 mb-0">Audit, route, and authorize medical referral claims submitted by retirees.</p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
            {/* Pending review */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-secondary">Pending Review</span>
                <div className="w-8 h-8 rounded-lg bg-warning-bg text-warning flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
                {pendingCount}
              </div>
              <span className="text-xs text-text-muted font-medium">Requires admin response</span>
            </div>

            {/* Active referrals */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-secondary">Active Referrals</span>
                <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center">
                  <ClipboardList size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
                {activeCount}
              </div>
              <span className="text-xs text-text-muted font-medium">Currently under clinic care</span>
            </div>

            {/* Completed */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-secondary">Completed Treatments</span>
                <div className="w-8 h-8 rounded-lg bg-success-bg text-success flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
                {completedCount}
              </div>
              <span className="text-xs text-text-muted font-medium">Discharged & certified cases</span>
            </div>

            {/* Total */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-secondary">Total Submissions</span>
                <div className="w-8 h-8 rounded-lg bg-bg-primary text-text-secondary flex items-center justify-center">
                  <FileText size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-text-primary leading-none mt-1">
                {totalCount}
              </div>
              <span className="text-xs text-text-muted font-medium">Total lifetime claims</span>
            </div>
          </div>

          {/* Table Filters Bar */}
          <div className="flex flex-col w-full min-w-0 overflow-hidden">
            <div className="bg-bg-secondary border border-border-color border-b-0 rounded-t-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                {/* Search referrals */}
                <input
                  type="text"
                  placeholder="Search referrals..."
                  value={referralSearch}
                  onChange={e => setReferralSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border-color bg-bg-primary text-text-primary outline-none w-full sm:w-[200px]"
                />

                {/* Filter by Status */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border-color bg-bg-primary text-text-primary cursor-pointer font-semibold outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_ADMIN">Pending Review</option>
                  <option value="APPROVED_FORWARDED">Approved & Forwarded</option>
                  <option value="ACCEPTED">Accepted / Active</option>
                  <option value="TREATMENT_COMPLETED">Treatment Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="INFO_REQUESTED">More Info Requested</option>
                </select>

                {/* Filter by Urgency */}
                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border-color bg-bg-primary text-text-primary cursor-pointer font-semibold outline-none"
                >
                  <option value="ALL">All Urgency Levels</option>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <span className="text-xs text-text-secondary font-medium shrink-0">
                Total found: {filteredReferrals.length} case(s)
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden-mobile block w-full overflow-x-auto -webkit-overflow-scrolling-touch border border-border-color bg-bg-secondary rounded-b-xl">
              <table className="w-full border-collapse m-0 min-w-[950px]">
                <thead>
                  <tr className="border-b border-border-color bg-bg-primary">
                    <th className="text-left py-3 px-4 text-xs uppercase text-text-muted font-bold">Patient / Pension ID</th>
                    <th className="text-left py-3 px-4 text-xs uppercase text-text-muted font-bold">Assigned Hospital</th>
                    <th className="text-left py-3 px-4 text-xs uppercase text-text-muted font-bold">Urgency Level</th>
                    <th className="text-left py-3 px-4 text-xs uppercase text-text-muted font-bold">Submission Date</th>
                    <th className="text-left py-3 px-4 text-xs uppercase text-text-muted font-bold">Status</th>
                    <th className="text-center py-3 px-4 text-xs uppercase text-text-muted font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted text-[0.95rem]">
                        No referrals found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map(ref => (
                      <tr key={ref.id} className="border-b border-border-color hover:bg-bg-primary/45 transition-colors last:border-none">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[0.875rem] text-text-primary leading-tight">{ref.patientName || ref.staffName}</span>
                            <span className="text-[0.75rem] text-text-secondary mt-0.5 font-mono">Pension ID: {ref.pensionId || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[0.875rem] text-text-primary">
                          {ref.hospitalName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-bg-primary text-text-secondary border border-border-color">
                            {ref.urgencyLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[0.85rem] text-text-secondary">
                          {new Date(ref.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={ref.status} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedId(ref.id);
                              setViewMode('DETAIL');
                            }}
                            className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            Review Case
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="visible-mobile flex flex-col gap-3 p-4 bg-bg-secondary border border-border-color border-t-none rounded-b-xl">
              {filteredReferrals.length === 0 ? (
                <div className="text-center p-6 text-text-muted text-sm border border-border-color rounded-lg bg-bg-secondary">
                  No referrals found matching current filters.
                </div>
              ) : (
                filteredReferrals.map(ref => (
                  <div key={ref.id} className="bg-bg-primary border border-border-color rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                        <span className="text-[0.7rem] text-text-muted mt-0.5 font-mono">Pension ID: {ref.pensionId || 'N/A'}</span>
                      </div>
                      <Badge status={ref.status} />
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-border-color pt-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Clinic Partner:</span>
                        <span className="text-text-secondary font-semibold text-right max-w-[200px] truncate">{ref.hospitalName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Urgency:</span>
                        <span className="text-text-secondary font-bold uppercase">{ref.urgencyLevel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Submitted:</span>
                        <span className="text-text-secondary font-semibold">
                          {new Date(ref.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedId(ref.id);
                        setViewMode('DETAIL');
                      }}
                      className="px-3 py-2 rounded bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all cursor-pointer text-center w-full mt-1.5"
                    >
                      Review Case File
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full animate-fade-in">
          {/* Back Header navigation */}
          <div>
            <button
              onClick={() => {
                setViewMode('LIST');
                setActionType(null);
              }}
              className="px-4 py-2 font-bold text-sm flex items-center gap-2 border border-border-color rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-primary transition-all cursor-pointer"
            >
              ← Back to Queue
            </button>
          </div>

          {/* Details Card */}
          {selectedRef && (
            <div className="w-full max-w-4xl mx-auto bg-bg-secondary p-6 sm:p-8 rounded-xl border border-border-color shadow-md flex flex-col gap-6">
              {/* Header Block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color pb-4">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Referral Case File</span>
                  <h2 className="text-2xl font-extrabold text-text-primary m-0 mt-1">{selectedRef.patientName || selectedRef.staffName}</h2>
                  <p className="text-xs text-text-muted m-0 mt-1">Submitted: {new Date(selectedRef.createdAt).toLocaleString()} | Case ID: {selectedRef.id}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <Badge status={selectedRef.status} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-bg-primary text-text-secondary border border-border-color">
                    Urgency: {selectedRef.urgencyLevel}
                  </span>
                </div>
              </div>

              {/* Section 1: Patient & Provider Info Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Info Column */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-border-color pb-2 m-0 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <span>Patient Demographics</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Patient Name</span>
                      <strong className="text-text-primary font-bold text-sm">{selectedRef.patientName || selectedRef.staffName}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Pension Reg. ID</span>
                      <strong className="text-text-primary font-mono font-bold text-sm">{selectedRef.pensionId || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Relationship</span>
                      <strong className="text-text-primary font-bold text-sm">{selectedRef.patientRelationship || 'Self'}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Age / Gender</span>
                      <strong className="text-text-primary font-bold text-sm">{selectedRef.patientAge ? `${selectedRef.patientAge} Yrs / ${selectedRef.patientSex}` : 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Prior Department</span>
                      <strong className="text-text-primary font-bold text-sm">{selectedRef.departmentAtExit || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Branch Center</span>
                      <strong className="text-text-primary font-bold text-sm">{selectedRef.branchCenter || 'N/A'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-muted font-bold block mb-0.5">Contact Telephone</span>
                      <strong className="text-text-primary font-bold text-sm flex items-center gap-1.5">
                        <Phone size={12} className="text-text-muted" />
                        {selectedRef.telephoneNumber || 'N/A'}
                      </strong>
                    </div>
                    {selectedRef.residentialAddress && (
                      <div className="col-span-2">
                        <span className="text-text-muted font-bold block mb-0.5">Residential Address</span>
                        <span className="text-text-secondary leading-relaxed font-semibold">{selectedRef.residentialAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provider Info Column */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-border-color pb-2 m-0 flex items-center gap-2">
                    <Building size={16} className="text-primary" />
                    <span>Assigned Healthcare Provider</span>
                  </h3>
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Hospital / Clinic Partner</span>
                      <strong className="text-text-primary text-sm sm:text-base font-bold">{selectedRef.hospitalName}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted font-bold block mb-0.5">Facility System ID</span>
                      <strong className="text-text-primary font-mono font-bold text-sm">{selectedRef.hospitalId}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical Details */}
              <div className="flex flex-col gap-3 border-t border-border-color pt-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary m-0 flex items-center gap-2">
                  <Stethoscope size={16} className="text-primary" />
                  <span>Treatment Request Rationale</span>
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed bg-bg-primary border border-border-color rounded-lg p-4 m-0 whitespace-pre-line">
                  {selectedRef.diagnosisDescription}
                </p>
              </div>

              {/* Section 3: Attachments */}
              <div className="flex flex-col gap-3 border-t border-border-color pt-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary m-0 flex items-center gap-2">
                  <Paperclip size={16} className="text-primary" />
                  <span>Scanned Medical Attachments</span>
                </h3>
                {selectedRef.attachments.length === 0 ? (
                  <p className="text-text-muted text-xs m-0">No files uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRef.attachments.map((file, idx) => (
                      <div key={idx} className="p-3 bg-bg-primary border border-border-color rounded-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={16} className="text-primary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-text-primary truncate">{file.name}</span>
                            <span className="text-[0.7rem] text-text-muted mt-0.5">({file.size})</span>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg border border-border-color bg-bg-secondary text-text-secondary hover:bg-bg-primary hover:text-primary transition-all flex items-center justify-center cursor-pointer font-bold shrink-0 ml-2" title="Download File">
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hospital Treatment Report Display */}
              {selectedRef.status === 'TREATMENT_COMPLETED' && selectedRef.treatmentReport && (
                <div className="bg-success-bg border border-success/20 rounded-xl p-5 flex flex-col gap-4 shadow-sm mt-2">
                  <div className="flex justify-between items-center border-b border-success/15 pb-2">
                    <h4 className="text-success font-bold text-sm flex items-center gap-2 m-0">
                      <FileCheck size={18} />
                      <span>Completed Medical Report</span>
                    </h4>
                    <span className="text-success font-bold text-xs">
                      Completed: {new Date(selectedRef.treatmentReport.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-semibold text-text-secondary">Confirmed Diagnosis:</span>
                      <span className="text-text-primary font-bold text-right max-w-[240px]">{selectedRef.treatmentReport.diagnosisConfirmed}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-semibold text-text-secondary">Treatments Provided:</span>
                      <span className="text-text-primary font-bold text-right max-w-[240px]">{selectedRef.treatmentReport.treatmentProvided.split(' | ')[0]}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-semibold text-text-secondary">Attending Physician:</span>
                      <span className="text-text-primary font-bold">{selectedRef.treatmentReport.physicianName}</span>
                    </div>
                    {selectedRef.treatmentReport.invoiceNo && (
                      <button
                        onClick={() => setShowDetailedReport(selectedRef)}
                        className="w-full sm:w-auto mt-2 px-4 py-2 font-bold text-xs flex items-center justify-center gap-2 rounded-lg border border-border-color bg-bg-primary text-text-primary hover:bg-bg-secondary transition-all cursor-pointer shadow-sm animate-pulse"
                      >
                        <FileText size={14} />
                        <span>View Official Discharge Form & Bill</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Case Review History */}
              {(selectedRef.adminNotes || selectedRef.moreInfoRequestedNotes) && (
                <div className="flex flex-col gap-3 border-t border-border-color pt-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary m-0 flex items-center gap-2">
                    <History size={16} className="text-primary" />
                    <span>Case Review History</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedRef.adminNotes && (
                      <div className="p-4 rounded-lg border-l-4 bg-primary-lightest border-primary flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">Admin Review Decision Notes</span>
                        <p className="text-xs text-text-secondary leading-relaxed m-0">{selectedRef.adminNotes}</p>
                      </div>
                    )}

                    {selectedRef.moreInfoRequestedNotes && (
                      <div className="p-4 rounded-lg border-l-4 bg-info-bg border-info flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-info font-extrabold">Information Clarification Requested</span>
                        <p className="text-xs text-text-secondary leading-relaxed m-0">{selectedRef.moreInfoRequestedNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decision Interactive Actions Area */}
              {selectedRef.status === 'PENDING_ADMIN' && (
                <div className="border-t border-border-color pt-6 mt-2 flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary m-0 flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <span>Review Decision & Authorization</span>
                  </h3>

                  {!actionType ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <button
                        onClick={() => setActionType('APPROVE')}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle size={18} />
                        <span>Approve & Forward</span>
                      </button>
                      <button
                        onClick={() => setActionType('MORE_INFO')}
                        className="flex-1 flex items-center justify-center gap-2 bg-bg-primary border border-border-color hover:bg-bg-secondary text-primary py-3 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer"
                      >
                        <HelpCircle size={18} />
                        <span>Request Information</span>
                      </button>
                      <button
                        onClick={() => setActionType('REJECT')}
                        className="flex-1 flex items-center justify-center gap-2 bg-bg-primary border border-border-color hover:bg-bg-secondary text-danger py-3 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer"
                      >
                        <XCircle size={18} />
                        <span>Reject Request</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleActionSubmit} className="bg-bg-primary border border-border-color rounded-xl p-5 flex flex-col gap-4 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-border-color pb-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary m-0">
                          {actionType === 'APPROVE'
                            ? 'Confirm Approval and Forwarding'
                            : actionType === 'REJECT'
                              ? 'Reject Referral request'
                              : 'Request Further Clarification'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActionType(null)}
                          className="px-2.5 py-1 text-xs rounded border border-border-color bg-bg-secondary text-text-secondary hover:bg-bg-primary transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {actionType === 'APPROVE' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-text-secondary" htmlFor="admin-notes-approve">Administrative Approval Instructions (Optional)</label>
                          <textarea
                            id="admin-notes-approve"
                            className="px-3 py-2 text-xs rounded-lg border border-border-color bg-bg-secondary text-text-primary outline-none focus:border-primary transition-all"
                            rows={3}
                            placeholder="Add specific treatment instructions or referral limit notes..."
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                          />
                          <p className="text-[0.7rem] text-text-muted m-0">
                            Approving will automatically route this referral request directly to <strong>{selectedRef.hospitalName}</strong>.
                          </p>
                        </div>
                      )}

                      {actionType === 'REJECT' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-text-secondary" htmlFor="admin-notes-reject">Rejection Rationale (Required)</label>
                          <textarea
                            id="admin-notes-reject"
                            className="px-3 py-2 text-xs rounded-lg border border-border-color bg-bg-secondary text-text-primary outline-none focus:border-primary transition-all"
                            rows={3}
                            placeholder="Explain why this medical request was rejected (e.g. treatments not covered, files illegible)..."
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {actionType === 'MORE_INFO' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-text-secondary" htmlFor="info-notes-input">Details Needed from Staff Member (Required)</label>
                          <textarea
                            id="info-notes-input"
                            className="px-3 py-2 text-xs rounded-lg border border-border-color bg-bg-secondary text-text-primary outline-none focus:border-primary transition-all"
                            rows={3}
                            placeholder="List the specific questions or missing documents you need the staff member to address..."
                            value={moreInfoNotes}
                            onChange={e => setMoreInfoNotes(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all shadow-sm cursor-pointer mt-1"
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Saving action...' : 'Confirm Action'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW COMPLETED DISCHARGE CASE SUMMARY MODAL (Section C & D Paper Style) */}
      {showDetailedReport && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[1100] flex justify-center items-start overflow-y-auto p-4 sm:p-8 animate-fade-in" onClick={() => setShowDetailedReport(null)}>
          <div className="bg-bg-secondary border border-border-color rounded-xl shadow-2xl w-full max-w-[750px] mx-auto flex flex-col relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-border-color">
              <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Discharged & Certified Case File</div>
              <button className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-full hover:bg-bg-primary transition-all flex items-center justify-center" onClick={() => setShowDetailedReport(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-180px)] p-6 sm:p-10 bg-white text-slate-800 rounded-b-xl responsive-paper-body">
              {/* Paper Form Title */}
              <div className="text-center border-b-2 border-double border-slate-600 pb-5 mb-6">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-wider m-0">CENTRAL BANK OF NIGERIA</h2>
                <h3 className="text-sm font-bold text-slate-700 m-0 mt-1.5 tracking-wide">MEDICAL SERVICES DIVISION REFERRAL DISCHARGE FORM</h3>
                <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-2 m-0">Closed Case • Official Clinical Billing Certificate</p>
              </div>

              {showDetailedReport.treatmentReport && (
                <div className="flex flex-col gap-6 text-xs text-slate-700">
                  {/* SECTION C SUMMARY */}
                  <div className="border border-slate-300 rounded p-5 bg-white">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase -mx-5 -mt-5 mb-5 px-5 py-2.5 bg-slate-100 border-b border-slate-300 rounded-t">(C) COMPLETED BY THE HOSPITAL/CLINIC</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">HOSPITAL/CLINIC NAME</span>
                        <p className="font-extrabold text-sm text-slate-900 m-0 mt-0.5">{showDetailedReport.treatmentReport.hospitalClinicName || showDetailedReport.hospitalName}</p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">CARE SETTING TYPE</span>
                        <p className="font-semibold text-slate-900 m-0 mt-0.5">{showDetailedReport.treatmentReport.careType === 'OPD' ? 'OPD (OUT-PATIENT)' : 'IN-PATIENT'}</p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">HOSPITAL BILL INVOICE NO.</span>
                        <p className="font-mono font-extrabold text-emerald-600 m-0 mt-0.5 text-sm">{showDetailedReport.treatmentReport.invoiceNo || 'N/A'}</p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">TIME REPORTED AT HOSPITAL</span>
                        <p className="text-slate-900 m-0 mt-0.5 font-medium">{showDetailedReport.treatmentReport.timeReported || 'N/A'}</p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">DATE OF ADMISSION</span>
                        <p className="text-slate-900 m-0 mt-0.5 font-medium">
                          {showDetailedReport.treatmentReport.dateOfAdmission
                            ? new Date(showDetailedReport.treatmentReport.dateOfAdmission).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">ATTENDING DOCTOR</span>
                        <p className="font-semibold text-slate-900 m-0 mt-0.5">{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</p>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">TEL (OFFICE)</span>
                        <p className="text-slate-900 m-0 mt-0.5 font-medium">{showDetailedReport.treatmentReport.telOffice || 'N/A'}</p>
                      </div>

                      <div className="md:col-span-2 border-b border-dashed border-slate-200 pb-2">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">TEL (RESIDENT/MOBILE)</span>
                        <p className="text-slate-900 m-0 mt-0.5 font-medium">{showDetailedReport.treatmentReport.telOffice || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* CLINICAL REPORTS SUMMARY */}
                  <div className="border border-slate-300 rounded p-5 bg-white">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase -mx-5 -mt-5 mb-5 px-5 py-2.5 bg-slate-100 border-b border-slate-300 rounded-t">CLINICAL REPORTS</h4>

                    <div className="grid grid-cols-1 md:grid-cols-12 border border-slate-400 rounded overflow-hidden">
                      <div className="md:col-span-7 p-4 border-b md:border-b-0 md:border-r border-slate-400 bg-white flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">DIAGNOSIS (CONFIRMED CLINICAL FINDINGS)</span>
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-700 min-h-[100px] whitespace-pre-wrap font-medium">
                            {showDetailedReport.treatmentReport.diagnosisConfirmed}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">MEDICATIONS PRESCRIBED & THERAPIES</span>
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-700 min-h-[100px] whitespace-pre-wrap font-medium">
                            {showDetailedReport.treatmentReport.clinicalMedications || 'No medications recorded.'}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-5 p-4 bg-slate-50 flex flex-col gap-1">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">INVESTIGATION (PATHOLOGY, RADIOLOGY, ETC.)</span>
                        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-700 md:min-h-[235px] whitespace-pre-wrap font-medium">
                          {showDetailedReport.treatmentReport.clinicalInvestigation || 'No investigations recorded.'}
                        </div>
                      </div>
                    </div>

                    {showDetailedReport.treatmentReport.treatmentProvided && !showDetailedReport.treatmentReport.treatmentProvided.startsWith('Investigations:') && (
                      <div className="flex flex-col gap-1 mt-4">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">CLINICAL OVERVIEW & SUMMARY</span>
                        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                          {showDetailedReport.treatmentReport.treatmentProvided.split(' | ')[0]}
                        </div>
                      </div>
                    )}

                    {/* Doctor verification details */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 border border-slate-200 rounded p-4 mt-4">
                      <div className="flex-1 min-w-0 w-full">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">ATTENDING PHYSICIAN</span>
                        <p className="font-extrabold text-sm text-slate-900 m-0 mt-1">{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</p>
                      </div>

                      <div className="flex-1 w-full">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">DOCTOR'S DIGITAL SIGNATURE</span>
                        <div className="h-12 border border-slate-300 bg-slate-50 flex items-center justify-center rounded">
                          <span className="font-serif italic text-blue-800 text-2xl tracking-wide">{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-[120px]">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">DATE SIGNED</span>
                        <p className="text-slate-900 font-medium m-0 mt-1.5">
                          {showDetailedReport.treatmentReport.doctorSignDate
                            ? new Date(showDetailedReport.treatmentReport.doctorSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION D BILLING SUMMARY */}
                  <div className="border border-slate-300 rounded p-5 bg-white">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase -mx-5 -mt-5 mb-5 px-5 py-2.5 bg-slate-100 border-b border-slate-300 rounded-t">(D) MEDICAL BILL / INVOICE SUMMARY</h4>

                    <div className="billing-table-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                      <table className="w-full border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="w-16 text-center text-[0.65rem] font-bold text-slate-600 py-2 px-3 border-b-2 border-slate-300 uppercase">S/NO</th>
                            <th className="text-left text-[0.65rem] font-bold text-slate-600 py-2 px-3 border-b-2 border-slate-300 uppercase">BILL ITEM / SERVICE DESCRIPTION</th>
                            <th className="w-40 text-center text-[0.65rem] font-bold text-slate-600 py-2 px-3 border-b-2 border-slate-300 uppercase">UNITS / MULTIPLIER</th>
                            <th className="w-44 text-right text-[0.65rem] font-bold text-slate-600 py-2 px-3 border-b-2 border-slate-300 uppercase">COST (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showDetailedReport.treatmentReport.billingRegistration ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">1</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Registration / Administration Fee</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingRegistration.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingConsultation ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">2</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Professional Consultation Fee</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingConsultation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingBeddingAmount ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">3</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Bedding / Ward Accommodation</td>
                              <td className="py-2 px-3 text-center text-slate-500">{showDetailedReport.treatmentReport.billingBeddingDays || 0} Days</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingBeddingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingFeedingAmount ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">4</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Catering / Patient Feeding Services</td>
                              <td className="py-2 px-3 text-center text-slate-500">{showDetailedReport.treatmentReport.billingFeedingDays || 0} Days</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingFeedingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingDrugs ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">5</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Prescribed Drugs, Injections & Medications</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingDrugs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingSurgical ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">6</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Surgical Operation / Delivery Procedures</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingSurgical.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingAnesthesia ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">7</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Anesthetic Administration / Medications</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingAnesthesia.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingTheater ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">8</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Operating Theater Facility Fees</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingTheater.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingLabs ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">9</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Clinical Laboratory Diagnostics / Pathology</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingLabs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingScans ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">10</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Imaging (E.C.G. / X-Rays / Ultrasound Scan)</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingScans.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingBloodAmount ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">11</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Blood Transfusion Services</td>
                              <td className="py-2 px-3 text-center text-slate-500">{showDetailedReport.treatmentReport.billingBloodPints || 0} Pints</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingBloodAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingInfusionAmount ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">12</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Intravenous Infusion / Drips administration</td>
                              <td className="py-2 px-3 text-center text-slate-500">{showDetailedReport.treatmentReport.billingInfusionPints || 0} Pints</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingInfusionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingPhysiotherapy ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">13</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Physiotherapy & Rehabilitation Sessions</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingPhysiotherapy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingNeonatal ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">14</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Specialized Neonatal Care / Incubator</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingNeonatal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingMiscellaneous ? (
                            <tr className="border-b border-slate-200">
                              <td className="py-2 px-3 text-center font-bold text-slate-500">15</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">Miscellaneous Charges / Other Disposables</td>
                              <td className="py-2 px-3 text-center text-slate-500">-</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">₦{showDetailedReport.treatmentReport.billingMiscellaneous.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {/* Total Row */}
                          <tr className="border-t-2 border-slate-500 bg-slate-50">
                            <td colSpan={3} className="py-2 px-3 text-right font-extrabold text-slate-700 text-xs">CERTIFIED TOTAL:</td>
                            <td className="py-2 px-3 text-right font-mono font-extrabold text-sm text-emerald-600">
                              ₦{(showDetailedReport.treatmentReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PATIENT SIGNATURE CONFIRMATION SUMMARY */}
                  <div className="border border-slate-300 rounded p-5 bg-white">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase -mx-5 -mt-5 mb-5 px-5 py-2.5 bg-slate-100 border-b border-slate-300 rounded-t">CONFIRMED BY (RETIREE / PENSIONER / DEPENDANT)</h4>

                    <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 border border-slate-200 rounded p-4">
                      <div className="flex-1 min-w-0 w-full">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">RETIREE / PENSIONER NAME</span>
                        <p className="font-extrabold text-sm text-slate-900 m-0 mt-1">{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</p>
                      </div>

                      <div className="flex-1 w-full">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">PATIENT'S DIGITAL SIGNATURE</span>
                        <div className="h-12 border border-slate-300 bg-slate-50 flex items-center justify-center rounded">
                          <span className="font-serif italic text-slate-900 text-2xl tracking-wide">{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-[120px]">
                        <span className="block text-[0.65rem] font-bold text-slate-500 uppercase">CONFIRMATION DATE</span>
                        <p className="text-slate-900 font-medium m-0 mt-1.5">
                          {showDetailedReport.treatmentReport.patientSignDate
                            ? new Date(showDetailedReport.treatmentReport.patientSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {showDetailedReport.treatmentReport.reportFile && (
                    <div className="mt-3">
                      <span className="block text-[0.65rem] font-bold text-slate-500 uppercase mb-1">ATTACHED CLINICAL DISCHARGE RECORD SUMMARY</span>
                      <div className="p-3 bg-primary-lightest border border-border-color rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-success shrink-0" />
                          <span className="font-bold text-xs text-text-primary">{showDetailedReport.treatmentReport.reportFile.name}</span>
                          <span className="text-[0.7rem] text-text-muted">({showDetailedReport.treatmentReport.reportFile.size})</span>
                        </div>
                        <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded text-success bg-success-bg border border-success/10 whitespace-nowrap">Verified Scanned PDF</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-border-color bg-bg-primary rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowDetailedReport(null)}
                className="w-full sm:w-auto px-4 py-2 font-bold text-sm bg-primary hover:bg-primary-hover text-white rounded-lg cursor-pointer transition-all shadow-sm text-center"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
