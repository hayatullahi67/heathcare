import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useReferral } from '../../context/ReferralContext';
import { Badge } from '../../components/common/Badge';
import type { ReferralRequest } from '../../types';
import {
  FileText,
  X,
  FileCheck,
  Building,
  User,
  Download,
  AlertCircle,
  Search
} from 'lucide-react';

export const MedicalHistory: React.FC = () => {
  const { getReferralsForUser } = useReferral();
  const referrals = getReferralsForUser();

  const [selectedCase, setSelectedCase] = useState<ReferralRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailedReport, setShowDetailedReport] = useState<ReferralRequest | null>(null);


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

  // Filter referrals dynamically
  const filteredReferrals = referrals.filter(ref => 
    ref.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resolveProcedureType(ref.diagnosisDescription).toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status mapping for vertical progress timeline display inside modal
  const getTimelineProgress = (status: string) => {
    return [
      { step: '1', title: 'Authorization Request', desc: 'Case submitted securely by beneficiary', done: true, current: false },
      { step: '2', title: 'Administrative Review', desc: status === 'PENDING_ADMIN' ? 'Awaiting Super Admin review' : status === 'INFO_REQUESTED' ? 'Clarification requested by admin' : 'Approved by administrator', done: status !== 'PENDING_ADMIN' && status !== 'INFO_REQUESTED', current: status === 'PENDING_ADMIN' || status === 'INFO_REQUESTED' },
      { step: '3', title: 'Clinic Intake Preparation', desc: status === 'APPROVED_FORWARDED' ? 'Reviewing facility queues' : status === 'ACCEPTED' || status === 'TREATMENT_COMPLETED' ? 'Case file accepted by facility' : 'Awaiting admin review', done: status === 'ACCEPTED' || status === 'TREATMENT_COMPLETED', current: status === 'APPROVED_FORWARDED' },
      { step: '4', title: 'Treatment Discharge', desc: status === 'TREATMENT_COMPLETED' ? 'Discharge summary signed & complete' : status === 'ACCEPTED' ? 'Inpatient treatment in-progress' : 'Awaiting clinical stage', done: status === 'TREATMENT_COMPLETED', current: status === 'ACCEPTED' }
    ];
  };

  return (
    <div className="medical-history-wrapper flex flex-col gap-6 w-full fade-in">
      {/* Header Info */}
      <div className="header-section">
        <h1 className="form-heading font-semibold text-xl" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Authorization & Treatment Archive
        </h1>
        <p className="text-muted text-sm" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Access your digital history of medical authorizations, administrative approval details, and clinical treatment reports in a unified table log.
        </p>
      </div>

      {/* Live Search & Filter Bar */}
      <div className="filter-search-bar flex justify-between align-center" style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by Reference ID, Hospital or Diagnosis..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.85rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition)'
            }}
            className="search-input-field"
          />
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }} className="flex-shrink-0">
          Showing {filteredReferrals.length} of {referrals.length} cases
        </span>
      </div>

      {/* Main Table Card */}
      {referrals.length === 0 ? (
        <div className="card text-center p-8">
          <AlertCircle size={40} className="text-muted" style={{ margin: '0 auto 0.5rem auto' }} />
          <h4 className="font-semibold">No medical history records</h4>
          <p className="text-muted text-sm">You have not submitted any medical requests yet.</p>
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="card text-center p-8">
          <AlertCircle size={40} className="text-muted" style={{ margin: '0 auto 0.5rem auto' }} />
          <h4 className="font-semibold">No matching records found</h4>
          <p className="text-muted text-sm">Try adjusting your search criteria or keywords.</p>
        </div>
      ) : (
        <div className="card table-container" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REFERENCE</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLINIC PARTNER</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DATE SUBMITTED</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROCEDURAL INDICATION</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map(ref => (
                <tr 
                  key={ref.id} 
                  onClick={() => setSelectedCase(ref)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }}
                  className="archive-table-row"
                >
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem', fontWeight: 700 }} className="font-mono text-primary-color">{ref.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ref.hospitalName}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{formatDateString(ref.createdAt)}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{resolveProcedureType(ref.diagnosisDescription)}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem' }}>
                    <Badge status={ref.status} />
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.825rem', textAlign: 'right' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(ref);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px' }}
                    >
                      View File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Premium Case Details File Modal */}
      {selectedCase && createPortal(
        <div className="history-modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="history-modal-container fade-in" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="history-modal-header">
              <div className="header-title-wrapper">
                <div className="modal-icon-badge">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="header-main-title">Case File Audit</h3>
                  <span className="header-case-id font-mono">{selectedCase.id}</span>
                </div>
              </div>
              <button className="modal-close-trigger" onClick={() => setSelectedCase(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="history-modal-body">
              
              {/* Beneficiary & Provider Split */}
              <div className="patient-brief-grid">
                <div className="brief-column">
                  <span className="brief-label">Beneficiary Profile</span>
                  <span className="brief-value">
                    <User size={14} className="value-inline-icon" />
                    {selectedCase.patientName || selectedCase.staffName}
                  </span>
                  <span className="brief-subtext">Pension ID: {selectedCase.pensionId || 'N/A'}</span>
                </div>
                <div className="brief-column align-right">
                  <span className="brief-label">Assigned Facility</span>
                  <span className="brief-value">
                    <Building size={14} className="value-inline-icon" />
                    {selectedCase.hospitalName}
                  </span>
                  <span className="brief-subtext">Requested: {formatDateString(selectedCase.createdAt)}</span>
                </div>
              </div>

              {/* Status and Urgency Badge summary */}
              <div className="brief-summary-row">
                <div className="summary-item">
                  <span className="brief-label">Classification</span>
                  <span className="urgency-text-value">{selectedCase.urgencyLevel} Priority</span>
                </div>
                <div className="summary-item align-right">
                  <span className="brief-label">Current Stage</span>
                  <Badge status={selectedCase.status} />
                </div>
              </div>

              {/* Interactive Case Timeline */}
              <div className="timeline-container-box">
                <h4 className="timeline-box-title">Verification Timeline</h4>
                <div className="timeline-list">
                  {getTimelineProgress(selectedCase.status).map((prog, idx) => (
                    <div key={idx} className="timeline-item">
                      {/* Vertical line connection */}
                      {idx < 3 && (
                        <div className={`timeline-line ${prog.done ? 'active' : ''}`} />
                      )}
                      
                      {/* Timeline dot circle */}
                      <div className={`timeline-dot ${prog.done ? 'done' : ''} ${prog.current ? 'current' : ''}`}>
                        {prog.done ? '✓' : prog.step}
                      </div>

                      <div className="timeline-text-content">
                        <span className={`timeline-step-title ${prog.done || prog.current ? 'active-text' : 'muted-text'}`}>
                          {prog.title}
                        </span>
                        <span className="timeline-step-desc">{prog.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Narrative Reason */}
              <div className="medical-info-block">
                <h4 className="brief-label">Clinical Indication</h4>
                <p className="narrative-text-box">
                  {selectedCase.diagnosisDescription}
                </p>
              </div>

              {/* Attached Scan Documents */}
              <div className="medical-info-block">
                <h4 className="brief-label">Scans & Diagnostic Certifications</h4>
                {selectedCase.attachments.length === 0 ? (
                  <p className="empty-attachments-text">No certifications attached to this case file.</p>
                ) : (
                  <div className="attachments-list-wrapper">
                    {selectedCase.attachments.map((file, idx) => (
                      <div key={idx} className="attachment-file-row">
                        <div className="attachment-meta">
                          <FileText size={14} className="attachment-icon" />
                          <span className="attachment-name">{file.name}</span>
                          <span className="attachment-size">({file.size})</span>
                        </div>
                        <button className="download-btn-pill" title="Download Document">
                          <Download size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrative Feedback Review Notes */}
              {selectedCase.adminNotes && (
                <div className="medical-info-block">
                  <h4 className="brief-label">Administrative Notes</h4>
                  <p className="admin-notes-content-box">
                    "{selectedCase.adminNotes}"
                  </p>
                </div>
              )}

              {/* Clinical Treatment Discharge Summary */}
              {selectedCase.status === 'TREATMENT_COMPLETED' && selectedCase.treatmentReport && (
                <div className="discharge-summary-card">
                  <div className="discharge-card-header">
                    <FileCheck size={18} />
                    <h4 className="discharge-title">Clinical Discharge Summary</h4>
                  </div>
                  
                  <div className="discharge-body-grid">
                    <div className="discharge-row">
                      <span className="discharge-label">Confirmed Diagnosis</span>
                      <span className="discharge-value">{selectedCase.treatmentReport.diagnosisConfirmed}</span>
                    </div>
                    <div className="discharge-row">
                      <span className="discharge-label">Procedures Administered</span>
                      <span className="discharge-value text-wrap-value">
                        {selectedCase.treatmentReport.treatmentProvided.split(' | ')[0]}
                      </span>
                    </div>
                    <div className="discharge-row">
                      <span className="discharge-label">Discharging Physician</span>
                      <span className="discharge-value font-semibold">{selectedCase.treatmentReport.physicianName}</span>
                    </div>
                    <div className="discharge-row">
                      <span className="discharge-label">Completed Date</span>
                      <span className="discharge-value">{formatDateString(selectedCase.treatmentReport.completedAt)}</span>
                    </div>
                    {selectedCase.treatmentReport.invoiceNo && (
                      <div className="discharge-row" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setShowDetailedReport(selectedCase);
                            setSelectedCase(null);
                          }}
                          className="btn btn-primary btn-sm w-full flex align-center justify-center gap-1"
                          style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                          <FileText size={14} />
                          <span>View Official Discharge Form & Bill</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedCase.treatmentReport.reportFile && (
                    <div className="discharge-report-file">
                      <div className="file-meta">
                        <FileCheck size={14} />
                        <span className="file-name">{selectedCase.treatmentReport.reportFile.name}</span>
                        <span className="file-size">({selectedCase.treatmentReport.reportFile.size})</span>
                      </div>
                      <button className="download-btn-discharge">
                        <Download size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="history-modal-footer">
              <button onClick={() => setSelectedCase(null)} className="btn btn-secondary">
                Close Case File
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW COMPLETED DISCHARGE CASE SUMMARY MODAL (Section C & D Paper Sheet Style) */}
      {showDetailedReport && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowDetailedReport(null)}>
          <div className="modal-content paper-document-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header border-b-0 pb-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem 0 1.5rem', borderBottom: 'none' }}>
              <div className="paper-form-badge completed" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discharged & Certified Case File</div>
              <button className="close-btn" onClick={() => {
                setSelectedCase(showDetailedReport);
                setShowDetailedReport(null);
              }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body paper-document-body" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', padding: '2.5rem', backgroundColor: '#ffffff', color: '#1e293b' }}>
              
              {/* Paper Form Title */}
              <div className="paper-form-title-section" style={{ textAlign: 'center', borderBottom: '2px double #475569', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '0.05em' }}>CENTRAL BANK OF NIGERIA</h2>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.35rem 0 0 0', color: '#334155', letterSpacing: '0.025em' }}>MEDICAL SERVICES DIVISION REFERRAL DISCHARGE FORM</h3>
                <p style={{ fontSize: '0.725rem', fontWeight: 600, margin: '0.5rem 0 0 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Closed Case • Official Clinical Billing Certificate</p>
              </div>

              {showDetailedReport.treatmentReport && (
                <>
                  {/* SECTION C SUMMARY */}
                  <div className="paper-section" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
                    <h4 className="paper-section-header" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '-1.25rem -1.25rem 1.25rem -1.25rem', padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>(C) COMPLETED BY THE HOSPITAL/CLINIC</h4>
                    
                    <div className="paper-input-grid display-only" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div className="form-group-full" style={{ gridColumn: 'span 2', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>HOSPITAL/CLINIC NAME</span>
                        <p className="paper-display-value font-bold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{showDetailedReport.treatmentReport.hospitalClinicName || showDetailedReport.hospitalName}</p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>CARE SETTING TYPE</span>
                        <p className="paper-display-value font-semibold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{showDetailedReport.treatmentReport.careType === 'OPD' ? 'OPD (OUT-PATIENT)' : 'IN-PATIENT'}</p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>HOSPITAL BILL INVOICE NO.</span>
                        <p className="paper-display-value font-mono font-bold text-success" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>{showDetailedReport.treatmentReport.invoiceNo || 'N/A'}</p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TIME REPORTED AT HOSPITAL</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{showDetailedReport.treatmentReport.timeReported || 'N/A'}</p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>DATE OF ADMISSION</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>
                          {showDetailedReport.treatmentReport.dateOfAdmission 
                            ? new Date(showDetailedReport.treatmentReport.dateOfAdmission).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>ATTENDING DOCTOR</span>
                        <p className="paper-display-value font-semibold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</p>
                      </div>

                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TEL (OFFICE)</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{showDetailedReport.treatmentReport.telOffice || 'N/A'}</p>
                      </div>

                      <div className="form-group-full" style={{ gridColumn: 'span 2', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TEL (RESIDENT/MOBILE)</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{showDetailedReport.treatmentReport.telResident || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* CLINICAL REPORTS SUMMARY */}
                  <div className="paper-section" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1.25rem', backgroundColor: '#ffffff', marginTop: '1rem' }}>
                    <h4 className="paper-section-header" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '-1.25rem -1.25rem 1.25rem -1.25rem', padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>CLINICAL REPORTS</h4>
                    
                    <div className="clinical-reports-split-table display-only" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', border: '1px solid #94a3b8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="clinical-column left-col" style={{ padding: '1rem', borderRight: '1px solid #94a3b8', backgroundColor: '#ffffff' }}>
                        <div className="form-group-full">
                          <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>DIAGNOSIS (CONFIRMED CLINICAL FINDINGS)</span>
                          <div className="paper-textarea-display" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem', fontSize: '0.825rem', lineHeight: 1.4, minHeight: '100px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                            {showDetailedReport.treatmentReport.diagnosisConfirmed}
                          </div>
                        </div>
                        <div className="form-group-full" style={{ marginTop: '0.75rem' }}>
                          <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>MEDICATIONS PRESCRIBED & THERAPIES</span>
                          <div className="paper-textarea-display" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem', fontSize: '0.825rem', lineHeight: 1.4, minHeight: '100px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                            {showDetailedReport.treatmentReport.clinicalMedications || 'No medications recorded.'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="clinical-column right-col" style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
                        <div className="form-group-full">
                          <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>INVESTIGATION (PATHOLOGY, RADIOLOGY, ETC.)</span>
                          <div className="paper-textarea-display" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem', fontSize: '0.825rem', lineHeight: 1.4, minHeight: '235px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                            {showDetailedReport.treatmentReport.clinicalInvestigation || 'No investigations recorded.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {showDetailedReport.treatmentReport.treatmentProvided && !showDetailedReport.treatmentReport.treatmentProvided.startsWith('Investigations:') && (
                      <div className="form-group-full" style={{ marginTop: '0.75rem' }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>CLINICAL OVERVIEW & SUMMARY</span>
                        <div className="paper-textarea-display" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem', fontSize: '0.825rem', lineHeight: 1.4, minHeight: '50px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                          {showDetailedReport.treatmentReport.treatmentProvided.split(' | ')[0]}
                        </div>
                      </div>
                    )}

                    {/* Doctor verification details */}
                    <div className="signature-flex-container p-3 bg-paper-light" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>ATTENDING PHYSICIAN</span>
                        <p className="paper-display-value font-bold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</p>
                      </div>
                      
                      <div className="signature-box" style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>DOCTOR'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked" style={{ height: '48px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                          <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '2.2rem', color: '#1e3a8a', lineHeight: 1 }}>{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</span>
                        </div>
                      </div>

                      <div style={{ flex: 1.5 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>DATE SIGNED</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>
                          {showDetailedReport.treatmentReport.doctorSignDate 
                            ? new Date(showDetailedReport.treatmentReport.doctorSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION D BILLING SUMMARY */}
                  <div className="paper-section" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1.25rem', backgroundColor: '#ffffff', marginTop: '1.5rem' }}>
                    <h4 className="paper-section-header" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '-1.25rem -1.25rem 1.25rem -1.25rem', padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>(D) MEDICAL BILL / INVOICE SUMMARY</h4>
                    
                    <div className="billing-table-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <table className="paper-billing-table display-only" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th style={{ width: '80px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#334155', padding: '0.65rem 0.75rem', borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase' }}>S/NO</th>
                            <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#334155', padding: '0.65rem 0.75rem', borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase' }}>BILL ITEM / SERVICE DESCRIPTION</th>
                            <th style={{ width: '220px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#334155', padding: '0.65rem 0.75rem', borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase' }}>UNITS / MULTIPLIER</th>
                            <th style={{ width: '220px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: '#334155', padding: '0.65rem 0.75rem', borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase' }}>COST (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showDetailedReport.treatmentReport.billingRegistration ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>1</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Registration / Administration Fee</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingRegistration.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingConsultation ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>2</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Professional Consultation Fee</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingConsultation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingBeddingAmount ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>3</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Bedding / Ward Accommodation</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>{showDetailedReport.treatmentReport.billingBeddingDays || 0} Days</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingBeddingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingFeedingAmount ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>4</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Catering / Patient Feeding Services</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>{showDetailedReport.treatmentReport.billingFeedingDays || 0} Days</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingFeedingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingDrugs ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>5</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Prescribed Drugs, Injections & Medications</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingDrugs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingSurgical ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>6</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Surgical Operation / Delivery Procedures</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingSurgical.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingAnesthesia ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>7</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Anesthetic Administration / Medications</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingAnesthesia.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingTheater ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>8</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Operating Theater Facility Fees</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingTheater.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingLabs ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>9</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Clinical Laboratory Diagnostics / Pathology</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingLabs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingScans ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>10</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Imaging (E.C.G. / X-Rays / Ultrasound Scan)</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingScans.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingBloodAmount ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>11</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Blood Transfusion Services</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>{showDetailedReport.treatmentReport.billingBloodPints || 0} Pints</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingBloodAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingInfusionAmount ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>12</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Intravenous Infusion / Drips administration</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>{showDetailedReport.treatmentReport.billingInfusionPints || 0} Pints</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingInfusionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingPhysiotherapy ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>13</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Physiotherapy & Rehabilitation Sessions</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingPhysiotherapy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingNeonatal ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>14</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Specialized Neonatal Care / Incubator</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingNeonatal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {showDetailedReport.treatmentReport.billingMiscellaneous ? (
                            <tr>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center', fontWeight: 700 }}>15</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>Miscellaneous Charges / Other Disposables</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', textAlign: 'center' }}>-</td>
                              <td style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₦{showDetailedReport.treatmentReport.billingMiscellaneous.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {/* Total Row */}
                          <tr style={{ borderTop: '2px solid #94a3b8' }}>
                            <td colSpan={3} style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem', color: '#334155' }}>CERTIFIED TOTAL:</td>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                              ₦{(showDetailedReport.treatmentReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PATIENT SIGNATURE CONFIRMATION SUMMARY */}
                  <div className="paper-section" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1.25rem', backgroundColor: '#ffffff', marginTop: '1.5rem' }}>
                    <h4 className="paper-section-header" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '-1.25rem -1.25rem 1.25rem -1.25rem', padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>CONFIRMED BY (RETIREE / PENSIONER / DEPENDANT)</h4>
                    
                    <div className="signature-flex-container p-3 bg-paper-light" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>RETIREE / PENSIONER NAME</span>
                        <p className="paper-display-value font-bold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</p>
                      </div>
                      
                      <div className="signature-box" style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PATIENT'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked patient-sig" style={{ height: '48px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                          <span style={{ fontFamily: "'Reenie Beanie', cursive", fontSize: '1.8rem', color: '#0f172a', lineHeight: 1 }}>{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</span>
                        </div>
                      </div>

                      <div style={{ flex: 1.5 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>CONFIRMATION DATE</span>
                        <p className="paper-display-value" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a' }}>
                          {showDetailedReport.treatmentReport.patientSignDate 
                            ? new Date(showDetailedReport.treatmentReport.patientSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {showDetailedReport.treatmentReport.reportFile && (
                    <div style={{ marginTop: '1rem' }}>
                      <span className="paper-label block-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>ATTACHED CLINICAL DISCHARGE RECORD SUMMARY</span>
                      <div className="file-preview-pill flex align-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--primary-lightest)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={18} className="text-success" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{showDetailedReport.treatmentReport.reportFile.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({showDetailedReport.treatmentReport.reportFile.size})</span>
                        </div>
                        <span className="badge badge-completed">Verified Scanned PDF</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer bg-lightest" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(showDetailedReport);
                  setShowDetailedReport(null);
                }}
                className="btn btn-secondary w-full"
                style={{ width: '100%' }}
              >
                Return to Case File
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .archive-table-row:hover td {
          background-color: var(--primary-lightest) !important;
        }
        .search-input-field:focus {
          border-color: #005f73 !important;
          box-shadow: 0 0 0 3px rgba(0, 95, 115, 0.15) !important;
        }

        /* Premium History Modal Overrides */
        .history-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .history-modal-container {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }

        .history-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: var(--primary-lightest);
          color: #005f73;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-main-title {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }

        .header-case-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .modal-close-trigger {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          padding: 0.25rem;
          border-radius: 6px;
        }

        .modal-close-trigger:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .history-modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          overflow-y: auto;
        }

        /* Briefing split styling */
        .patient-brief-grid {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .brief-column {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .brief-column.align-right {
          align-items: flex-end;
          text-align: right;
        }

        .brief-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .brief-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .value-inline-icon {
          color: var(--text-muted);
        }

        .brief-subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .brief-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.85rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .summary-item.align-right {
          align-items: flex-end;
        }

        .urgency-text-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Vertical Timeline Inside Modal */
        .timeline-container-box {
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1.25rem;
        }

        .timeline-box-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          gap: 0.85rem;
          position: relative;
          align-items: flex-start;
        }

        .timeline-line {
          position: absolute;
          left: 9px;
          top: 22px;
          bottom: -14px;
          width: 2px;
          background-color: var(--border-color);
          z-index: 1;
        }

        .timeline-line.active {
          background-color: #005f73;
        }

        .timeline-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--bg-primary);
          border: 2px solid var(--border-color);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          z-index: 2;
        }

        .timeline-dot.done {
          background-color: #005f73;
          border-color: #005f73;
          color: white;
        }

        .timeline-dot.current {
          border-color: #005f73;
          background-color: white;
          color: #005f73;
          box-shadow: 0 0 0 3px rgba(0, 95, 115, 0.15);
        }

        .timeline-text-content {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
        }

        .timeline-step-title {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .timeline-step-title.active-text {
          color: var(--text-primary);
        }

        .timeline-step-title.muted-text {
          color: var(--text-muted);
        }

        .timeline-step-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Info blocks inside modal */
        .medical-info-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .narrative-text-box {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
          background-color: var(--bg-primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          margin: 0;
        }

        .empty-attachments-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .attachments-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .attachment-file-row {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background-color: var(--bg-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .attachment-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .attachment-icon {
          color: var(--primary);
        }

        .attachment-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .attachment-size {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .download-btn-pill {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .download-btn-pill:hover {
          background-color: var(--border-color);
          color: var(--text-primary);
        }

        .admin-notes-content-box {
          font-size: 0.85rem;
          color: #0369a1;
          line-height: 1.45;
          background-color: #f0f9ff;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #bae6fd;
          margin: 0;
          font-style: italic;
        }

        /* Clinical Report Card styling */
        .discharge-summary-card {
          border: 1px solid #10b981;
          border-radius: 10px;
          padding: 1.25rem;
          background-color: #ecfdf5;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .discharge-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          padding-bottom: 0.5rem;
          color: #047857;
        }

        .discharge-title {
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0;
        }

        .discharge-body-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .discharge-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          align-items: center;
        }

        .discharge-label {
          fontWeight: 600;
          color: #065f46;
        }

        .discharge-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        .discharge-value.text-wrap-value {
          max-width: 320px;
          text-align: right;
        }

        .discharge-report-file {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
          background-color: #f0fdf4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #047857;
        }

        .file-name {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .file-size {
          font-size: 0.725rem;
        }

        .download-btn-discharge {
          background-color: white;
          border: 1px solid rgba(16, 185, 129, 0.25);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #047857;
          transition: var(--transition);
        }

        .download-btn-discharge:hover {
          background-color: #ecfdf5;
        }

        .history-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};
