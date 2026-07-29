import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useReferral } from '../../context/ReferralContext';
import { useAuth } from '../../context/AuthContext';
import type { ReferralRequest, MockFile } from '../../types';
import {
  Activity,
  CheckCircle,
  FileCheck,
  FileText,
  Receipt,
  Printer,
  User,
  X,
  Eye,
  Heart,
  Thermometer,
  Droplet,
  Send,
  Search,
  ChevronDown
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
    ctx.strokeStyle = '#0e4b56';
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
        style={{ maxWidth: '500px', width: '90%', borderRadius: '16px', padding: '1.5rem', backgroundColor: '#ffffff' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0e4b56', margin: 0 }}>
            {title}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
          Draw your official signature inside the box below using your mouse or finger.
        </p>

        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', marginBottom: '1.25rem', touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={450}
            height={180}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ width: '100%', height: '180px', display: 'block', cursor: 'crosshair' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleClear}
            className="btn"
            style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Clear Canvas
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasDrawn}
              className="btn"
              style={{
                backgroundColor: hasDrawn ? '#0e4b56' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: hasDrawn ? 'pointer' : 'not-allowed'
              }}
            >
              Adopt &amp; Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const PatientTreatment: React.FC = () => {
  const { getReferralsForUser, completeTreatment, addProgressNote, updateVitals } = useReferral();
  const { currentUser } = useAuth();
  const referrals = getReferralsForUser();

  // Sub-tabs: 'ACTIVE' (ACCEPTED) and 'DISCHARGED' (TREATMENT_COMPLETED)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DISCHARGED'>('ACTIVE');

  const activePatients = referrals.filter(r => r.status === 'ACCEPTED');
  const dischargedPatients = referrals.filter(r => r.status === 'TREATMENT_COMPLETED');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ALL');

  // DISCHARGE FORM STATE (matching scanned sheet Section C & D)
  const [treatmentRef, setTreatmentRef] = useState<ReferralRequest | null>(null);

  // Section C States
  const [hospClinicName, setHospClinicName] = useState('');
  const [careType, setCareType] = useState<'OPD' | 'IN_PATIENT'>('IN_PATIENT');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [timeReported, setTimeReported] = useState('');
  const [dateOfAdmission, setDateOfAdmission] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState('');
  const [telOffice, setTelOffice] = useState('');
  const [telResident, setTelResident] = useState('');

  // Clinical Reports States
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [clinicalInvestigation, setClinicalInvestigation] = useState('');
  const [clinicalMedications, setClinicalMedications] = useState('');
  const [treatmentSummary, setTreatmentSummary] = useState(''); // Textarea summary

  const [doctorSignName, setDoctorSignName] = useState('');
  const [doctorSignature, setDoctorSignature] = useState(false);
  const [doctorSignDate, setDoctorSignDate] = useState('');

  // Section D States (Billing Items)
  const [billRegistration, setBillRegistration] = useState('');
  const [billConsultation, setBillConsultation] = useState('');
  const [billBeddingDays, setBillBeddingDays] = useState('');
  const [billBeddingRate, setBillBeddingRate] = useState('');
  const [billFeedingDays, setBillFeedingDays] = useState('');
  const [billFeedingRate, setBillFeedingRate] = useState('');
  const [billDrugs, setBillDrugs] = useState('');
  const [billSurgical, setBillSurgical] = useState('');
  const [billAnesthesia, setBillAnesthesia] = useState('');
  const [billTheater, setBillTheater] = useState('');
  const [billLabs, setBillLabs] = useState('');
  const [billScans, setBillScans] = useState('');
  const [billBloodPints, setBillBloodPints] = useState('');
  const [billBloodRate, setBillBloodRate] = useState('');
  const [billInfusionPints, setBillInfusionPints] = useState('');
  const [billInfusionRate, setBillInfusionRate] = useState('');
  const [billPhysiotherapy, setBillPhysiotherapy] = useState('');
  const [billNeonatal, setBillNeonatal] = useState('');
  const [billMiscellaneous, setBillMiscellaneous] = useState('');

  // Section D Patient Confirmation States
  const [patientConfirmName, setPatientConfirmName] = useState('');
  const [patientSignature, setPatientSignature] = useState(false);
  const [patientSignDate, setPatientSignDate] = useState('');

  // Real Canvas Signatures States
  const [doctorSignatureDataUrl, setDoctorSignatureDataUrl] = useState<string>('');
  const [patientSignatureDataUrl, setPatientSignatureDataUrl] = useState<string>('');
  const [activeSignModal, setActiveSignModal] = useState<'DOCTOR' | 'PATIENT' | null>(null);

  // Simulated scan uploads
  const [dischargeFile, setDischargeFile] = useState<MockFile | null>(null);

  // Manage Care Modal state (Clinical Logs / Vitals)
  const [selectedActiveRef, setSelectedActiveRef] = useState<ReferralRequest | null>(null);

  // Progress Note input states
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Vitals input states
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [vitalsLoading, setVitalsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedDischargedRef, setSelectedDischargedRef] = useState<ReferralRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
    setDischargeFile({
      name: f.name,
      size: `${sizeMB} MB`,
      type: f.type || 'application/pdf'
    });
  };

  // Prevent TS unused variable errors
  if (patientSignatureDataUrl || typeof handleFileSimulate === 'function') {
    // No-op
  }

  const handleOpenForm = (ref: ReferralRequest) => {
    setTreatmentRef(ref);
    setError(null);
    setDischargeFile(null);

    // Zero default pre-fills - empty strings for placeholders only
    setHospClinicName('');
    setCareType('IN_PATIENT');
    setInvoiceNo('');
    setTimeReported('');
    setDateOfAdmission('');
    setAttendingDoctor('');
    setTelOffice('');
    setTelResident('');

    // Empty clinical reports
    setClinicalDiagnosis('');
    setClinicalInvestigation('');
    setClinicalMedications('');
    setTreatmentSummary('');

    // Empty Doctor details
    setDoctorSignName('');
    setDoctorSignature(false);
    setDoctorSignDate('');

    // Empty Billing
    setBillRegistration('');
    setBillConsultation('');
    setBillBeddingDays('');
    setBillBeddingRate('');
    setBillFeedingDays('');
    setBillFeedingRate('');
    setBillDrugs('');
    setBillSurgical('');
    setBillAnesthesia('');
    setBillTheater('');
    setBillLabs('');
    setBillScans('');
    setBillBloodPints('');
    setBillBloodRate('');
    setBillInfusionPints('');
    setBillInfusionRate('');
    setBillPhysiotherapy('');
    setBillNeonatal('');
    setBillMiscellaneous('');

    // Empty Patient Confirmation
    setPatientConfirmName('');
    setPatientSignature(false);
    setPatientSignDate('');

    // Reset Canvas Signature Data URLs
    setDoctorSignatureDataUrl('');
    setPatientSignatureDataUrl('');
    setActiveSignModal(null);
  };

  const handleOpenManageCare = (ref: ReferralRequest) => {
    setSelectedActiveRef(ref);
    setNewNoteText('');
    setNoteAuthor(currentUser?.name || '');
    setBloodPressure(ref.vitals?.bloodPressure || '');
    setPulseRate(ref.vitals?.pulseRate?.toString() || '');
    setTemperature(ref.vitals?.temperature?.toString() || '');
    setOxygenSaturation(ref.vitals?.oxygenSaturation?.toString() || '');
    setError(null);
  };

  const calculateTotalBill = () => {
    const registrationVal = parseFloat(billRegistration) || 0;
    const consultationVal = parseFloat(billConsultation) || 0;
    const beddingVal = (parseFloat(billBeddingDays) || 0) * (parseFloat(billBeddingRate) || 0);
    const feedingVal = (parseFloat(billFeedingDays) || 0) * (parseFloat(billFeedingRate) || 0);
    const drugsVal = parseFloat(billDrugs) || 0;
    const surgicalVal = parseFloat(billSurgical) || 0;
    const anesthesiaVal = parseFloat(billAnesthesia) || 0;
    const theaterVal = parseFloat(billTheater) || 0;
    const labsVal = parseFloat(billLabs) || 0;
    const scansVal = parseFloat(billScans) || 0;
    const bloodVal = (parseFloat(billBloodPints) || 0) * (parseFloat(billBloodRate) || 0);
    const infusionVal = (parseFloat(billInfusionPints) || 0) * (parseFloat(billInfusionRate) || 0);
    const physioVal = parseFloat(billPhysiotherapy) || 0;
    const neonatalVal = parseFloat(billNeonatal) || 0;
    const miscVal = parseFloat(billMiscellaneous) || 0;

    return (
      registrationVal +
      consultationVal +
      beddingVal +
      feedingVal +
      drugsVal +
      surgicalVal +
      anesthesiaVal +
      theaterVal +
      labsVal +
      scansVal +
      bloodVal +
      infusionVal +
      physioVal +
      neonatalVal +
      miscVal
    );
  };

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveRef) return;
    setVitalsLoading(true);

    const bpVal = bloodPressure || undefined;
    const pulseVal = pulseRate ? parseInt(pulseRate, 10) : undefined;
    const tempVal = temperature ? parseFloat(temperature) : undefined;
    const o2Val = oxygenSaturation ? parseInt(oxygenSaturation, 10) : undefined;

    const res = await updateVitals(selectedActiveRef.id, {
      bloodPressure: bpVal,
      pulseRate: pulseVal,
      temperature: tempVal,
      oxygenSaturation: o2Val
    });

    setVitalsLoading(false);
    if (res.success) {
      const updated = referrals.find(r => r.id === selectedActiveRef.id);
      if (updated) setSelectedActiveRef(updated);
    } else {
      setError(res.message);
    }
  };

  const handleAddProgressNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveRef || !newNoteText || !noteAuthor) return;
    setNoteLoading(true);

    const res = await addProgressNote(selectedActiveRef.id, newNoteText, noteAuthor);

    setNoteLoading(false);
    if (res.success) {
      setNewNoteText('');
      const updated = referrals.find(r => r.id === selectedActiveRef.id);
      if (updated) setSelectedActiveRef(updated);
    } else {
      setError(res.message);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentRef) return;

    if (!clinicalDiagnosis || !doctorSignName) {
      setError('Please fill in diagnosis and doctor name fields.');
      return;
    }

    if (!doctorSignature) {
      setError('Doctor signature is required to confirm this discharge record.');
      return;
    }

    const total = calculateTotalBill();

    setError(null);
    setLoading(true);

    // Format a summary text of the treatment provided for general dashboard logs
    const summaryItems = [];
    if (treatmentSummary) summaryItems.push(treatmentSummary);
    if (clinicalInvestigation) summaryItems.push(`Investigations: ${clinicalInvestigation}`);
    if (clinicalMedications) summaryItems.push(`Medications: ${clinicalMedications}`);
    summaryItems.push(`Total Bill Invoice: ₦${total.toLocaleString()}`);
    const summaryString = summaryItems.join(' | ');

    const res = await completeTreatment(treatmentRef.id, {
      diagnosisConfirmed: clinicalDiagnosis,
      treatmentProvided: summaryString,
      physicianName: doctorSignName,
      reportFile: dischargeFile || undefined,

      // Section C Form Fields
      hospitalClinicName: hospClinicName,
      careType,
      invoiceNo,
      timeReported,
      dateOfAdmission,
      attendingDoctor,
      telOffice,
      telResident,

      clinicalInvestigation,
      clinicalMedications,

      doctorSignature: doctorSignature ? 'Digitally Signed' : 'Not Signed',
      doctorSignDate,

      // Section D Billing Form Fields
      billingRegistration: parseFloat(billRegistration) || 0,
      billingConsultation: parseFloat(billConsultation) || 0,
      billingBeddingDays: parseInt(billBeddingDays, 10) || 0,
      billingBeddingAmount: (parseFloat(billBeddingDays) || 0) * (parseFloat(billBeddingRate) || 0),
      billingFeedingDays: parseInt(billFeedingDays, 10) || 0,
      billingFeedingAmount: (parseFloat(billFeedingDays) || 0) * (parseFloat(billFeedingRate) || 0),
      billingDrugs: parseFloat(billDrugs) || 0,
      billingSurgical: parseFloat(billSurgical) || 0,
      billingAnesthesia: parseFloat(billAnesthesia) || 0,
      billingTheater: parseFloat(billTheater) || 0,
      billingLabs: parseFloat(billLabs) || 0,
      billingScans: parseFloat(billScans) || 0,
      billingBloodPints: parseInt(billBloodPints, 10) || 0,
      billingBloodAmount: (parseFloat(billBloodPints) || 0) * (parseFloat(billBloodRate) || 0),
      billingInfusionPints: parseInt(billInfusionPints, 10) || 0,
      billingInfusionAmount: (parseFloat(billInfusionPints) || 0) * (parseFloat(billInfusionRate) || 0),
      billingPhysiotherapy: parseFloat(billPhysiotherapy) || 0,
      billingNeonatal: parseFloat(billNeonatal) || 0,
      billingMiscellaneous: parseFloat(billMiscellaneous) || 0,
      billingTotal: total,

      // Section D Confirmation Fields
      confirmedByPatientName: patientConfirmName,
      patientSignature: patientSignature ? 'Digitally Signed' : 'Not Signed',
      patientSignDate
    });

    setLoading(false);

    if (res.success) {
      setTreatmentRef(null);
    } else {
      setError(res.message);
    }
  };

  const filterList = (list: ReferralRequest[]) => {
    return list.filter(ref => {
      const name = (ref.patientName || ref.staffName || '').toLowerCase();
      const pensionId = (ref.pensionId || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || pensionId.includes(query);
      const matchesUrgency = urgencyFilter === 'ALL' || ref.urgencyLevel === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  };

  const filteredActive = filterList(activePatients);
  const filteredDischarged = filterList(dischargedPatients);

  // Statistics calculations
  const activeCount = activePatients.length;
  const dischargedCount = dischargedPatients.length;
  const activeEmergencies = activePatients.filter(r => r.urgencyLevel === 'EMERGENCY').length;
  const activeUrgents = activePatients.filter(r => r.urgencyLevel === 'URGENT').length;

  return (
    <div className="patient-treatment flex flex-col gap-6 w-full fade-in">
      {/* <div className="help-banner fade-in">
        <FileCheck className="help-banner-icon" size={20} />
        <div className="help-banner-content">
          <h4>Patient Care Directory</h4>
          <p>
            Review active admitted cases, track patient vitals, log clinical timeline notes, and submit final discharge reports to resolve referrals.
          </p>
        </div>
      </div> */}

      {treatmentRef ? (
        <div className="clinical-assessment-billing-container fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
          
          {/* Top Navigation & Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>
                Requests &nbsp;&rsaquo;&nbsp; <span style={{ color: '#0e4b56', fontWeight: 600 }}>New Clinical Report &amp; Invoice</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0e4b56', margin: 0, letterSpacing: '-0.02em' }}>
                Clinical Assessment &amp; Billing
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTreatmentRef(null)}
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0e4b56',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={loading}
                className="btn"
                style={{
                  backgroundColor: '#0e4b56',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(14, 75, 86, 0.25)'
                }}
              >
                {loading ? 'Submitting...' : 'Finalize Report'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert-message error text-sm p-4 rounded-xl m-b-6" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Card 1: Clinical Report Details */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <FileText size={22} style={{ color: '#0e4b56' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Clinical Report Details
                </h2>
              </div>

              {/* Input Grid 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    HOSPITAL/CLINIC NAME
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    placeholder="St. Lukes International"
                    value={hospClinicName}
                    onChange={e => setHospClinicName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    PATIENT ID / INVOICE NO
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    placeholder="INV-2024-0892"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input Grid 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    PATIENT TYPE
                  </label>
                  <select
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', appearance: 'auto' }}
                    value={careType}
                    onChange={e => setCareType(e.target.value as 'OPD' | 'IN_PATIENT')}
                  >
                    <option value="IN_PATIENT">In-Patient</option>
                    <option value="OPD">OPD (Out-Patient)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    TIME REPORTED
                  </label>
                  <input
                    type="time"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    value={timeReported}
                    onChange={e => setTimeReported(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    ADMISSION DATE
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    value={dateOfAdmission}
                    onChange={e => setDateOfAdmission(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input Grid 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    ATTENDING DOCTOR
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    placeholder="Dr. Jane Smith"
                    value={attendingDoctor}
                    onChange={e => setAttendingDoctor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    TEL (OFFICE)
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    placeholder="Office phone..."
                    value={telOffice}
                    onChange={e => setTelOffice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    TEL (RESIDENT)
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                    placeholder="Resident/Mobile phone..."
                    value={telResident}
                    onChange={e => setTelResident(e.target.value)}
                  />
                </div>
              </div>

              {/* Sub-Section: Medical Observations */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0e4b56', marginBottom: '1.25rem' }}>
                  Medical Observations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                      DIAGNOSIS
                    </label>
                    <textarea
                      rows={4}
                      style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', resize: 'vertical' }}
                      placeholder="Enter patient diagnosis..."
                      value={clinicalDiagnosis}
                      onChange={e => setClinicalDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                      INVESTIGATION &amp; PROCEDURES
                    </label>
                    <textarea
                      rows={4}
                      style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', resize: 'vertical' }}
                      placeholder="Detail investigations and major procedures..."
                      value={clinicalInvestigation}
                      onChange={e => setClinicalInvestigation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    MEDICATIONS
                  </label>
                  <textarea
                    rows={3}
                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', resize: 'vertical' }}
                    placeholder="Prescribed medications..."
                    value={clinicalMedications}
                    onChange={e => setClinicalMedications(e.target.value)}
                    required
                  />
                </div>
              </div>

            </div>

            {/* Card 2: Medical Bill / Invoice */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              
              {/* Section Header with Currency Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Receipt size={22} style={{ color: '#0e4b56' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Medical Bill / Invoice
                  </h2>
                </div>
                <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                  Currency: N / K
                </span>
              </div>

              {/* Billing Table */}
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '60px' }}>S/NO</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>BILLING ITEM / DESCRIPTION</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.725rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '220px' }}>AMOUNT (N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Item 1: Registration */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>1</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Registration</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billRegistration}
                          onChange={e => setBillRegistration(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 2: Consultation */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>2</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Consultation</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billConsultation}
                          onChange={e => setBillConsultation(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 3: Bedding */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>3</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Bedding / Accommodation</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billBeddingDays}
                          onChange={e => setBillBeddingDays(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 4: Feeding */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>4</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Feeding (Full Dietary Board)</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billFeedingDays}
                          onChange={e => setBillFeedingDays(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 5: Drugs */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>5</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Drugs, Injections &amp; Other Medications</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billDrugs}
                          onChange={e => setBillDrugs(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 6: Lab Tests */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>6</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Laboratory Tests &amp; Pathology</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billLabs}
                          onChange={e => setBillLabs(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 7: Scans */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>7</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>E.C.G / X-Rays / Ultrasound Scans</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billScans}
                          onChange={e => setBillScans(e.target.value)}
                        />
                      </td>
                    </tr>

                    {/* Item 8: Infusion */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>8</td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Intravenous Infusion / Drips</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          style={{ width: '140px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', outline: 'none' }}
                          placeholder="0"
                          value={billInfusionPints}
                          onChange={e => setBillInfusionPints(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Payable Row */}
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', letterSpacing: '0.04em' }}>
                  TOTAL PAYABLE
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0e4b56' }}>
                  {calculateTotalBill().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Certification & Signatures Section */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem', marginBottom: '2rem' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '3rem', textAlign: 'center' }}>
                  
                  {/* Doctor Signature */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                      NAME OF DOCTOR
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid #cbd5e1', padding: '0.4rem 0', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: 'transparent', marginBottom: '0.4rem' }}
                      placeholder="Dr. Olumide Akintola"
                      value={doctorSignName}
                      onChange={e => setDoctorSignName(e.target.value)}
                      required
                    />
                    
                    <div
                      onClick={() => setActiveSignModal('DOCTOR')}
                      style={{ cursor: 'pointer', borderBottom: '2px dashed #cbd5e1', padding: '0.4rem 0', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: doctorSignatureDataUrl ? 'transparent' : '#f8fafc', borderRadius: '6px' }}
                    >
                      {doctorSignatureDataUrl ? (
                        <img src={doctorSignatureDataUrl} alt="Doctor Signature" style={{ maxHeight: '40px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ color: '#0e4b56', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          ✍️ Click to Draw Signature
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
                      Attending Physician Signature
                    </div>
                  </div>

                  {/* Certification Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                      CERTIFICATION DATE
                    </label>
                    <input
                      type="date"
                      style={{ width: '100%', border: 'none', borderBottom: '2px dashed #cbd5e1', padding: '0.5rem 0', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', outline: 'none', background: 'transparent' }}
                      value={patientSignDate}
                      onChange={e => setPatientSignDate(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
                      System Generated Timestamp
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Printer size={16} />
                  <span>Print Invoice</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn"
                  style={{
                    backgroundColor: '#0e4b56',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(14, 75, 86, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Submitting...' : 'Submit & Notify Patient'}</span>
                </button>
              </div>

            </div>

          </form>

        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card under-care">
              <div className="stat-icon-wrapper">
                <Activity size={24} />
              </div>
              <div className="stat-details">
                <h3>{activeCount}</h3>
                <p>Active Admitted</p>
              </div>
            </div>
            <div className="stat-card emergencies">
              <div className="stat-icon-wrapper text-danger">
                <Activity size={24} style={{ color: '#ef4444' }} />
              </div>
              <div className="stat-details">
                <h3>{activeEmergencies}</h3>
                <p>Admitted Emergencies</p>
              </div>
            </div>
            <div className="stat-card urgents">
              <div className="stat-icon-wrapper text-warning">
                <Activity size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div className="stat-details">
                <h3>{activeUrgents}</h3>
                <p>Admitted Urgent Cases</p>
              </div>
            </div>
            <div className="stat-card discharged">
              <div className="stat-icon-wrapper text-success">
                <CheckCircle size={24} style={{ color: '#10b981' }} />
              </div>
              <div className="stat-details">
                <h3>{dischargedCount}</h3>
                <p>Completed Treatments</p>
              </div>
            </div>
          </div>

          <div className="sub-tabs-header flex gap-4 border-b-line">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`sub-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            >
              <span>Active Admitted Patients ({activePatients.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('DISCHARGED')}
              className={`sub-tab-btn ${activeTab === 'DISCHARGED' ? 'active' : ''}`}
            >
              <span>Discharged / Completed Cases ({dischargedPatients.length})</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="filter-bar card flex gap-4 flex-wrap align-center justify-between" style={{ padding: '1rem' }}>
            <div className="search-input-container flex-1 min-w-200">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or pension ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-field"
              />
            </div>

            <div className="select-wrapper">
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value as any)}
                className="select-field"
              >
                <option value="ALL">All Urgencies</option>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>

          {activeTab === 'ACTIVE' ? (
            filteredActive.length === 0 ? (
              <div className="card text-center p-8">
                <User size={40} className="text-muted m-b-4" />
                <h4 className="font-semibold">No Active Admitted Patients Found</h4>
                <p className="text-muted text-sm">
                  All search filters evaluated. Check the Incoming Referral Queue to admit new patient requests.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden-mobile table-container card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Details</th>
                        <th>Pension ID No.</th>
                        <th>Urgency</th>
                        <th>Key Vitals Status</th>
                        <th>Admitted Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActive.map(ref => (
                        <tr key={ref.id} className="treatment-table-row">
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {ref.patientName || ref.staffName}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.725rem' }}>
                                Relationship: {ref.patientRelationship || 'Self'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-sm font-semibold">{ref.pensionId || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={`badge ${ref.urgencyLevel === 'EMERGENCY'
                                ? 'badge-danger'
                                : ref.urgencyLevel === 'URGENT'
                                  ? 'badge-warning'
                                  : 'badge-secondary'
                              }`} style={{ fontSize: '0.7rem' }}>
                              {ref.urgencyLevel}
                            </span>
                          </td>
                          <td>
                            {ref.vitals ? (
                              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                <span style={{ fontWeight: 600 }}>BP: {ref.vitals.bloodPressure || '--'}</span>
                                <span className="text-muted">|</span>
                                <span style={{ fontWeight: 600 }}>HR: {ref.vitals.pulseRate || '--'} bpm</span>
                              </div>
                            ) : (
                              <span className="text-muted text-xs">No Vitals Recorded</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {new Date(ref.updatedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleOpenManageCare(ref)}
                                className="btn btn-secondary btn-sm flex align-center justify-center gap-1"
                                style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem' }}
                              >
                                <Activity size={12} />
                                <span>Manage Care</span>
                              </button>
                              <button
                                onClick={() => handleOpenForm(ref)}
                                className="btn btn-primary btn-sm flex align-center justify-center gap-1"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                              >
                                <FileCheck size={12} />
                                <span>Discharge Form</span>
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
                  {filteredActive.map(ref => (
                    <div key={ref.id} className="bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                          <span className="text-[0.7rem] text-text-muted mt-0.5">Relationship: {ref.patientRelationship || 'Self'}</span>
                        </div>
                        <span className={`badge ${ref.urgencyLevel === 'EMERGENCY'
                            ? 'badge-danger'
                            : ref.urgencyLevel === 'URGENT'
                              ? 'badge-warning'
                              : 'badge-secondary'
                          }`} style={{ fontSize: '0.65rem' }}>
                          {ref.urgencyLevel}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-border-color pt-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Pension ID:</span>
                          <span className="font-mono text-text-secondary font-semibold">{ref.pensionId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Admitted:</span>
                          <span className="text-text-secondary font-semibold">
                            {new Date(ref.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Vitals BP/HR:</span>
                          {ref.vitals ? (
                            <span className="text-text-primary font-semibold">BP {ref.vitals.bloodPressure || '--'} | HR {ref.vitals.pulseRate || '--'} bpm</span>
                          ) : (
                            <span className="text-text-muted">None Recorded</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-border-color pt-2.5 mt-1">
                        <button
                          onClick={() => handleOpenManageCare(ref)}
                          className="btn btn-secondary btn-sm flex align-center justify-center gap-1.5 flex-1 font-bold py-2 text-xs"
                        >
                          <Activity size={12} />
                          <span>Manage Vitals</span>
                        </button>
                        <button
                          onClick={() => handleOpenForm(ref)}
                          className="btn btn-primary btn-sm flex align-center justify-center gap-1.5 flex-1 font-bold py-2 text-xs"
                        >
                          <FileCheck size={12} />
                          <span>Discharge</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          ) : filteredDischarged.length === 0 ? (
            <div className="card text-center p-8">
              <CheckCircle size={40} className="text-muted m-b-4" />
              <h4 className="font-semibold">No Discharged Records Found</h4>
              <p className="text-muted text-sm">You have not completed any treatments matching these filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden-mobile table-container card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient Details</th>
                      <th>Pension ID No.</th>
                      <th>Confirmed Diagnosis</th>
                      <th>Discharging Physician</th>
                      <th>Total Invoiced</th>
                      <th>Discharge Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDischarged.map(ref => (
                      <tr key={ref.id} className="treatment-table-row">
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {ref.patientName || ref.staffName}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.725rem' }}>
                              Relationship: {ref.patientRelationship || 'Self'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-sm font-semibold">{ref.pensionId || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            {ref.treatmentReport?.diagnosisConfirmed || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{ref.treatmentReport?.physicianName || 'N/A'}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }} className="text-success">
                            ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {ref.treatmentReport &&
                              new Date(ref.treatmentReport.completedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedDischargedRef(ref)}
                              className="btn btn-secondary btn-sm flex align-center gap-1"
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.775rem' }}
                            >
                              <Eye size={13} />
                              <span>Review Document</span>
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
                {filteredDischarged.map(ref => (
                  <div key={ref.id} className="bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                        <span className="text-[0.7rem] text-text-muted mt-0.5">Relationship: {ref.patientRelationship || 'Self'}</span>
                      </div>
                      <span className="text-xs font-bold text-success font-mono">
                        ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-border-color pt-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Pension ID:</span>
                        <span className="font-mono text-text-secondary font-semibold">{ref.pensionId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Discharged:</span>
                        <span className="text-text-secondary font-semibold">
                          {ref.treatmentReport && new Date(ref.treatmentReport.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Physician:</span>
                        <span className="text-text-secondary font-semibold">{ref.treatmentReport?.physicianName || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-border-color border-dashed pt-2 mt-1">
                        <span className="text-[0.65rem] text-text-muted uppercase font-bold">Confirmed Diagnosis</span>
                        <p className="text-text-secondary m-0 leading-relaxed truncate">{ref.treatmentReport?.diagnosisConfirmed || 'N/A'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDischargedRef(ref)}
                      className="btn btn-secondary btn-sm w-full mt-1.5 font-bold py-2 text-xs flex justify-center items-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Review Certificate</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Manage Patient Care Modal (Vitals + Progress Timeline) */}
      {selectedActiveRef && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedActiveRef(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-lg flex align-center gap-2">
                <Activity size={20} className="text-primary-color" />
                <span>Patient Care Management - File #{selectedActiveRef.id}</span>
              </h3>
              <button className="close-btn" onClick={() => setSelectedActiveRef(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body flex flex-col gap-6" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div className="patient-demographics bg-primary-lightest p-3 rounded" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Name:</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{selectedActiveRef.patientName || selectedActiveRef.staffName}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Pension ID:</span>
                  <p style={{ fontWeight: 700, margin: 0 }} className="font-mono">{selectedActiveRef.pensionId || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Age / Sex:</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{selectedActiveRef.patientAge ? `${selectedActiveRef.patientAge} Yrs / ${selectedActiveRef.patientSex}` : 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Urgency:</span>
                  <p style={{ margin: 0 }}><span className={`badge ${selectedActiveRef.urgencyLevel === 'EMERGENCY' ? 'badge-danger' : selectedActiveRef.urgencyLevel === 'URGENT' ? 'badge-warning' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>{selectedActiveRef.urgencyLevel}</span></p>
                </div>
              </div>

              {/* Vitals and Timeline Grid */}
              <div className="care-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                {/* Vitals Section */}
                <div className="vitals-section-container flex flex-col gap-3">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Clinical Vitals Tracker</h4>

                  {/* Visual Vitals Panel */}
                  <div className="vitals-display-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div className="vital-metric-card">
                      <Heart className="vital-icon pulse" size={16} />
                      <div className="metric-details">
                        <span className="label">Blood Pressure</span>
                        <span className="value">{selectedActiveRef.vitals?.bloodPressure || '--/--'}</span>
                        <span className="unit">mmHg</span>
                      </div>
                    </div>
                    <div className="vital-metric-card">
                      <Activity className="vital-icon" size={16} style={{ color: '#ec4899' }} />
                      <div className="metric-details">
                        <span className="label">Pulse Rate</span>
                        <span className="value">{selectedActiveRef.vitals?.pulseRate || '--'}</span>
                        <span className="unit">bpm</span>
                      </div>
                    </div>
                    <div className="vital-metric-card">
                      <Thermometer className="vital-icon" size={16} style={{ color: '#f59e0b' }} />
                      <div className="metric-details">
                        <span className="label">Temperature</span>
                        <span className="value">{selectedActiveRef.vitals?.temperature || '--'}</span>
                        <span className="unit">°C</span>
                      </div>
                    </div>
                    <div className="vital-metric-card">
                      <Droplet className="vital-icon" size={16} style={{ color: '#06b6d4' }} />
                      <div className="metric-details">
                        <span className="label">Oxygen Saturation</span>
                        <span className="value">{selectedActiveRef.vitals?.oxygenSaturation || '--'}</span>
                        <span className="unit">% SpO2</span>
                      </div>
                    </div>
                  </div>

                  {/* Form to log vitals */}
                  <form onSubmit={handleSaveVitals} className="vitals-form p-3 border rounded bg-primary-lightest flex flex-col gap-3">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Log Current Vitals</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group-sm">
                        <label htmlFor="vital-bp" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>BP (e.g. 120/80)</label>
                        <input
                          id="vital-bp"
                          type="text"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={bloodPressure}
                          onChange={e => setBloodPressure(e.target.value)}
                        />
                      </div>
                      <div className="form-group-sm">
                        <label htmlFor="vital-pulse" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pulse (bpm)</label>
                        <input
                          id="vital-pulse"
                          type="number"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={pulseRate}
                          onChange={e => setPulseRate(e.target.value)}
                        />
                      </div>
                      <div className="form-group-sm">
                        <label htmlFor="vital-temp" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Temp (°C)</label>
                        <input
                          id="vital-temp"
                          type="number"
                          step="0.1"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={temperature}
                          onChange={e => setTemperature(e.target.value)}
                        />
                      </div>
                      <div className="form-group-sm">
                        <label htmlFor="vital-spo2" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>SpO2 (%)</label>
                        <input
                          id="vital-spo2"
                          type="number"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={oxygenSaturation}
                          onChange={e => setOxygenSaturation(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={vitalsLoading}
                      className="btn btn-secondary btn-sm flex align-center justify-center"
                      style={{ padding: '0.35rem', fontSize: '0.75rem' }}
                    >
                      {vitalsLoading ? 'Saving...' : 'Update Patient Vitals'}
                    </button>
                  </form>
                </div>

                {/* Timeline and Progress Log */}
                <div className="timeline-section-container flex flex-col gap-3">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Clinical Progress Logs</h4>

                  {/* Progress Timeline Feed */}
                  <div className="timeline-feed p-3 border rounded bg-primary-lightest" style={{ minHeight: '180px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(!selectedActiveRef.progressNotes || selectedActiveRef.progressNotes.length === 0) ? (
                      <span className="text-muted text-xs text-center m-y-auto">No clinical progress logs recorded yet. Add one below to track patient recovery.</span>
                    ) : (
                      selectedActiveRef.progressNotes.map(n => (
                        <div key={n.id} className="timeline-item flex gap-2">
                          <div className="timeline-marker" />
                          <div className="timeline-content flex flex-col gap-0.5">
                            <p className="note-text text-xs" style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.35 }}>{n.note}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              <span style={{ fontWeight: 600 }}>{n.loggedBy}</span>
                              <span>•</span>
                              <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddProgressNote} className="progress-note-form flex flex-col gap-2">
                    <textarea
                      required
                      placeholder="Type clinical progress note..."
                      className="form-control text-xs"
                      rows={2}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        required
                        type="text"
                        placeholder="Logged by (e.g. Dr. Jenkins)"
                        className="form-control text-xs"
                        style={{ flex: 2, padding: '0.35rem' }}
                        value={noteAuthor}
                        onChange={e => setNoteAuthor(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={noteLoading}
                        className="btn btn-primary btn-sm flex align-center justify-center gap-1"
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Send size={11} />
                        <span>{noteLoading ? 'Saving...' : 'Add Log'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="modal-footer flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedActiveRef(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Close Patient File
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedActiveRef(null);
                  handleOpenForm(selectedActiveRef);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Proceed to Discharge & Complete Case
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW COMPLETED DISCHARGE CASE SUMMARY MODAL (Section C & D Paper Sheet Style) */}
      {selectedDischargedRef && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedDischargedRef(null)}>
          <div className="modal-content paper-document-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header border-b-0 pb-0">
              <div className="paper-form-badge completed">Discharged & Certified Case File</div>
              <button className="close-btn" onClick={() => setSelectedDischargedRef(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body paper-document-body responsive-paper-body" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>

              {/* Paper Form Title */}
              <div className="paper-form-title-section">
                <h2>CENTRAL BANK OF NIGERIA</h2>
                <h3>MEDICAL SERVICES DIVISION REFERRAL DISCHARGE FORM</h3>
                <p>Closed Case • Official Clinical Billing Certificate</p>
              </div>

              {selectedDischargedRef.treatmentReport && (
                <>
                  {/* SECTION C SUMMARY */}
                  <div className="paper-section">
                    <h4 className="paper-section-header">(C) COMPLETED BY THE HOSPITAL/CLINIC</h4>

                    <div className="paper-input-grid display-only">
                      <div className="form-group-full">
                        <span className="paper-label">HOSPITAL/CLINIC NAME</span>
                        <p className="paper-display-value font-bold">{selectedDischargedRef.treatmentReport.hospitalClinicName || selectedDischargedRef.hospitalName}</p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">CARE SETTING TYPE</span>
                        <p className="paper-display-value font-semibold">{selectedDischargedRef.treatmentReport.careType === 'OPD' ? 'OPD (OUT-PATIENT)' : 'IN-PATIENT'}</p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">HOSPITAL BILL INVOICE NO.</span>
                        <p className="paper-display-value font-mono font-bold text-success">{selectedDischargedRef.treatmentReport.invoiceNo || 'N/A'}</p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">TIME REPORTED AT HOSPITAL</span>
                        <p className="paper-display-value">{selectedDischargedRef.treatmentReport.timeReported || 'N/A'}</p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">DATE OF ADMISSION</span>
                        <p className="paper-display-value">
                          {selectedDischargedRef.treatmentReport.dateOfAdmission
                            ? new Date(selectedDischargedRef.treatmentReport.dateOfAdmission).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">ATTENDING DOCTOR</span>
                        <p className="paper-display-value font-semibold">{selectedDischargedRef.treatmentReport.attendingDoctor || selectedDischargedRef.treatmentReport.physicianName}</p>
                      </div>

                      <div className="form-group">
                        <span className="paper-label">TEL (OFFICE)</span>
                        <p className="paper-display-value">{selectedDischargedRef.treatmentReport.telOffice || 'N/A'}</p>
                      </div>

                      <div className="form-group-full">
                        <span className="paper-label">TEL (RESIDENT/MOBILE)</span>
                        <p className="paper-display-value">{selectedDischargedRef.treatmentReport.telResident || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* CLINICAL REPORTS SUMMARY */}
                  <div className="paper-section m-t-4">
                    <h4 className="paper-section-header">CLINICAL REPORTS</h4>

                    <div className="clinical-reports-split-table display-only responsive-clinical-split">
                      <div className="clinical-column left-col">
                        <div className="form-group-full">
                          <span className="paper-label">DIAGNOSIS (CONFIRMED CLINICAL FINDINGS)</span>
                          <div className="paper-textarea-display">
                            {selectedDischargedRef.treatmentReport.diagnosisConfirmed}
                          </div>
                        </div>
                        <div className="form-group-full m-t-3">
                          <span className="paper-label">MEDICATIONS PRESCRIBED & THERAPIES</span>
                          <div className="paper-textarea-display">
                            {selectedDischargedRef.treatmentReport.clinicalMedications || 'No medications recorded.'}
                          </div>
                        </div>
                      </div>

                      <div className="clinical-column right-col">
                        <div className="form-group-full">
                          <span className="paper-label">INVESTIGATION (PATHOLOGY, RADIOLOGY, ETC.)</span>
                          <div className="paper-textarea-display" style={{ minHeight: '235px' }}>
                            {selectedDischargedRef.treatmentReport.clinicalInvestigation || 'No investigations recorded.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedDischargedRef.treatmentReport.treatmentProvided && !selectedDischargedRef.treatmentReport.treatmentProvided.startsWith('Investigations:') && (
                      <div className="form-group-full m-t-3">
                        <span className="paper-label">CLINICAL OVERVIEW & SUMMARY</span>
                        <div className="paper-textarea-display">
                          {selectedDischargedRef.treatmentReport.treatmentProvided.split(' | ')[0]}
                        </div>
                      </div>
                    )}

                    {/* Doctor verification details */}
                    <div className="signature-flex-container m-t-4 p-3 bg-paper-light">
                      <div className="form-group" style={{ flex: 2 }}>
                        <span className="paper-label">ATTENDING PHYSICIAN</span>
                        <p className="paper-display-value font-bold">{selectedDischargedRef.treatmentReport.attendingDoctor || selectedDischargedRef.treatmentReport.physicianName}</p>
                      </div>

                      <div className="form-group signature-box" style={{ flex: 2 }}>
                        <span className="paper-label">DOCTOR'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked">
                          <span className="physician-signature-font">{selectedDischargedRef.treatmentReport.attendingDoctor || selectedDischargedRef.treatmentReport.physicianName}</span>
                        </div>
                      </div>

                      <div className="form-group" style={{ flex: 1.5 }}>
                        <span className="paper-label">DATE SIGNED</span>
                        <p className="paper-display-value">
                          {selectedDischargedRef.treatmentReport.doctorSignDate
                            ? new Date(selectedDischargedRef.treatmentReport.doctorSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION D BILLING SUMMARY */}
                  <div className="paper-section m-t-6">
                    <h4 className="paper-section-header">(D) MEDICAL BILL / INVOICE SUMMARY</h4>

                    <div className="billing-table-wrapper">
                      <table className="paper-billing-table display-only" style={{ minWidth: '550px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>S/NO</th>
                            <th>BILL ITEM / SERVICE DESCRIPTION</th>
                            <th style={{ width: '220px', textAlign: 'center' }}>UNITS / MULTIPLIER</th>
                            <th style={{ width: '220px', textAlign: 'right' }}>COST (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDischargedRef.treatmentReport.billingRegistration ? (
                            <tr>
                              <td className="sno">1</td>
                              <td>Registration / Administration Fee</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingRegistration.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingConsultation ? (
                            <tr>
                              <td className="sno">2</td>
                              <td>Professional Consultation Fee</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingConsultation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingBeddingAmount ? (
                            <tr>
                              <td className="sno">3</td>
                              <td>Bedding / Ward Accommodation</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingBeddingDays || 0} Days</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingBeddingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingFeedingAmount ? (
                            <tr>
                              <td className="sno">4</td>
                              <td>Catering / Patient Feeding Services</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingFeedingDays || 0} Days</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingFeedingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingDrugs ? (
                            <tr>
                              <td className="sno">5</td>
                              <td>Prescribed Drugs, Injections & Medications</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingDrugs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingSurgical ? (
                            <tr>
                              <td className="sno">6</td>
                              <td>Surgical Operation / Delivery Procedures</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingSurgical.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingAnesthesia ? (
                            <tr>
                              <td className="sno">7</td>
                              <td>Anesthetic Administration / Medications</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingAnesthesia.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingTheater ? (
                            <tr>
                              <td className="sno">8</td>
                              <td>Operating Theater Facility Fees</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingTheater.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingLabs ? (
                            <tr>
                              <td className="sno">9</td>
                              <td>Clinical Laboratory Diagnostics / Pathology</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingLabs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingScans ? (
                            <tr>
                              <td className="sno">10</td>
                              <td>Imaging (E.C.G. / X-Rays / Ultrasound Scan)</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingScans.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingBloodAmount ? (
                            <tr>
                              <td className="sno">11</td>
                              <td>Blood Transfusion Services</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingBloodPints || 0} Pints</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingBloodAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingInfusionAmount ? (
                            <tr>
                              <td className="sno">12</td>
                              <td>Intravenous Infusion / Drips administration</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingInfusionPints || 0} Pints</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingInfusionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingPhysiotherapy ? (
                            <tr>
                              <td className="sno">13</td>
                              <td>Physiotherapy & Rehabilitation Sessions</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingPhysiotherapy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingNeonatal ? (
                            <tr>
                              <td className="sno">14</td>
                              <td>Specialized Neonatal Care / Incubator</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingNeonatal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingMiscellaneous ? (
                            <tr>
                              <td className="sno">15</td>
                              <td>Miscellaneous Charges / Other Disposables</td>
                              <td style={{ textAlign: 'center' }}>-</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingMiscellaneous.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {/* Total Row */}
                          <tr className="table-total-row">
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800 }}>CERTIFIED TOTAL:</td>
                            <td className="total-amount-display text-success">
                              ₦{(selectedDischargedRef.treatmentReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PATIENT SIGNATURE CONFIRMATION SUMMARY */}
                  <div className="paper-section m-t-6">
                    <h4 className="paper-section-header">CONFIRMED BY (RETIREE / PENSIONER / DEPENDANT)</h4>

                    <div className="signature-flex-container p-3 bg-paper-light">
                      <div className="form-group" style={{ flex: 2 }}>
                        <span className="paper-label">RETIREE / PENSIONER NAME</span>
                        <p className="paper-display-value font-bold">{selectedDischargedRef.treatmentReport.confirmedByPatientName || selectedDischargedRef.patientName || selectedDischargedRef.staffName}</p>
                      </div>

                      <div className="form-group signature-box" style={{ flex: 2 }}>
                        <span className="paper-label">PATIENT'S DIGITAL SIGNATURE</span>
                        <div className="signature-check-wrapper checked patient-sig">
                          <span className="patient-signature-font">{selectedDischargedRef.treatmentReport.confirmedByPatientName || selectedDischargedRef.patientName || selectedDischargedRef.staffName}</span>
                        </div>
                      </div>

                      <div className="form-group" style={{ flex: 1.5 }}>
                        <span className="paper-label">CONFIRMATION DATE</span>
                        <p className="paper-display-value">
                          {selectedDischargedRef.treatmentReport.patientSignDate
                            ? new Date(selectedDischargedRef.treatmentReport.patientSignDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedDischargedRef.treatmentReport.reportFile && (
                    <div className="form-group m-t-4">
                      <span className="paper-label block-label">ATTACHED CLINICAL DISCHARGE RECORD SUMMARY</span>
                      <div className="file-preview-pill flex align-center justify-between" style={{ padding: '0.75rem', backgroundColor: 'var(--primary-lightest)', borderRadius: '6px' }}>
                        <div className="flex align-center gap-2">
                          <FileText size={18} className="text-success" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedDischargedRef.treatmentReport.reportFile.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedDischargedRef.treatmentReport.reportFile.size})</span>
                        </div>
                        <span className="badge badge-completed">Verified Scanned PDF</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer bg-lightest">
              <button
                type="button"
                onClick={() => setSelectedDischargedRef(null)}
                className="btn btn-secondary w-full"
              >
                Close Case Summary File
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Interactive Digital Signature Draw Pad Modals */}
      {activeSignModal === 'DOCTOR' && (
        <SignaturePadModal
          title="Attending Physician Digital Signature"
          onSave={dataUrl => {
            setDoctorSignatureDataUrl(dataUrl);
            setDoctorSignature(true);
          }}
          onClose={() => setActiveSignModal(null)}
        />
      )}

      {activeSignModal === 'PATIENT' && (
        <SignaturePadModal
          title="Patient / Retiree Digital Confirmation Signature"
          onSave={dataUrl => {
            setPatientSignatureDataUrl(dataUrl);
            setPatientSignature(true);
          }}
          onClose={() => setActiveSignModal(null)}
        />
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background-color: var(--primary-lightest);
          color: var(--primary);
        }

        .stat-card.emergencies .stat-icon-wrapper {
          background-color: rgba(239, 68, 68, 0.1);
        }
        .stat-card.urgents .stat-icon-wrapper {
          background-color: rgba(245, 158, 11, 0.1);
        }
        .stat-card.discharged .stat-icon-wrapper {
          background-color: rgba(16, 185, 129, 0.1);
        }

        .stat-details h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
          color: var(--text-primary);
        }

        .stat-details p {
          font-size: 0.775rem;
          color: var(--text-muted);
          margin: 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
        }

        .search-field {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-field:focus {
          border-color: var(--primary);
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .select-field {
          appearance: none;
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          min-width: 140px;
          transition: border-color 0.2s ease;
        }

        .select-field:focus {
          border-color: var(--primary);
        }

        .select-arrow {
          position: absolute;
          right: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .treatment-table-row:hover td {
          background-color: var(--primary-lightest) !important;
        }

        .sub-tabs-header {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          gap: 1.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .sub-tabs-header::-webkit-scrollbar {
          display: none;
        }

        .sub-tab-btn {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 1rem 0;
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: -2px;
        }

        .sub-tab-btn:hover {
          color: var(--primary);
        }

        .sub-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .patient-brief-bar {
          border: 1px solid var(--border-color);
        }

        .upload-drop-zone {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--bg-primary);
          position: relative;
          cursor: pointer;
        }

        .upload-drop-zone:hover {
          border-color: var(--primary);
        }

        .hidden-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .remove-file-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .remove-file-btn:hover {
          color: var(--danger);
        }

        /* Vitals Cards Styling */
        .vital-metric-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .vital-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .vital-icon.pulse {
          animation: pulseAnim 1.2s infinite alternate;
        }

        @keyframes pulseAnim {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-details .label {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .metric-details .value {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .metric-details .unit {
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        /* Timeline feed styling */
        .timeline-item {
          position: relative;
          padding-left: 1.25rem;
        }

        .timeline-marker {
          position: absolute;
          left: 0.25rem;
          top: 0.25rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--primary);
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 0.45rem;
          top: 0.75rem;
          bottom: -0.75rem;
          width: 1px;
          background-color: var(--border-color);
        }

        .timeline-item:last-child::before {
          display: none;
        }

        /* ==========================================================================
           PAPER DISCHARGE CERTIFICATE STYLE (CLINIC INVOICE LOOK & FEEL)
           ========================================================================== */
        .paper-document-modal {
          max-width: 900px;
          width: 95%;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .paper-form-badge {
          background-color: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.725rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .paper-form-badge.completed {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .paper-document-body {
          background-color: #ffffff; /* Real paper background */
          color: #1e293b;
          padding: 2.5rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .dark .paper-document-body {
          background-color: #f8fafc; /* Keep paper look even in dark mode for invoice visual realism */
          color: #0f172a;
        }

        .paper-form-title-section {
          text-align: center;
          border-bottom: 2px double #475569;
          padding-bottom: 1.25rem;
          margin-bottom: 2rem;
        }

        .paper-form-title-section h2 {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
          letter-spacing: 0.05em;
        }

        .paper-form-title-section h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0.35rem 0 0 0;
          color: #334155;
          letter-spacing: 0.025em;
        }

        .paper-form-title-section p {
          font-size: 0.725rem;
          font-weight: 600;
          margin: 0.5rem 0 0 0;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .paper-section {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 1.25rem;
          background-color: #ffffff;
        }

        .paper-section-header {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          margin: -1.25rem -1.25rem 1.25rem -1.25rem;
          padding: 0.65rem 1.25rem;
          background-color: #f1f5f9;
          border-bottom: 1px solid #cbd5e1;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }

        .paper-input-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-group-full {
          grid-column: span 2;
        }

        .paper-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 750;
          color: #475569;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          letter-spacing: 0.02em;
        }

        .paper-label.block-label {
          font-size: 0.725rem;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .paper-input {
          width: 100%;
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
          border: 1px solid #94a3b8;
          border-radius: 4px;
          background-color: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .paper-input:focus {
          border-color: #0ea5e9;
          background-color: #ffffff;
        }

        .paper-textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          border: 1px solid #94a3b8;
          border-radius: 4px;
          background-color: #f8fafc;
          color: #0f172a;
          outline: none;
          resize: vertical;
        }

        .paper-textarea:focus {
          border-color: #0ea5e9;
          background-color: #ffffff;
        }

        .paper-radio-group {
          display: flex;
          gap: 1.5rem;
          padding: 0.45rem 0;
        }

        .paper-radio-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }

        .paper-radio-label input {
          width: 15px;
          height: 15px;
          cursor: pointer;
        }


        .bg-paper-light {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .signature-flex-container {
          display: flex;
          gap: 1.25rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        /* Custom signature font simulation */
        @import url('https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&family=Reenie+Beanie&display=swap');

        .physician-signature-font {
          font-family: 'Herr Von Muellerhoff', cursive;
          font-size: 2.2rem;
          color: #1e3a8a;
          line-height: 1;
        }

        .patient-signature-font {
          font-family: 'Reenie Beanie', cursive;
          font-size: 1.8rem;
          color: #0f172a;
          line-height: 1;
        }

        .signature-check-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .signature-checkbox-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
          width: 100%;
          height: 100%;
        }

        .signature-display-box {
          width: 100%;
          height: 48px;
          border: 1px dashed #94a3b8;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          overflow: hidden;
        }

        .signature-check-wrapper:hover .signature-display-box {
          background-color: #e2e8f0;
        }

        .signature-placeholder {
          font-size: 0.725rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }

        .signature-check-wrapper.checked {
          height: 48px;
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        /* Billing Form Table styling */
        .billing-table-wrapper {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          overflow: hidden;
        }

        .paper-billing-table {
          width: 100%;
          border-collapse: collapse;
        }

        .paper-billing-table th {
          background-color: #f1f5f9;
          font-size: 0.7rem;
          font-weight: 800;
          color: #334155;
          padding: 0.65rem 0.75rem;
          border-bottom: 2px solid #cbd5e1;
          text-transform: uppercase;
        }

        .paper-billing-table td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #334155;
        }

        .paper-billing-table tr:hover td {
          background-color: #f8fafc;
        }

        .paper-billing-table td.sno {
          text-align: center;
          font-weight: 700;
          color: #64748b;
        }

        .billing-input {
          width: 100%;
          padding: 0.35rem 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          text-align: right;
          font-size: 0.8rem;
          font-family: monospace;
          font-weight: 700;
          color: #0f172a;
          background-color: #f8fafc;
          outline: none;
        }

        .billing-input:focus {
          border-color: #0ea5e9;
          background-color: #ffffff;
        }

        .billing-multiplier {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          justify-content: center;
        }

        .billing-multiplier input {
          width: 60px;
          padding: 0.35rem;
          font-size: 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          text-align: center;
          font-weight: 700;
          background-color: #f8fafc;
          outline: none;
        }

        .billing-multiplier input:focus {
          border-color: #0ea5e9;
          background-color: #ffffff;
        }

        .billing-multiplier span {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
        }

        .paper-billing-table td.amount-display {
          text-align: right;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f172a;
        }

        .table-total-row td {
          background-color: #f8fafc !important;
          border-top: 2px solid #94a3b8;
          border-bottom: none;
        }

        .total-amount-display {
          text-align: right;
          font-family: monospace;
          font-size: 1rem;
          font-weight: 800;
        }

        /* DISPLAY MODE SUMMARY CUSTOM STYLES */
        .paper-input-grid.display-only {
          gap: 0.75rem;
        }

        .paper-input-grid.display-only div {
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 0.35rem;
        }

        .paper-display-value {
          margin: 0.15rem 0 0 0;
          font-size: 0.85rem;
          color: #0f172a;
        }

        .paper-textarea-display {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.75rem;
          font-size: 0.825rem;
          line-height: 1.4;
          min-height: 100px;
          color: #334155;
          white-space: pre-wrap;
        }

        .paper-billing-table.display-only td {
          padding: 0.65rem 0.75rem;
        }

        .paper-billing-table.display-only td.amount {
          text-align: right;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.825rem;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
};
