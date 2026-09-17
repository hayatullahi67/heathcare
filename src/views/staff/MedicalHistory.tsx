import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useReferral } from '../../context/ReferralContext';
import { Badge } from '../../components/common/Badge';
import { type ReferralRequest, type MockFile, getReferralIdInfo } from '../../types';
import {
  FileText,
  X,
  FileCheck,
  Building,
  User,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Search,
  Edit3,
  Send,
  Upload,
  Trash2,
  CheckCircle2,
  PenTool,
  Receipt,
  ArrowLeft
} from 'lucide-react';

const SignaturePadModal: React.FC<{
  title: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}> = ({ title, onSave, onClose }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content fade-in"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '90%', borderRadius: '16px', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Draw your signature inside the box using your mouse, stylus, or fingertip:
          </span>

          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', backgroundColor: '#0b0f19', padding: '0.5rem', textAlign: 'center' }}>
            <canvas
              ref={canvasRef}
              width={420}
              height={160}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ width: '100%', height: '160px', backgroundColor: '#0b0f19', borderRadius: '4px', cursor: 'crosshair', touchAction: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Clear Canvas
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!hasDrawn}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderColor: '#0284c7', color: '#ffffff', fontWeight: 700 }}
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const MedicalHistory: React.FC = () => {
  const { getReferralsForUser, resubmitReferral, approveMedicalBill, rejectMedicalBill } = useReferral();
  const referrals = getReferralsForUser();

  const [selectedCase, setSelectedCase] = useState<ReferralRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailedReport, setShowDetailedReport] = useState<ReferralRequest | null>(null);

  // Bill Review & Dispute States
  const [billReviewRef, setBillReviewRef] = useState<ReferralRequest | null>(null);
  const [isRejectingBill, setIsRejectingBill] = useState(false);
  const [billRejectReason, setBillRejectReason] = useState('');
  const [billActionLoading, setBillActionLoading] = useState(false);
  const [billActionError, setBillActionError] = useState<string | null>(null);
  const [billActionSuccess, setBillActionSuccess] = useState<string | null>(null);
  const [patientSignatureImage, setPatientSignatureImage] = useState<string>('');
  const [showPatientSignModal, setShowPatientSignModal] = useState(false);
  const [patientConfirmName, setPatientConfirmName] = useState('');

  // Resubmit Referral Form States
  const [resubmitTarget, setResubmitTarget] = useState<ReferralRequest | null>(null);
  const [resubmitDiagnosis, setResubmitDiagnosis] = useState('');
  const [resubmitPhone, setResubmitPhone] = useState('');
  const [resubmitAddress, setResubmitAddress] = useState('');
  const [resubmitStatusAtExit, setResubmitStatusAtExit] = useState('');
  const [resubmitDepartment, setResubmitDepartment] = useState('');
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [resubmitAttachments, setResubmitAttachments] = useState<MockFile[]>([]);
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  const openBillReview = (ref: ReferralRequest) => {
    setBillReviewRef(ref);
    setIsRejectingBill(false);
    setBillRejectReason('');
    setBillActionError(null);
    setBillActionSuccess(null);
    setPatientSignatureImage(ref.treatmentReport?.patientSignatureImage || '');
    setPatientConfirmName(ref.treatmentReport?.confirmedByPatientName || ref.patientName || ref.staffName || '');
    setSelectedCase(null);
  };

  const handleApproveBill = async () => {
    if (!billReviewRef) return;
    setBillActionLoading(true);
    setBillActionError(null);

    const res = await approveMedicalBill(billReviewRef.id, {
      patientSignatureImage: patientSignatureImage || undefined,
      confirmedName: patientConfirmName || undefined
    });

    setBillActionLoading(false);
    if (res.success) {
      setBillActionSuccess('Medical bill approved successfully! Case has been marked completed.');
      setTimeout(() => {
        setBillReviewRef(null);
        setBillActionSuccess(null);
      }, 1800);
    } else {
      setBillActionError(res.message);
    }
  };

  const handleRejectBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billReviewRef) return;
    if (!billRejectReason.trim()) {
      setBillActionError('Please state the reason for disputing this medical bill.');
      return;
    }

    setBillActionLoading(true);
    setBillActionError(null);

    const res = await rejectMedicalBill(billReviewRef.id, billRejectReason.trim());

    setBillActionLoading(false);
    if (res.success) {
      setBillActionSuccess('Bill dispute submitted to hospital for revision.');
      setTimeout(() => {
        setBillReviewRef(null);
        setBillActionSuccess(null);
      }, 1800);
    } else {
      setBillActionError(res.message);
    }
  };

  const openResubmitModal = (ref: ReferralRequest) => {
    setResubmitTarget(ref);
    setResubmitDiagnosis(ref.diagnosisDescription || '');
    setResubmitPhone(ref.telephoneNumber || '');
    setResubmitAddress(ref.residentialAddress || '');
    setResubmitStatusAtExit(ref.statusAtExit || '');
    setResubmitDepartment(ref.departmentAtExit || '');
    setResubmitAttachments(ref.attachments ? [...ref.attachments] : []);
    setResubmitNotes('');
    setResubmitError(null);
    setResubmitSuccess(false);
    setSelectedCase(null);
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const newFile: MockFile = {
      name: file.name,
      size: `${sizeMB} MB`,
      type: file.type || 'application/pdf'
    };
    setResubmitAttachments(prev => [...prev, newFile]);
    e.target.value = '';
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setResubmitAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitTarget) return;
    if (!resubmitNotes.trim()) {
      setResubmitError('Please provide a short explanation note describing the changes or answers for the Admin.');
      return;
    }

    setResubmitLoading(true);
    setResubmitError(null);

    const res = await resubmitReferral(resubmitTarget.id, {
      diagnosisDescription: resubmitDiagnosis,
      telephoneNumber: resubmitPhone,
      residentialAddress: resubmitAddress,
      departmentAtExit: resubmitDepartment,
      statusAtExit: resubmitStatusAtExit,
      attachments: resubmitAttachments,
      staffResponseNotes: resubmitNotes.trim()
    });

    setResubmitLoading(false);
    if (res.success) {
      setResubmitSuccess(true);
      setTimeout(() => {
        setResubmitTarget(null);
        setResubmitSuccess(false);
      }, 2000);
    } else {
      setResubmitError(res.message);
    }
  };


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
    ref.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ref.staffIdNumber && ref.staffIdNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ref.pensionId && ref.pensionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ref.patientId && ref.patientId.toLowerCase().includes(searchQuery.toLowerCase()))
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
      {billReviewRef && billReviewRef.treatmentReport ? (
        /* BENEFICIARY MEDICAL BILL REVIEW IN-PAGE VIEW (DARK THEME) */
        <div className="beneficiary-bill-review-page fade-in flex flex-col gap-6 w-full" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '3rem' }}>
          
          {/* Top Bar Navigation & Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => !billActionLoading && setBillReviewRef(null)}
              disabled={billActionLoading}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to History</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                <Receipt size={14} />
                <span>Awaiting Beneficiary Endorsement</span>
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                Case #{billReviewRef.id}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Beneficiary Medical Bill Review &amp; Endorsement
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Accredited Facility: <strong style={{ color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.hospitalClinicName || billReviewRef.hospitalName}</strong> • Patient: <strong style={{ color: 'var(--text-primary)' }}>{billReviewRef.patientName || billReviewRef.staffName}</strong>
            </p>
          </div>

          {/* Alert Messages */}
          {billActionSuccess && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>{billActionSuccess}</span>
            </div>
          )}

          {billActionError && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span>{billActionError}</span>
            </div>
          )}

          {billReviewRef.treatmentReport.billStatus === 'REJECTED' && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: '0.875rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>⚠️ Previous Bill Dispute Details:</strong>
              <p style={{ margin: 0, color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.billRejectionReason}</p>
            </div>
          )}

          {/* CARD 1: CLINICAL OVERVIEW */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>Hospital / Clinic</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.hospitalClinicName || billReviewRef.hospitalName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>Care Classification</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.careType === 'OPD' ? 'OPD (Out-Patient)' : 'In-Patient Care'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>Invoice / Bill Number</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8', fontFamily: 'monospace' }}>{billReviewRef.treatmentReport.invoiceNo || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>Attending Physician</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.attendingDoctor || billReviewRef.treatmentReport.physicianName || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>Confirmed Clinical Findings / Diagnosis</span>
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                {billReviewRef.treatmentReport.diagnosisConfirmed || 'Diagnosis confirmed upon admission.'}
              </div>
            </div>
          </div>

          {/* CARD 2: SECTION D ITEMIZED BILLING BREAKDOWN */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Receipt size={16} />
                Section D: Itemized Medical Bill Breakdown
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                All amounts certified in Nigerian Naira (₦)
              </span>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '60px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>S/N</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Item / Service Description</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '220px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Multiplier / Units</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '200px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { sn: 1, label: 'Registration / Administration Fee', multiplier: '-', amount: billReviewRef.treatmentReport.billingRegistration },
                      { sn: 2, label: 'Professional Consultation Fee', multiplier: '-', amount: billReviewRef.treatmentReport.billingConsultation },
                      { sn: 3, label: 'Bedding / Ward Accommodation', multiplier: billReviewRef.treatmentReport.billingBeddingDays ? `${billReviewRef.treatmentReport.billingBeddingDays} Days ${billReviewRef.treatmentReport.billingBeddingRate ? `@ ₦${billReviewRef.treatmentReport.billingBeddingRate.toLocaleString()}` : ''}` : 'Fixed Charge', amount: billReviewRef.treatmentReport.billingBeddingAmount },
                      { sn: 4, label: 'Catering / Patient Feeding Services', multiplier: billReviewRef.treatmentReport.billingFeedingDays ? `${billReviewRef.treatmentReport.billingFeedingDays} Days ${billReviewRef.treatmentReport.billingFeedingRate ? `@ ₦${billReviewRef.treatmentReport.billingFeedingRate.toLocaleString()}` : ''}` : 'Fixed Charge', amount: billReviewRef.treatmentReport.billingFeedingAmount },
                      { sn: 5, label: 'Prescribed Drugs, Injections & Medications', multiplier: '-', amount: billReviewRef.treatmentReport.billingDrugs },
                      { sn: 6, label: 'Surgical Operation / Delivery Procedures', multiplier: '-', amount: billReviewRef.treatmentReport.billingSurgical },
                      { sn: 7, label: 'Anesthetic Administration / Medications', multiplier: '-', amount: billReviewRef.treatmentReport.billingAnesthesia },
                      { sn: 8, label: 'Operating Theater Facility Fees', multiplier: '-', amount: billReviewRef.treatmentReport.billingTheater },
                      { sn: 9, label: 'Clinical Laboratory Diagnostics / Pathology', multiplier: '-', amount: billReviewRef.treatmentReport.billingLabs },
                      { sn: 10, label: 'Imaging (E.C.G. / X-Rays / Ultrasound Scans)', multiplier: '-', amount: billReviewRef.treatmentReport.billingScans },
                      { sn: 11, label: 'Blood Transfusion Services', multiplier: billReviewRef.treatmentReport.billingBloodPints ? `${billReviewRef.treatmentReport.billingBloodPints} Pints ${billReviewRef.treatmentReport.billingBloodRate ? `@ ₦${billReviewRef.treatmentReport.billingBloodRate.toLocaleString()}` : ''}` : 'Fixed Charge', amount: billReviewRef.treatmentReport.billingBloodAmount },
                      { sn: 12, label: 'Intravenous Infusion / Drips', multiplier: billReviewRef.treatmentReport.billingInfusionPints ? `${billReviewRef.treatmentReport.billingInfusionPints} Pints ${billReviewRef.treatmentReport.billingInfusionRate ? `@ ₦${billReviewRef.treatmentReport.billingInfusionRate.toLocaleString()}` : ''}` : 'Fixed Charge', amount: billReviewRef.treatmentReport.billingInfusionAmount },
                      { sn: 13, label: 'Physiotherapy & Rehabilitation Sessions', multiplier: '-', amount: billReviewRef.treatmentReport.billingPhysiotherapy },
                      { sn: 14, label: 'Specialized Neonatal Care / Incubator', multiplier: '-', amount: billReviewRef.treatmentReport.billingNeonatal },
                      { sn: 15, label: 'Miscellaneous Charges / Other Disposables', multiplier: '-', amount: billReviewRef.treatmentReport.billingMiscellaneous },
                    ]
                      .filter(item => Boolean(item.amount && item.amount > 0))
                      .map((item, idx) => (
                        <tr key={item.sn} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</td>
                          <td style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.multiplier}</td>
                          <td style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
                            ₦{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}

                    {/* Grand Total Row */}
                    <tr style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', borderTop: '2px solid var(--border-color)' }}>
                      <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                        TOTAL INVOICE PAYABLE:
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>
                        ₦{(billReviewRef.treatmentReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CARD 3: PROVIDER SIGNATURE VERIFICATIONS */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.04em' }}>
              Provider Verification Signatures
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Doctor */}
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attending Physician</span>
                <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '0.5rem' }}>
                  {billReviewRef.treatmentReport.doctorSignatureImage ? (
                    <img src={billReviewRef.treatmentReport.doctorSignatureImage} alt="Doctor Signature" style={{ maxHeight: '44px', maxWidth: '90%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '1.8rem', color: '#38bdf8' }}>{billReviewRef.treatmentReport.attendingDoctor || billReviewRef.treatmentReport.physicianName || 'Signed'}</span>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'block' }}>Signed: {billReviewRef.treatmentReport.doctorSignDate || 'N/A'}</span>
              </div>

              {/* Branch Controller */}
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Branch Controller</span>
                <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '0.5rem' }}>
                  {billReviewRef.treatmentReport.branchControllerSignatureImage ? (
                    <img src={billReviewRef.treatmentReport.branchControllerSignatureImage} alt="Branch Controller Signature" style={{ maxHeight: '44px', maxWidth: '90%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.branchControllerSignName || 'Endorsed'}</span>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'block' }}>{billReviewRef.treatmentReport.branchControllerSignName || 'Branch Controller'}</span>
              </div>

              {/* Branch Support */}
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Branch Support Officer</span>
                <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '0.5rem' }}>
                  {billReviewRef.treatmentReport.branchSupportSignatureImage ? (
                    <img src={billReviewRef.treatmentReport.branchSupportSignatureImage} alt="Branch Support Signature" style={{ maxHeight: '44px', maxWidth: '90%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{billReviewRef.treatmentReport.branchSupportSignName || 'Endorsed'}</span>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'block' }}>{billReviewRef.treatmentReport.branchSupportSignName || 'Branch Support Officer'}</span>
              </div>
            </div>
          </div>

          {/* CARD 4: BENEFICIARY ACCEPTANCE / DISPUTE INTERACTIVE PANEL */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1.5px solid rgba(56, 189, 248, 0.4)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <PenTool size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Beneficiary Acceptance &amp; Endorsement
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Review itemized charges and certify your endorsement or lodge a dispute
                </span>
              </div>
            </div>

            {isRejectingBill ? (
              /* DISPUTE / REJECTION FORM */
              <form onSubmit={handleRejectBill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '0.85rem', color: '#f87171', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffffff' }}>Dispute Explanation Required:</strong> Please describe the discrepancy (e.g. incorrect bed days, procedures not performed, or wrong billing). This explanation will be sent directly back to the hospital so they can correct and resubmit the invoice.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Reason for Disputing / Rejecting Medical Bill <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={billRejectReason}
                    onChange={e => setBillRejectReason(e.target.value)}
                    placeholder="e.g. I was only admitted for 2 days rather than 5 days, and did not undergo the surgical procedure listed..."
                    style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsRejectingBill(false)}
                    disabled={billActionLoading}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancel Dispute
                  </button>
                  <button
                    type="submit"
                    disabled={billActionLoading}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    {billActionLoading ? 'Submitting Dispute...' : 'Confirm & Send Dispute to Hospital'}
                  </button>
                </div>
              </form>
            ) : (
              /* APPROVAL FORM */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  I certify that the treatment, services, and medications listed above were duly administered to me (or my registered dependant) by the accredited hospital.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Name confirmation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Beneficiary Confirmation Name
                    </label>
                    <input
                      type="text"
                      value={patientConfirmName}
                      onChange={e => setPatientConfirmName(e.target.value)}
                      placeholder="Full beneficiary name"
                      style={{
                        padding: '0.7rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Digital signature */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Beneficiary Digital Signature
                      </label>
                      {patientSignatureImage && (
                        <button
                          type="button"
                          onClick={() => setPatientSignatureImage('')}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Clear Signature
                        </button>
                      )}
                    </div>

                    {patientSignatureImage ? (
                      <div style={{ height: '54px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem' }}>
                        <img src={patientSignatureImage} alt="Patient Signature" style={{ maxHeight: '46px', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPatientSignModal(true)}
                        style={{
                          height: '54px',
                          border: '2px dashed var(--border-color)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-primary)',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s, background-color 0.2s'
                        }}
                      >
                        <PenTool size={16} />
                        <span>Draw Signature on Screen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setIsRejectingBill(true)}
                    disabled={billActionLoading}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>Dispute / Reject Bill</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setBillReviewRef(null)}
                      disabled={billActionLoading}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
                    >
                      Back to Archive
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveBill}
                      disabled={billActionLoading}
                      className="btn btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderColor: '#10b981',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>{billActionLoading ? 'Processing Approval...' : 'Approve & Sign Medical Bill'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header Info */}
          <div className="header-section">
            <h1 className="form-heading font-semibold text-xl" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              Authorization &amp; Treatment Archive
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
        <>
          {/* Desktop Table View */}
          <div className="hidden-mobile card table-container" style={{ padding: '0', overflow: 'hidden' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                        {ref.status === 'BILL_SUBMITTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBillReview(ref);
                            }}
                            className="btn btn-primary btn-sm animate-pulse"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.725rem',
                              fontWeight: 800,
                              borderRadius: '6px',
                              backgroundColor: '#005f73',
                              borderColor: '#005f73',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Receipt size={13} />
                            <span>Review &amp; Approve Bill</span>
                          </button>
                        )}
                        {ref.status === 'BILL_REJECTED' && (
                          <span
                            className="badge badge-danger"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.55rem', cursor: 'help' }}
                            title={`Disputed: ${ref.treatmentReport?.billRejectionReason || 'Pending hospital revision'}`}
                          >
                            Disputed (Awaiting Revision)
                          </span>
                        )}
                        {ref.status === 'INFO_REQUESTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openResubmitModal(ref);
                            }}
                            className="btn btn-primary btn-sm"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              backgroundColor: '#d97706',
                              borderColor: '#d97706',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Edit3 size={12} />
                            <span>Respond</span>
                          </button>
                        )}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="visible-mobile flex flex-col gap-3">
            {filteredReferrals.map(ref => (
              <div 
                key={ref.id} 
                onClick={() => setSelectedCase(ref)}
                className="bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col gap-3 hover:bg-bg-primary/30 transition-colors cursor-pointer active:scale-[0.99] shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.7rem] text-primary-color font-bold">{ref.id}</span>
                    <span className="font-bold text-sm text-text-primary mt-0.5">{ref.hospitalName}</span>
                  </div>
                  <Badge status={ref.status} />
                </div>
                
                <div className="flex flex-col gap-1 border-t border-border-color pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Indication:</span>
                    <span className="text-text-secondary font-semibold">{resolveProcedureType(ref.diagnosisDescription)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Submitted:</span>
                    <span className="text-text-secondary font-semibold">{formatDateString(ref.createdAt)}</span>
                  </div>
                </div>

                {ref.status === 'BILL_SUBMITTED' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openBillReview(ref);
                    }}
                    className="w-full bg-[#005f73] hover:bg-[#005f73]/90 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm mt-1 animate-pulse"
                  >
                    <Receipt size={14} />
                    <span>Action Required: Review &amp; Approve Bill</span>
                  </button>
                )}

                {ref.status === 'INFO_REQUESTED' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openResubmitModal(ref);
                    }}
                    className="w-full bg-[#d97706] hover:bg-[#d97706]/90 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm mt-1"
                  >
                    <Edit3 size={14} />
                    <span>Action Required: Provide Information &amp; Resubmit</span>
                  </button>
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(ref);
                  }}
                  className="btn btn-secondary btn-sm w-full mt-1 font-bold py-2 text-xs"
                >
                  View Case File
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
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
                  <span className="brief-subtext">
                    {getReferralIdInfo(selectedCase).idLabel}: {getReferralIdInfo(selectedCase).idValue}
                  </span>
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

              {/* ADMIN CLARIFICATION / CHANGES REQUESTED CALLOUT */}
              {selectedCase.status === 'INFO_REQUESTED' && (
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                      <AlertCircle size={18} />
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Action Required: Admin Requested Clarification / Changes
                      </span>
                    </div>
                    <button
                      onClick={() => openResubmitModal(selectedCase)}
                      className="btn btn-primary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: '#d97706',
                        borderColor: '#d97706',
                        borderRadius: '6px'
                      }}
                    >
                      <Edit3 size={14} />
                      <span>Edit &amp; Resubmit Request</span>
                    </button>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5
                  }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Admin Instructions &amp; Information Needed:
                    </span>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: 600 }}>
                      "{selectedCase.moreInfoRequestedNotes || selectedCase.adminNotes || 'Please provide updated documentation or clarify your clinical request details.'}"
                    </p>
                  </div>
                </div>
              )}

              {/* Previously Resubmitted Banner */}
              {selectedCase.isResubmitted && selectedCase.staffResponseNotes && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb' }}>
                    <CheckCircle2 size={15} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      Resubmitted with Updates {selectedCase.resubmittedAt ? `• ${formatDateString(selectedCase.resubmittedAt)}` : ''}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Your Note to Admin:</strong> "{selectedCase.staffResponseNotes}"
                  </p>
                </div>
              )}

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
            <div className="history-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedCase.status === 'BILL_SUBMITTED' && (
                  <button
                    onClick={() => openBillReview(selectedCase)}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#005f73',
                      borderColor: '#005f73',
                      fontWeight: 700
                    }}
                  >
                    <Receipt size={15} />
                    <span>Review &amp; Approve Medical Bill</span>
                  </button>
                )}
                {selectedCase.status === 'INFO_REQUESTED' && (
                  <button
                    onClick={() => openResubmitModal(selectedCase)}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#d97706',
                      borderColor: '#d97706',
                      fontWeight: 700
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit &amp; Resubmit Request</span>
                  </button>
                )}
              </div>
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

            <div className="modal-body paper-document-body responsive-paper-body">
              
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
                    
                    <div className="paper-input-grid display-only responsive-paper-grid" style={{ gap: '0.75rem', fontSize: '0.8rem' }}>
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
                    
                    <div className="clinical-reports-split-table display-only responsive-clinical-split" style={{ overflow: 'hidden' }}>
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
                    <div className="signature-flex-container p-3 bg-paper-light responsive-signature-flex" style={{ marginTop: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>ATTENDING PHYSICIAN</span>
                        <p className="paper-display-value font-bold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</p>
                      </div>
                      
                      <div className="signature-box" style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>DOCTOR'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked" style={{ height: '48px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                          {showDetailedReport.treatmentReport.doctorSignatureImage ? (
                            <img
                              src={showDetailedReport.treatmentReport.doctorSignatureImage}
                              alt="Doctor Signature"
                              style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '2.2rem', color: '#1e3a8a', lineHeight: 1 }}>{showDetailedReport.treatmentReport.attendingDoctor || showDetailedReport.treatmentReport.physicianName}</span>
                          )}
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

                    {/* Branch Controller & Branch Support Endorsements */}
                    {(showDetailedReport.treatmentReport.branchControllerSignatureImage || showDetailedReport.treatmentReport.branchControllerSignName || showDetailedReport.treatmentReport.branchSupportSignatureImage || showDetailedReport.treatmentReport.branchSupportSignName) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {/* Branch Controller */}
                        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#005f73', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            BRANCH CONTROLLER ENDORSEMENT
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Name: </span>
                              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{showDetailedReport.treatmentReport.branchControllerSignName || 'Branch Controller'}</strong>
                            </div>
                            <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                              {showDetailedReport.treatmentReport.branchControllerSignatureImage ? (
                                <img
                                  src={showDetailedReport.treatmentReport.branchControllerSignatureImage}
                                  alt="Branch Controller Signature"
                                  style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '1.8rem', color: '#1e3a8a' }}>{showDetailedReport.treatmentReport.branchControllerSignName || 'Endorsed'}</span>
                              )}
                            </div>
                            {showDetailedReport.treatmentReport.branchControllerSignDate && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Endorsed: {new Date(showDetailedReport.treatmentReport.branchControllerSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Branch Support */}
                        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#005f73', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            BRANCH SUPPORT ENDORSEMENT
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Name: </span>
                              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{showDetailedReport.treatmentReport.branchSupportSignName || 'Branch Support Officer'}</strong>
                            </div>
                            <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                              {showDetailedReport.treatmentReport.branchSupportSignatureImage ? (
                                <img
                                  src={showDetailedReport.treatmentReport.branchSupportSignatureImage}
                                  alt="Branch Support Signature"
                                  style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '1.8rem', color: '#1e3a8a' }}>{showDetailedReport.treatmentReport.branchSupportSignName || 'Endorsed'}</span>
                              )}
                            </div>
                            {showDetailedReport.treatmentReport.branchSupportSignDate && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Endorsed: {new Date(showDetailedReport.treatmentReport.branchSupportSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION D BILLING SUMMARY */}
                  <div className="paper-section" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1.25rem', backgroundColor: '#ffffff', marginTop: '1.5rem' }}>
                    <h4 className="paper-section-header" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '-1.25rem -1.25rem 1.25rem -1.25rem', padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>(D) MEDICAL BILL / INVOICE SUMMARY</h4>
                    
                    <div className="billing-table-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflowX: 'auto' }}>
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
                    
                    <div className="signature-flex-container p-3 bg-paper-light responsive-signature-flex" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>RETIREE / PENSIONER NAME</span>
                        <p className="paper-display-value font-bold" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</p>
                      </div>
                      
                      <div className="signature-box" style={{ flex: 2 }}>
                        <span className="paper-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PATIENT'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked patient-sig" style={{ height: '48px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                          {showDetailedReport.treatmentReport.patientSignatureImage ? (
                            <img
                              src={showDetailedReport.treatmentReport.patientSignatureImage}
                              alt="Patient Digital Signature"
                              style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontFamily: "'Reenie Beanie', cursive", fontSize: '1.8rem', color: '#0f172a', lineHeight: 1 }}>{showDetailedReport.treatmentReport.confirmedByPatientName || showDetailedReport.patientName || showDetailedReport.staffName}</span>
                          )}
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



      {showPatientSignModal && (
        <SignaturePadModal
          title="Sign to Endorse Medical Bill"
          onSave={dataUrl => setPatientSignatureImage(dataUrl)}
          onClose={() => setShowPatientSignModal(false)}
        />
      )}

      {/* EDIT & RESUBMIT REFERRAL MODAL */}
      {resubmitTarget && createPortal(
        <div className="history-modal-overlay" style={{ zIndex: 1150 }} onClick={() => !resubmitLoading && setResubmitTarget(null)}>
          <div className="history-modal-container fade-in" style={{ maxWidth: '680px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="history-modal-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', flexShrink: 0 }}>
              <div className="header-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="modal-icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="header-main-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Provide Clarification &amp; Resubmit Request
                  </h3>
                  <span className="header-case-id font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    Reference: {resubmitTarget.id} • {resubmitTarget.hospitalName}
                  </span>
                </div>
              </div>
              <button
                className="modal-close-trigger"
                onClick={() => !resubmitLoading && setResubmitTarget(null)}
                disabled={resubmitLoading}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="history-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
              
              {resubmitSuccess ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Request Resubmitted Successfully!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0 }}>
                    Your updated information and clarification note have been forwarded directly to the Super Admin for review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Admin Request Notice Callout */}
                  <div style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1.5px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      Admin's Clarification Request:
                    </span>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      "{resubmitTarget.moreInfoRequestedNotes || resubmitTarget.adminNotes || 'Please provide updated documentation or clarify clinical details.'}"
                    </p>
                  </div>

                  {resubmitError && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={16} />
                      <span>{resubmitError}</span>
                    </div>
                  )}

                  {/* Required Response Note */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Your Response / Notes to Admin <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={resubmitNotes}
                      onChange={e => setResubmitNotes(e.target.value)}
                      placeholder="Explain the changes made, answers to questions, or additional documents uploaded..."
                      disabled={resubmitLoading}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        lineHeight: 1.4
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      This message will be highlighted directly on the Super Admin's review console.
                    </span>
                  </div>

                  {/* Clinical Indication / Narrative */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Clinical Indication / Diagnosis Details
                    </label>
                    <textarea
                      rows={3}
                      value={resubmitDiagnosis}
                      onChange={e => setResubmitDiagnosis(e.target.value)}
                      placeholder="Update or clarify symptoms, diagnosis, or hospital referral details..."
                      disabled={resubmitLoading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        lineHeight: 1.4
                      }}
                    />
                  </div>

                  {/* Contact & Demographics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Contact Phone No.
                      </label>
                      <input
                        type="tel"
                        value={resubmitPhone}
                        onChange={e => setResubmitPhone(e.target.value)}
                        disabled={resubmitLoading}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Status at Exit / GL
                      </label>
                      <input
                        type="text"
                        value={resubmitStatusAtExit}
                        onChange={e => setResubmitStatusAtExit(e.target.value)}
                        disabled={resubmitLoading}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Department at Exit
                      </label>
                      <input
                        type="text"
                        value={resubmitDepartment}
                        onChange={e => setResubmitDepartment(e.target.value)}
                        disabled={resubmitLoading}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={resubmitAddress}
                      onChange={e => setResubmitAddress(e.target.value)}
                      disabled={resubmitLoading}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  {/* Attached Documents & Scans */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Medical Scans &amp; Attached Files ({resubmitAttachments.length})
                      </label>
                      <label style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#005f73',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px dashed #005f73'
                      }}>
                        <Upload size={12} />
                        <span>Add Document</span>
                        <input
                          type="file"
                          onChange={handleAddAttachment}
                          disabled={resubmitLoading}
                          style={{ display: 'none' }}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </label>
                    </div>

                    {resubmitAttachments.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        No files currently attached. Click "Add Document" above if requested to provide scans.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {resubmitAttachments.map((f, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.8rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={14} style={{ color: '#005f73' }} />
                              <span style={{ fontWeight: 600 }}>{f.name}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>({f.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(i)}
                              disabled={resubmitLoading}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              title="Remove File"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setResubmitTarget(null)}
                      disabled={resubmitLoading}
                      className="btn btn-secondary"
                      style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resubmitLoading}
                      className="btn btn-primary"
                      style={{
                        padding: '0.55rem 1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        backgroundColor: '#005f73',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {resubmitLoading ? (
                        <span>Resubmitting...</span>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Resubmit Request to Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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

        /* Filter Search Bar Responsiveness */
        .filter-search-bar {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 640px) {
          .filter-search-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .filter-search-bar .flex-shrink-0 {
            align-self: flex-end;
          }
        }

        /* Responsive Patient Brief Grid inside modal */
        @media (max-width: 480px) {
          .patient-brief-grid {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .brief-column.align-right {
            align-items: flex-start !important;
            text-align: left !important;
          }
        }

        /* Responsive Paper Document Body and Layouts */
        .responsive-paper-body {
          max-height: calc(100vh - 180px);
          overflow-y: auto;
          background-color: #ffffff;
          color: #1e293b;
          padding: 2.5rem;
        }

        @media (max-width: 640px) {
          .responsive-paper-body {
            padding: 1.25rem !important;
          }
        }

        .responsive-paper-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 640px) {
          .responsive-paper-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-paper-grid .form-group-full {
            grid-column: span 1 !important;
          }
        }

        .responsive-clinical-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          border: 1px solid #94a3b8;
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .responsive-clinical-split {
            grid-template-columns: 1fr !important;
          }
          .responsive-clinical-split .left-col {
            border-right: none !important;
            border-bottom: 1px solid #94a3b8 !important;
          }
        }

        .responsive-signature-flex {
          display: flex;
          gap: 1.25rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .responsive-signature-flex {
            flex-direction: column;
            align-items: stretch !important;
          }
          .responsive-signature-flex > div {
            flex: 1 1 auto !important;
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .discharge-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.25rem;
          }
          .discharge-value.text-wrap-value {
            text-align: left !important;
            max-width: 100% !important;
          }
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
