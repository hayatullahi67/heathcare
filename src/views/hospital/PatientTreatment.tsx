import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useReferral } from '../../context/ReferralContext';
import { useAuth } from '../../context/AuthContext';
import { getReferralIdInfo, type ReferralRequest, type MockFile } from '../../types';
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
  ChevronDown,
  Upload,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Clock,
  PenTool,
  ShieldCheck
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
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Draw your official signature inside the box below using your mouse or finger.
        </p>

        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0b0f19', marginBottom: '1.25rem', touchAction: 'none' }}>
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
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Clear Canvas
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasDrawn}
              className="btn"
              style={{
                backgroundColor: hasDrawn ? 'var(--primary)' : 'var(--border-color)',
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
  const location = useLocation();
  const { getReferralsForUser, completeTreatment, resubmitMedicalBill, addProgressNote, updateVitals } = useReferral();
  const { currentUser } = useAuth();
  const referrals = getReferralsForUser();

  // Sub-tabs: 'ACTIVE' (ACCEPTED), 'PENDING_APPROVAL' (BILL_SUBMITTED), 'DISPUTED' (BILL_REJECTED), and 'DISCHARGED' (TREATMENT_COMPLETED)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING_APPROVAL' | 'DISPUTED' | 'DISCHARGED'>('ACTIVE');

  const activePatients = referrals.filter(r => r.status === 'ACCEPTED');
  const pendingApprovalPatients = referrals.filter(r => r.status === 'BILL_SUBMITTED');
  const disputedPatients = referrals.filter(r => r.status === 'BILL_REJECTED');
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

  // Section D States (All 15 Billing Items)
  const [billRegistration, setBillRegistration] = useState('');
  const [billConsultation, setBillConsultation] = useState('');
  const [billBedding, setBillBedding] = useState('');
  const [billFeeding, setBillFeeding] = useState('');
  const [billDrugs, setBillDrugs] = useState('');
  const [billSurgical, setBillSurgical] = useState('');
  const [billAnesthesia, setBillAnesthesia] = useState('');
  const [billTheater, setBillTheater] = useState('');
  const [billLabs, setBillLabs] = useState('');
  const [billScans, setBillScans] = useState('');
  const [billBlood, setBillBlood] = useState('');
  const [billInfusion, setBillInfusion] = useState('');
  const [billPhysiotherapy, setBillPhysiotherapy] = useState('');
  const [billNeonatal, setBillNeonatal] = useState('');
  const [billMiscellaneous, setBillMiscellaneous] = useState('');

  // Doctor Digital Signature Mode & State
  const [doctorSignMethod, setDoctorSignMethod] = useState<'DRAW' | 'UPLOAD'>('DRAW');
  const [doctorSignatureDataUrl, setDoctorSignatureDataUrl] = useState<string>('');

  // Branch Controller & Branch Support Signatures States
  const [branchControllerSignName, setBranchControllerSignName] = useState('');
  const [branchControllerSignatureDataUrl, setBranchControllerSignatureDataUrl] = useState('');
  const [branchControllerSignDate, setBranchControllerSignDate] = useState('');

  const [branchSupportSignName, setBranchSupportSignName] = useState('');
  const [branchSupportSignatureDataUrl, setBranchSupportSignatureDataUrl] = useState('');
  const [branchSupportSignDate, setBranchSupportSignDate] = useState('');

  const [activeSignModal, setActiveSignModal] = useState<'DOCTOR' | null>(null);

  // Helper for image upload with automatic downscaling & compression to prevent oversized Firestore entities
  const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 160;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          callback(compressed);
        } else {
          callback(rawDataUrl);
        }
      };
      img.onerror = () => {
        callback(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const compressSignatureIfNeeded = async (dataUrl: string | undefined): Promise<string | undefined> => {
    if (!dataUrl) return undefined;
    if (dataUrl.length < 75000) return dataUrl; // Already compact

    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 160;
        let width = img.width;
        let height = img.height;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

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

  if (typeof handleFileSimulate === 'function') {
    // No-op
  }

  const handleOpenForm = (ref: ReferralRequest) => {
    setTreatmentRef(ref);
    setError(null);
    setDischargeFile(null);

    const report = ref.treatmentReport;
    if (report) {
      // Pre-fill existing data (for revision/editing of disputed bills or previously submitted reports)
      setHospClinicName(report.hospitalClinicName || ref.hospitalName || '');
      setCareType(report.careType || 'IN_PATIENT');
      setInvoiceNo(report.invoiceNo || '');
      setTimeReported(report.timeReported || '');
      setDateOfAdmission(report.dateOfAdmission || '');
      setAttendingDoctor(report.attendingDoctor || report.physicianName || '');
      setTelOffice(report.telOffice || '');
      setTelResident(report.telResident || '');

      setClinicalDiagnosis(report.diagnosisConfirmed || '');
      setClinicalInvestigation(report.clinicalInvestigation || '');
      setClinicalMedications(report.clinicalMedications || '');
      setTreatmentSummary(report.treatmentProvided?.split(' | ')[0] || '');

      setDoctorSignName(report.attendingDoctor || report.physicianName || '');
      setDoctorSignature(!!report.doctorSignature || !!report.doctorSignatureImage);
      setDoctorSignDate(report.doctorSignDate || new Date().toISOString().split('T')[0]);
      setDoctorSignatureDataUrl(report.doctorSignatureImage || '');

      setBranchControllerSignName(report.branchControllerSignName || '');
      setBranchControllerSignatureDataUrl(report.branchControllerSignatureImage || '');
      setBranchControllerSignDate(report.branchControllerSignDate || '');

      setBranchSupportSignName(report.branchSupportSignName || '');
      setBranchSupportSignatureDataUrl(report.branchSupportSignatureImage || '');
      setBranchSupportSignDate(report.branchSupportSignDate || '');

      setBillRegistration(report.billingRegistration?.toString() || '');
      setBillConsultation(report.billingConsultation?.toString() || '');
      setBillBedding(report.billingBeddingAmount?.toString() || (report.billingBeddingDays && report.billingBeddingRate ? (report.billingBeddingDays * report.billingBeddingRate).toString() : ''));
      setBillFeeding(report.billingFeedingAmount?.toString() || (report.billingFeedingDays && report.billingFeedingRate ? (report.billingFeedingDays * report.billingFeedingRate).toString() : ''));
      setBillDrugs(report.billingDrugs?.toString() || '');
      setBillSurgical(report.billingSurgical?.toString() || '');
      setBillAnesthesia(report.billingAnesthesia?.toString() || '');
      setBillTheater(report.billingTheater?.toString() || '');
      setBillLabs(report.billingLabs?.toString() || '');
      setBillScans(report.billingScans?.toString() || '');
      setBillBlood(report.billingBloodAmount?.toString() || (report.billingBloodPints && report.billingBloodRate ? (report.billingBloodPints * report.billingBloodRate).toString() : ''));
      setBillInfusion(report.billingInfusionAmount?.toString() || (report.billingInfusionPints && report.billingInfusionRate ? (report.billingInfusionPints * report.billingInfusionRate).toString() : ''));
      setBillPhysiotherapy(report.billingPhysiotherapy?.toString() || '');
      setBillNeonatal(report.billingNeonatal?.toString() || '');
      setBillMiscellaneous(report.billingMiscellaneous?.toString() || '');
    } else {
      // Smart defaults for new clinical reports
      setHospClinicName(ref.hospitalName || currentUser?.name || '');
      setCareType('IN_PATIENT');
      setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
      const now = new Date();
      setTimeReported(now.toTimeString().slice(0, 5));
      setDateOfAdmission(now.toISOString().split('T')[0]);
      setAttendingDoctor(currentUser?.name || '');
      setTelOffice('');
      setTelResident('');

      setClinicalDiagnosis('');
      setClinicalInvestigation('');
      setClinicalMedications('');
      setTreatmentSummary('');

      setDoctorSignName('');
      setDoctorSignature(false);
      setDoctorSignDate(new Date().toISOString().split('T')[0]);
      setDoctorSignatureDataUrl('');

      setBranchControllerSignName('');
      setBranchControllerSignatureDataUrl('');
      setBranchControllerSignDate(new Date().toISOString().split('T')[0]);

      setBranchSupportSignName('');
      setBranchSupportSignatureDataUrl('');
      setBranchSupportSignDate(new Date().toISOString().split('T')[0]);

      setBillRegistration('');
      setBillConsultation('');
      setBillBedding('');
      setBillFeeding('');
      setBillDrugs('');
      setBillSurgical('');
      setBillAnesthesia('');
      setBillTheater('');
      setBillLabs('');
      setBillScans('');
      setBillBlood('');
      setBillInfusion('');
      setBillPhysiotherapy('');
      setBillNeonatal('');
      setBillMiscellaneous('');
    }
  };

  useEffect(() => {
    const targetId = (location.state as any)?.referralId;
    if (targetId && referrals.length > 0) {
      const found = referrals.find(r => r.id === targetId);
      if (found) {
        handleOpenForm(found);
      }
    }
  }, [location.state, referrals]);

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
    const beddingVal = parseFloat(billBedding) || 0;
    const feedingVal = parseFloat(billFeeding) || 0;
    const drugsVal = parseFloat(billDrugs) || 0;
    const surgicalVal = parseFloat(billSurgical) || 0;
    const anesthesiaVal = parseFloat(billAnesthesia) || 0;
    const theaterVal = parseFloat(billTheater) || 0;
    const labsVal = parseFloat(billLabs) || 0;
    const scansVal = parseFloat(billScans) || 0;
    const bloodVal = parseFloat(billBlood) || 0;
    const infusionVal = parseFloat(billInfusion) || 0;
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

    if (!doctorSignature && !doctorSignatureDataUrl) {
      setError('Doctor signature is required to confirm this discharge record.');
      return;
    }

    const total = calculateTotalBill();

    setError(null);
    setLoading(true);

    // Compress signatures if needed to ensure lightweight Firestore entities
    const docSig = await compressSignatureIfNeeded(doctorSignatureDataUrl);
    const branchCtrlSig = await compressSignatureIfNeeded(branchControllerSignatureDataUrl);
    const branchSuppSig = await compressSignatureIfNeeded(branchSupportSignatureDataUrl);

    // Format a summary text of the treatment provided for general dashboard logs
    const summaryItems = [];
    if (treatmentSummary) summaryItems.push(treatmentSummary);
    if (clinicalInvestigation) summaryItems.push(`Investigations: ${clinicalInvestigation}`);
    if (clinicalMedications) summaryItems.push(`Medications: ${clinicalMedications}`);
    summaryItems.push(`Total Bill Invoice: ₦${total.toLocaleString()}`);
    const summaryString = summaryItems.join(' | ');

    const reportPayload = {
      diagnosisConfirmed: clinicalDiagnosis,
      treatmentProvided: summaryString,
      physicianName: doctorSignName,
      reportFile: dischargeFile ? { name: dischargeFile.name, size: dischargeFile.size, type: dischargeFile.type } : undefined,

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

      doctorSignature: doctorSignature || docSig ? 'Digitally Signed' : 'Not Signed',
      doctorSignatureImage: docSig || undefined,
      doctorSignDate: doctorSignDate || new Date().toISOString().split('T')[0],

      // Branch Controller & Support Signatures (Inherited from Admin Referral Authorization)
      branchControllerSignName: treatmentRef.branchControllerSignName || treatmentRef.treatmentReport?.branchControllerSignName || branchControllerSignName || undefined,
      branchControllerSignatureImage: treatmentRef.branchControllerSignatureImage || treatmentRef.treatmentReport?.branchControllerSignatureImage || branchCtrlSig || undefined,
      branchControllerSignDate: treatmentRef.branchControllerSignDate || treatmentRef.treatmentReport?.branchControllerSignDate || branchControllerSignDate || undefined,

      branchSupportSignName: treatmentRef.branchSupportSignName || treatmentRef.treatmentReport?.branchSupportSignName || branchSupportSignName || undefined,
      branchSupportSignatureImage: treatmentRef.branchSupportSignatureImage || treatmentRef.treatmentReport?.branchSupportSignatureImage || branchSuppSig || undefined,
      branchSupportSignDate: treatmentRef.branchSupportSignDate || treatmentRef.treatmentReport?.branchSupportSignDate || branchSupportSignDate || undefined,

      // Section D Billing Form Fields (All 15 items with rates)
      billingRegistration: parseFloat(billRegistration) || 0,
      billingConsultation: parseFloat(billConsultation) || 0,
      billingBeddingDays: 0,
      billingBeddingRate: 0,
      billingBeddingAmount: parseFloat(billBedding) || 0,
      billingFeedingDays: 0,
      billingFeedingRate: 0,
      billingFeedingAmount: parseFloat(billFeeding) || 0,
      billingDrugs: parseFloat(billDrugs) || 0,
      billingSurgical: parseFloat(billSurgical) || 0,
      billingAnesthesia: parseFloat(billAnesthesia) || 0,
      billingTheater: parseFloat(billTheater) || 0,
      billingLabs: parseFloat(billLabs) || 0,
      billingScans: parseFloat(billScans) || 0,
      billingBloodPints: 0,
      billingBloodRate: 0,
      billingBloodAmount: parseFloat(billBlood) || 0,
      billingInfusionPints: 0,
      billingInfusionRate: 0,
      billingInfusionAmount: parseFloat(billInfusion) || 0,
      billingPhysiotherapy: parseFloat(billPhysiotherapy) || 0,
      billingNeonatal: parseFloat(billNeonatal) || 0,
      billingMiscellaneous: parseFloat(billMiscellaneous) || 0,
      billingTotal: total,

      // Beneficiary Confirmation (signed by patient during bill review in their dashboard)
      confirmedByPatientName: treatmentRef.treatmentReport?.confirmedByPatientName || undefined,
      patientSignature: treatmentRef.treatmentReport?.patientSignature || undefined,
      patientSignatureImage: treatmentRef.treatmentReport?.patientSignatureImage || undefined,
      patientSignDate: treatmentRef.treatmentReport?.patientSignDate || undefined
    };

    let res;
    if (treatmentRef.status === 'BILL_REJECTED') {
      // Revising a disputed bill
      res = await resubmitMedicalBill(treatmentRef.id, reportPayload);
    } else {
      // First-time discharge & bill submission
      res = await completeTreatment(treatmentRef.id, reportPayload);
    }

    setLoading(false);

    if (res.success) {
      setTreatmentRef(null);
    } else {
      setError(res.message);
    }
  };

  const filterList = (list: ReferralRequest[]) => {
    return list.filter(ref => {
      const info = getReferralIdInfo(ref);
      const name = (ref.patientName || ref.staffName || '').toLowerCase();
      const pensionId = (ref.pensionId || '').toLowerCase();
      const staffId = (ref.staffIdNumber || '').toLowerCase();
      const idVal = info.idValue.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || pensionId.includes(query) || staffId.includes(query) || idVal.includes(query);
      const matchesUrgency = urgencyFilter === 'ALL' || ref.urgencyLevel === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  };

  const filteredActive = filterList(activePatients);
  const filteredDisputed = filterList(disputedPatients);
  const filteredPendingApproval = filterList(pendingApprovalPatients);
  const filteredDischarged = filterList(dischargedPatients);

  // Statistics calculations
  const activeCount = activePatients.length;
  const disputedCount = disputedPatients.length;
  const pendingApprovalCount = pendingApprovalPatients.length;
  const dischargedCount = dischargedPatients.length;

  const billingItems = [
    { sno: 1, name: 'Registration / Administrative Fee', value: billRegistration, setValue: setBillRegistration },
    { sno: 2, name: 'Professional Consultation Fee', value: billConsultation, setValue: setBillConsultation },
    { sno: 3, name: 'Bedding / Accommodation', value: billBedding, setValue: setBillBedding },
    { sno: 4, name: 'Feeding (Full Dietary Board)', value: billFeeding, setValue: setBillFeeding },
    { sno: 5, name: 'Drugs, Injections & Medications', value: billDrugs, setValue: setBillDrugs },
    { sno: 6, name: 'Surgical Operation / Delivery Procedures', value: billSurgical, setValue: setBillSurgical },
    { sno: 7, name: 'Anesthetic Administration / Medications', value: billAnesthesia, setValue: setBillAnesthesia },
    { sno: 8, name: 'Operating Theater Facility Fees', value: billTheater, setValue: setBillTheater },
    { sno: 9, name: 'Laboratory Tests & Pathology', value: billLabs, setValue: setBillLabs },
    { sno: 10, name: 'E.C.G / X-Rays / Ultrasound Scans', value: billScans, setValue: setBillScans },
    { sno: 11, name: 'Blood Transfusion Services', value: billBlood, setValue: setBillBlood },
    { sno: 12, name: 'Intravenous Infusion / Drips', value: billInfusion, setValue: setBillInfusion },
    { sno: 13, name: 'Physiotherapy & Rehabilitation Sessions', value: billPhysiotherapy, setValue: setBillPhysiotherapy },
    { sno: 14, name: 'Specialized Neonatal Care / Incubator', value: billNeonatal, setValue: setBillNeonatal },
    { sno: 15, name: 'Miscellaneous Charges / Other Disposables', value: billMiscellaneous, setValue: setBillMiscellaneous },
  ];

  return (
    <div className="patient-treatment flex flex-col gap-6 w-full fade-in">
      {treatmentRef ? (
        <div className="clinical-assessment-billing-container fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
          
          {/* Top Navigation & Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div className="treatment-top-breadcrumb">
                Requests &nbsp;&rsaquo;&nbsp; <span className="treatment-top-breadcrumb-active">New Clinical Report &amp; Invoice</span>
              </div>
              <h1 className="treatment-main-title">
                Clinical Assessment &amp; Billing
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTreatmentRef(null)}
                className="treatment-btn-draft"
              >
                Save Draft
              </button>
              <button
                type="button"
                id="finalize-report-btn"
                onClick={handleSubmitReport}
                disabled={loading}
                className="treatment-btn-finalize"
              >
                {loading ? 'Submitting...' : 'Finalize Report'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert-message error text-sm p-4 rounded-xl m-b-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '12px' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Card 1: Clinical Report Details */}
            <div className="treatment-card">
              
              {/* Section Header */}
              <div className="treatment-card-header">
                <FileText size={22} className="treatment-card-icon" />
                <h2 className="treatment-card-title">
                  Clinical Report Details
                </h2>
              </div>

              {/* Input Grid 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="treatment-label">
                    HOSPITAL/CLINIC NAME
                  </label>
                  <input
                    type="text"
                    className="treatment-input"
                    placeholder="St. Lukes International"
                    value={hospClinicName}
                    onChange={e => setHospClinicName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="treatment-label">
                    PATIENT ID / INVOICE NO
                  </label>
                  <input
                    type="text"
                    className="treatment-input"
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
                  <label className="treatment-label">
                    PATIENT TYPE
                  </label>
                  <select
                    className="treatment-input"
                    style={{ appearance: 'auto' }}
                    value={careType}
                    onChange={e => setCareType(e.target.value as 'OPD' | 'IN_PATIENT')}
                  >
                    <option value="IN_PATIENT">In-Patient</option>
                    <option value="OPD">OPD (Out-Patient)</option>
                  </select>
                </div>

                <div>
                  <label className="treatment-label">
                    TIME REPORTED
                  </label>
                  <input
                    type="time"
                    className="treatment-input"
                    value={timeReported}
                    onChange={e => setTimeReported(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="treatment-label">
                    ADMISSION DATE
                  </label>
                  <input
                    type="date"
                    className="treatment-input"
                    value={dateOfAdmission}
                    onChange={e => setDateOfAdmission(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input Grid 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label className="treatment-label">
                    ATTENDING DOCTOR
                  </label>
                  <input
                    type="text"
                    className="treatment-input"
                    placeholder="Dr. Jane Smith"
                    value={attendingDoctor}
                    onChange={e => setAttendingDoctor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="treatment-label">
                    TEL (OFFICE)
                  </label>
                  <input
                    type="text"
                    className="treatment-input"
                    placeholder="Office phone..."
                    value={telOffice}
                    onChange={e => setTelOffice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="treatment-label">
                    TEL (RESIDENT)
                  </label>
                  <input
                    type="text"
                    className="treatment-input"
                    placeholder="Resident/Mobile phone..."
                    value={telResident}
                    onChange={e => setTelResident(e.target.value)}
                  />
                </div>
              </div>

              {/* Sub-Section: Medical Observations */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 className="treatment-subheading">
                  Medical Observations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="treatment-label" htmlFor="diagnosis-input">
                      DIAGNOSIS
                    </label>
                    <textarea
                      id="diagnosis-input"
                      rows={4}
                      className="treatment-textarea"
                      placeholder="Enter patient diagnosis..."
                      value={clinicalDiagnosis}
                      onChange={e => setClinicalDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="treatment-label" htmlFor="investigation-input">
                      INVESTIGATION &amp; PROCEDURES
                    </label>
                    <textarea
                      id="investigation-input"
                      rows={4}
                      className="treatment-textarea"
                      placeholder="Detail investigations and major procedures..."
                      value={clinicalInvestigation}
                      onChange={e => setClinicalInvestigation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="treatment-label" htmlFor="medications-input">
                    MEDICATIONS
                  </label>
                  <textarea
                    id="medications-input"
                    rows={3}
                    className="treatment-textarea"
                    placeholder="Prescribed medications..."
                    value={clinicalMedications}
                    onChange={e => setClinicalMedications(e.target.value)}
                    required
                  />
                </div>
              </div>

            </div>

            {/* Card 2: Medical Bill / Invoice */}
            <div className="treatment-card">
              
              {/* Section Header with Currency Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Receipt size={22} className="treatment-card-icon" />
                  <h2 className="treatment-card-title">
                    Medical Bill / Invoice
                  </h2>
                </div>
                <span className="treatment-currency-badge">
                  Currency: ₦ / NGN
                </span>
              </div>

              {/* Billing Table */}
              <div className="treatment-table-wrapper">
                <table className="treatment-billing-table">
                  <thead>
                    <tr className="treatment-billing-thead-tr">
                      <th className="treatment-billing-th" style={{ width: '50px', textAlign: 'center' }}>S/NO</th>
                      <th className="treatment-billing-th" style={{ textAlign: 'left' }}>BILLING ITEM / DESCRIPTION</th>
                      <th className="treatment-billing-th" style={{ width: '240px', textAlign: 'center' }}>RATE / MULTIPLIER</th>
                      <th className="treatment-billing-th" style={{ width: '180px', textAlign: 'right' }}>AMOUNT (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.map(item => (
                      <tr key={item.sno} className="treatment-billing-row">
                        <td className="treatment-billing-sno">{item.sno}</td>
                        <td className="treatment-billing-desc">{item.name}</td>
                        <td className="treatment-billing-multiplier">
                          <span className="treatment-billing-fixed">Fixed Item</span>
                        </td>
                        <td className="treatment-billing-amount">
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            className="treatment-amount-input"
                            placeholder="0"
                            value={item.value}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              const parts = val.split('.');
                              const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : val;
                              item.setValue(sanitized);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Payable Row */}
              <div className="treatment-total-banner">
                <div>
                  <span className="treatment-total-label">
                    TOTAL CERTIFIED BILL PAYABLE
                  </span>
                  <span className="treatment-total-subtitle">Real-time summation of all 15 clinical items</span>
                </div>
                <span className="treatment-total-sum">
                  ₦{calculateTotalBill().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Certification & Signatures Section */}
              <div className="treatment-signatures-section">
                <h3 className="treatment-signatures-title">
                  <PenTool size={18} className="treatment-card-icon" />
                  <span>Hospital Certification &amp; Signatures</span>
                </h3>

                {/* Official Bank Authorization (Section B - Authorized by Admin) */}
                {(treatmentRef?.branchControllerSignName || treatmentRef?.branchControllerSignatureImage || treatmentRef?.branchSupportSignName || treatmentRef?.branchSupportSignatureImage) && (
                  <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          Section B: Central Bank Management Authorizations (Approved by Admin)
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        ✓ Authorized by Central Bank Admin
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {/* Branch Controller */}
                      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. Branch Controller</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {treatmentRef.branchControllerSignName || 'Branch Controller'}
                        </span>
                        <div style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          {treatmentRef.branchControllerSignatureImage ? (
                            <img src={treatmentRef.branchControllerSignatureImage} alt="Branch Controller Signature" style={{ maxHeight: '38px', maxWidth: '90%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Signature on File</span>
                          )}
                        </div>
                        {treatmentRef.branchControllerSignDate && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Date: {treatmentRef.branchControllerSignDate}
                          </span>
                        )}
                      </div>

                      {/* Branch Support */}
                      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. Branch Support Officer</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {treatmentRef.branchSupportSignName || 'Branch Support Officer'}
                        </span>
                        <div style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          {treatmentRef.branchSupportSignatureImage ? (
                            <img src={treatmentRef.branchSupportSignatureImage} alt="Branch Support Signature" style={{ maxHeight: '38px', maxWidth: '90%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Signature on File</span>
                          )}
                        </div>
                        {treatmentRef.branchSupportSignDate && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Date: {treatmentRef.branchSupportSignDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="treatment-signatures-grid">
                  
                  {/* Signature: Attending Doctor */}
                  <div className="treatment-sig-card" style={{ maxWidth: '520px' }}>
                    <div className="treatment-sig-header">
                      <span className="treatment-sig-title">
                        Attending Doctor / Physician Endorsement
                      </span>
                      <div className="treatment-sig-toggle-box">
                        <button
                          type="button"
                          onClick={() => setDoctorSignMethod('DRAW')}
                          className={`treatment-sig-toggle-btn ${doctorSignMethod === 'DRAW' ? 'active' : 'inactive'}`}
                        >
                          Draw
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoctorSignMethod('UPLOAD')}
                          className={`treatment-sig-toggle-btn ${doctorSignMethod === 'UPLOAD' ? 'active' : 'inactive'}`}
                        >
                          Upload
                        </button>
                      </div>
                    </div>

                    <label className="treatment-label" htmlFor="doctor-sign-name-input">
                      Doctor's Name
                    </label>
                    <input
                      id="doctor-sign-name-input"
                      type="text"
                      className="treatment-sig-input"
                      placeholder="Dr. Olumide Akintola"
                      value={doctorSignName}
                      onChange={e => setDoctorSignName(e.target.value)}
                      required
                    />

                    <label className="treatment-label">
                      Signature
                    </label>
                    {doctorSignatureDataUrl ? (
                      <div className="treatment-sig-display-box">
                        <img src={doctorSignatureDataUrl} alt="Doctor Signature" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                        <button
                          type="button"
                          onClick={() => {
                            setDoctorSignatureDataUrl('');
                            setDoctorSignature(false);
                          }}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}
                          title="Remove signature"
                        >
                          ✕
                        </button>
                      </div>
                    ) : doctorSignMethod === 'DRAW' ? (
                      <div
                        id="draw-signature-btn"
                        onClick={() => setActiveSignModal('DOCTOR')}
                        className="treatment-sig-draw-trigger"
                      >
                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          ✍️ Click to Draw Signature
                        </span>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label className="treatment-sig-upload-box">
                          <Upload size={18} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Upload Signature Image</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PNG, JPG or JPEG</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], (data) => {
                                  setDoctorSignatureDataUrl(data);
                                  setDoctorSignature(true);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}

                    <label className="treatment-label">
                      Date Signed
                    </label>
                    <input
                      type="date"
                      className="treatment-sig-input"
                      value={doctorSignDate}
                      onChange={e => setDoctorSignDate(e.target.value)}
                    />
                  </div>

                </div>
              </div>

              {/* Bottom Actions */}
              <div className="treatment-bottom-actions">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="treatment-btn-print"
                >
                  <Printer size={16} />
                  <span>Print Invoice</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="treatment-btn-submit"
                  style={{
                    backgroundColor: treatmentRef?.status === 'BILL_REJECTED' ? '#d97706' : 'var(--primary)',
                  }}
                >
                  <Send size={16} />
                  <span>
                    {loading
                      ? 'Processing...'
                      : treatmentRef?.status === 'BILL_REJECTED'
                        ? 'Resubmit Revised Bill to Beneficiary'
                        : 'Submit Medical Bill & Discharge'}
                  </span>
                </button>
              </div>

            </div>

          </form>

        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card under-care">
              <div className="stat-icon-wrapper">
                <Activity size={24} />
              </div>
              <div className="stat-details">
                <h3>{activeCount}</h3>
                <p>Active Admitted</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="stat-icon-wrapper text-danger">
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              </div>
              <div className="stat-details">
                <h3 style={{ color: disputedCount > 0 ? '#ef4444' : undefined }}>{disputedCount}</h3>
                <p>Disputed Bills</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="stat-icon-wrapper" style={{ color: '#f59e0b' }}>
                <Clock size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div className="stat-details">
                <h3>{pendingApprovalCount}</h3>
                <p>Awaiting Approval</p>
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

          <div className="sub-tabs-header flex gap-4 border-b-line" style={{ flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`sub-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            >
              <span>Active In-Patients ({activePatients.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('DISPUTED')}
              className={`sub-tab-btn ${activeTab === 'DISPUTED' ? 'active' : ''}`}
              style={disputedPatients.length > 0 ? { color: '#ef4444', fontWeight: 700 } : undefined}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {disputedPatients.length > 0 && <AlertTriangle size={14} style={{ color: '#ef4444' }} />}
                Disputed Bills ({disputedPatients.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('PENDING_APPROVAL')}
              className={`sub-tab-btn ${activeTab === 'PENDING_APPROVAL' ? 'active' : ''}`}
            >
              <span>Awaiting Approval ({pendingApprovalPatients.length})</span>
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
                placeholder="Search by name, Staff ID, or Pension ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-field"
              />
            </div>

            <div className="select-wrapper">
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value as 'ALL' | 'ROUTINE' | 'URGENT' | 'EMERGENCY')}
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
                        <th>ID No.</th>
                        <th>Urgency</th>
                        <th>Key Vitals Status</th>
                        <th>Admitted Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActive.map(ref => {
                        const info = getReferralIdInfo(ref);
                        return (
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
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="font-mono text-sm font-semibold">{info.idValue}</span>
                                <span className="text-muted" style={{ fontSize: '0.675rem' }}>{info.idLabel}</span>
                              </div>
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
                      );
                    })}
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
                        {(() => {
                          const info = getReferralIdInfo(ref);
                          return (
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">{info.idLabel}:</span>
                              <span className="font-mono text-text-secondary font-semibold">{info.idValue}</span>
                            </div>
                          );
                        })()}
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
          ) : activeTab === 'DISPUTED' ? (
            filteredDisputed.length === 0 ? (
              <div className="card text-center p-8">
                <CheckCircle size={40} className="text-success m-b-4" style={{ color: '#10b981' }} />
                <h4 className="font-semibold">No Disputed Medical Bills</h4>
                <p className="text-muted text-sm">All submitted medical bills are approved or under standard review.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table for Disputed Bills */}
                <div className="hidden-mobile table-container card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Details</th>
                        <th>ID No.</th>
                        <th>Dispute Reason / Notes</th>
                        <th>Bill Amount</th>
                        <th>Date Disputed</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisputed.map(ref => {
                        const info = getReferralIdInfo(ref);
                        return (
                          <tr key={ref.id} className="treatment-table-row" style={{ backgroundColor: '#fef2f2' }}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <span className="font-semibold text-danger" style={{ color: '#b91c1c' }}>
                                  {ref.patientName || ref.staffName}
                                </span>
                                <span className="text-muted" style={{ fontSize: '0.725rem' }}>
                                  Relationship: {ref.patientRelationship || 'Self'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="font-mono text-sm font-semibold">{info.idValue}</span>
                                <span className="text-muted" style={{ fontSize: '0.675rem' }}>{info.idLabel}</span>
                              </div>
                            </td>
                            <td style={{ maxWidth: '300px' }}>
                              <div className="p-2 rounded bg-white border border-red-200 text-xs text-red-900 leading-relaxed flex items-start gap-1.5 shadow-sm">
                                <AlertCircle size={14} className="text-danger shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                <span className="font-medium">{ref.treatmentReport?.billRejectionReason || 'Disputed by beneficiary'}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }} className="text-danger font-mono">
                                ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {ref.treatmentReport?.billRejectedAt
                                  ? new Date(ref.treatmentReport.billRejectedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'Recently'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleOpenForm(ref)}
                                  className="btn btn-primary btn-sm flex align-center gap-1 font-bold"
                                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem', backgroundColor: '#d97706', borderColor: '#d97706' }}
                                >
                                  <RefreshCw size={13} />
                                  <span>Edit &amp; Resend Bill</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards for Disputed */}
                <div className="visible-mobile flex flex-col gap-3">
                  {filteredDisputed.map(ref => {
                    const info = getReferralIdInfo(ref);
                    return (
                      <div key={ref.id} className="bg-bg-secondary border-2 border-red-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-red-700">{ref.patientName || ref.staffName}</span>
                            <span className="text-[0.7rem] text-text-muted mt-0.5">{info.idLabel}: {info.idValue}</span>
                          </div>
                          <span className="text-xs font-bold text-danger font-mono">
                            ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                          <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[0.65rem] uppercase text-red-800">Beneficiary Dispute Reason:</strong>
                            <p className="m-0 mt-0.5">{ref.treatmentReport?.billRejectionReason || 'No details provided.'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenForm(ref)}
                          className="btn btn-primary btn-sm w-full font-bold py-2 text-xs flex justify-center items-center gap-1.5"
                          style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                        >
                          <RefreshCw size={13} />
                          <span>Edit &amp; Resend Bill</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          ) : activeTab === 'PENDING_APPROVAL' ? (
            filteredPendingApproval.length === 0 ? (
              <div className="card text-center p-8">
                <Clock size={40} className="text-muted m-b-4" />
                <h4 className="font-semibold">No Bills Awaiting Approval</h4>
                <p className="text-muted text-sm">All discharged patient bills have been reviewed by beneficiaries.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table for Pending Approval */}
                <div className="hidden-mobile table-container card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient Details</th>
                        <th>ID No.</th>
                        <th>Physician</th>
                        <th>Total Invoiced</th>
                        <th>Submitted At</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingApproval.map(ref => {
                        const info = getReferralIdInfo(ref);
                        return (
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
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="font-mono text-sm font-semibold">{info.idValue}</span>
                                <span className="text-muted" style={{ fontSize: '0.675rem' }}>{info.idLabel}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem' }}>{ref.treatmentReport?.physicianName || 'N/A'}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }} className="text-warning font-mono">
                                ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {ref.treatmentReport?.completedAt
                                  ? new Date(ref.treatmentReport.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'Recently'}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                                Awaiting Beneficiary Review
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
                                  <span>Review Bill</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View for Pending Approval */}
                <div className="visible-mobile flex flex-col gap-3">
                  {filteredPendingApproval.map(ref => {
                    const info = getReferralIdInfo(ref);
                    return (
                      <div key={ref.id} className="bg-bg-secondary border border-amber-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-text-primary">{ref.patientName || ref.staffName}</span>
                            <span className="text-[0.7rem] text-text-muted mt-0.5">{info.idLabel}: {info.idValue}</span>
                          </div>
                          <span className="text-xs font-bold text-warning font-mono">
                            ₦{ref.treatmentReport?.billingTotal?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-border-color pt-2">
                          <span className="text-text-muted">Status:</span>
                          <span className="badge badge-warning text-[0.65rem]">Awaiting Beneficiary</span>
                        </div>
                        <button
                          onClick={() => setSelectedDischargedRef(ref)}
                          className="btn btn-secondary btn-sm w-full font-bold py-2 text-xs flex justify-center items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>Review Submitted Bill</span>
                        </button>
                      </div>
                    );
                  })}
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
                      <th>ID No.</th>
                      <th>Confirmed Diagnosis</th>
                      <th>Discharging Physician</th>
                      <th>Total Invoiced</th>
                      <th>Discharge Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDischarged.map(ref => {
                      const info = getReferralIdInfo(ref);
                      return (
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
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="font-mono text-sm font-semibold">{info.idValue}</span>
                              <span className="text-muted" style={{ fontSize: '0.675rem' }}>{info.idLabel}</span>
                            </div>
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
                    );
                  })}
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
                      {(() => {
                        const info = getReferralIdInfo(ref);
                        return (
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">{info.idLabel}:</span>
                            <span className="font-mono text-text-secondary font-semibold">{info.idValue}</span>
                          </div>
                        );
                      })()}
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
                {(() => {
                  const info = getReferralIdInfo(selectedActiveRef);
                  return (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{info.idLabel}:</span>
                      <p style={{ fontWeight: 700, margin: 0 }} className="font-mono">{info.idValue}</p>
                    </div>
                  );
                })()}
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
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={pulseRate}
                          onChange={e => setPulseRate(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="form-group-sm">
                        <label htmlFor="vital-temp" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Temp (°C)</label>
                        <input
                          id="vital-temp"
                          type="text"
                          inputMode="decimal"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={temperature}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : val;
                            setTemperature(sanitized);
                          }}
                        />
                      </div>
                      <div className="form-group-sm">
                        <label htmlFor="vital-spo2" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>SpO2 (%)</label>
                        <input
                          id="vital-spo2"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="form-control text-xs"
                          style={{ padding: '0.35rem' }}
                          value={oxygenSaturation}
                          onChange={e => setOxygenSaturation(e.target.value.replace(/\D/g, ''))}
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
                        <div className="signature-check-wrapper checked" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selectedDischargedRef.treatmentReport.doctorSignatureImage ? (
                            <img
                              src={selectedDischargedRef.treatmentReport.doctorSignatureImage}
                              alt="Doctor Signature"
                              style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span className="physician-signature-font">{selectedDischargedRef.treatmentReport.attendingDoctor || selectedDischargedRef.treatmentReport.physicianName}</span>
                          )}
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

                    {/* Branch Controller & Branch Support Endorsements */}
                    {(selectedDischargedRef.branchControllerSignatureImage || selectedDischargedRef.branchControllerSignName || selectedDischargedRef.treatmentReport.branchControllerSignatureImage || selectedDischargedRef.treatmentReport.branchControllerSignName || selectedDischargedRef.branchSupportSignatureImage || selectedDischargedRef.branchSupportSignName || selectedDischargedRef.treatmentReport.branchSupportSignatureImage || selectedDischargedRef.treatmentReport.branchSupportSignName) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {/* Branch Controller */}
                        <div className="p-3 bg-paper-light border rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                          <span className="paper-label block font-bold text-xs uppercase" style={{ color: '#0e4b56', marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem', fontWeight: 750 }}>
                            BRANCH CONTROLLER ENDORSEMENT
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Name: </span>
                              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{selectedDischargedRef.treatmentReport.branchControllerSignName || selectedDischargedRef.branchControllerSignName || 'Branch Controller'}</strong>
                            </div>
                            <div className="signature-check-wrapper checked" style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                              {(selectedDischargedRef.treatmentReport.branchControllerSignatureImage || selectedDischargedRef.branchControllerSignatureImage) ? (
                                <img
                                  src={selectedDischargedRef.treatmentReport.branchControllerSignatureImage || selectedDischargedRef.branchControllerSignatureImage}
                                  alt="Branch Controller Signature"
                                  style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '1.8rem', color: '#1e3a8a' }}>{selectedDischargedRef.treatmentReport.branchControllerSignName || selectedDischargedRef.branchControllerSignName || 'Endorsed'}</span>
                              )}
                            </div>
                            {(selectedDischargedRef.treatmentReport.branchControllerSignDate || selectedDischargedRef.branchControllerSignDate) && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Endorsed Date: {new Date(selectedDischargedRef.treatmentReport.branchControllerSignDate || selectedDischargedRef.branchControllerSignDate!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Branch Support */}
                        <div className="p-3 bg-paper-light border rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                          <span className="paper-label block font-bold text-xs uppercase" style={{ color: '#0e4b56', marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem', fontWeight: 750 }}>
                            BRANCH SUPPORT ENDORSEMENT
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Name: </span>
                              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{selectedDischargedRef.treatmentReport.branchSupportSignName || selectedDischargedRef.branchSupportSignName || 'Branch Support Officer'}</strong>
                            </div>
                            <div className="signature-check-wrapper checked" style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                              {(selectedDischargedRef.treatmentReport.branchSupportSignatureImage || selectedDischargedRef.branchSupportSignatureImage) ? (
                                <img
                                  src={selectedDischargedRef.treatmentReport.branchSupportSignatureImage || selectedDischargedRef.branchSupportSignatureImage}
                                  alt="Branch Support Signature"
                                  style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontFamily: "'Herr Von Muellerhoff', cursive", fontSize: '1.8rem', color: '#1e3a8a' }}>{selectedDischargedRef.treatmentReport.branchSupportSignName || selectedDischargedRef.branchSupportSignName || 'Endorsed'}</span>
                              )}
                            </div>
                            {(selectedDischargedRef.treatmentReport.branchSupportSignDate || selectedDischargedRef.branchSupportSignDate) && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Endorsed Date: {new Date(selectedDischargedRef.treatmentReport.branchSupportSignDate || selectedDischargedRef.branchSupportSignDate!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingBeddingDays ? `${selectedDischargedRef.treatmentReport.billingBeddingDays} Days` : '-'}</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingBeddingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingFeedingAmount ? (
                            <tr>
                              <td className="sno">4</td>
                              <td>Catering / Patient Feeding Services</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingFeedingDays ? `${selectedDischargedRef.treatmentReport.billingFeedingDays} Days` : '-'}</td>
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
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingBloodPints ? `${selectedDischargedRef.treatmentReport.billingBloodPints} Pints` : '-'}</td>
                              <td className="amount">₦{selectedDischargedRef.treatmentReport.billingBloodAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}

                          {selectedDischargedRef.treatmentReport.billingInfusionAmount ? (
                            <tr>
                              <td className="sno">12</td>
                              <td>Intravenous Infusion / Drips administration</td>
                              <td style={{ textAlign: 'center' }}>{selectedDischargedRef.treatmentReport.billingInfusionPints ? `${selectedDischargedRef.treatmentReport.billingInfusionPints} Pints` : '-'}</td>
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
                    {(() => {
                      const repInfo = getReferralIdInfo(selectedDischargedRef);
                      return (
                        <>
                          <h4 className="paper-section-header">
                            CONFIRMED BY ({repInfo.isStaff ? 'STAFF MEMBER / DEPENDANT' : 'RETIREE / PENSIONER / DEPENDANT'})
                          </h4>

                          <div className="signature-flex-container p-3 bg-paper-light">
                            <div className="form-group" style={{ flex: 2 }}>
                              <span className="paper-label">
                                {repInfo.isStaff ? 'STAFF MEMBER NAME' : 'RETIREE / PENSIONER NAME'}
                              </span>
                              <p className="paper-display-value font-bold">{selectedDischargedRef.treatmentReport.confirmedByPatientName || selectedDischargedRef.patientName || selectedDischargedRef.staffName}</p>
                            </div>

                            <div className="form-group signature-box" style={{ flex: 2 }}>
                              <span className="paper-label">PATIENT'S DIGITAL SIGNATURE</span>
                              <div className="signature-check-wrapper checked patient-sig" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedDischargedRef.treatmentReport.patientSignatureImage ? (
                                  <img
                                    src={selectedDischargedRef.treatmentReport.patientSignatureImage}
                                    alt="Patient Digital Signature"
                                    style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <span className="patient-signature-font">{selectedDischargedRef.treatmentReport.confirmedByPatientName || selectedDischargedRef.patientName || selectedDischargedRef.staffName}</span>
                                )}
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
                        </>
                      );
                    })()}
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


      <style>{`
        /* ==========================================================================
           CLINICAL ASSESSMENT & BILLING (DARK THEME STYLES)
           ========================================================================== */
        .clinical-assessment-billing-container {
          color: var(--text-primary);
        }

        .treatment-top-breadcrumb {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .treatment-top-breadcrumb-active {
          color: var(--primary);
          font-weight: 600;
        }

        .treatment-main-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .treatment-btn-draft {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .treatment-btn-draft:hover {
          background-color: var(--bg-primary);
          border-color: var(--primary);
        }

        .treatment-btn-finalize {
          background-color: var(--primary);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 0.65rem 1.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
          cursor: pointer;
          transition: var(--transition);
        }
        .treatment-btn-finalize:hover:not(:disabled) {
          background-color: var(--primary-hover);
          box-shadow: 0 6px 18px rgba(14, 165, 233, 0.45);
        }

        .treatment-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }

        .treatment-card-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .treatment-card-icon {
          color: var(--primary);
        }

        .treatment-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .treatment-label {
          display: block;
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
        }

        .treatment-input {
          width: 100%;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          font-size: 0.95rem;
          color: var(--text-primary);
          -webkit-text-fill-color: var(--text-primary);
          outline: none;
          color-scheme: dark;
          -webkit-user-select: text;
          user-select: text;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .treatment-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .treatment-textarea {
          width: 100%;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          color: var(--text-primary);
          -webkit-text-fill-color: var(--text-primary);
          outline: none;
          resize: vertical;
          font-family: inherit;
          color-scheme: dark;
          -webkit-user-select: text;
          user-select: text;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .treatment-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .treatment-subheading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }

        .treatment-currency-badge {
          background-color: rgba(14, 165, 233, 0.12);
          color: var(--primary);
          border: 1px solid rgba(14, 165, 233, 0.25);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
        }

        .treatment-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background-color: var(--bg-primary);
        }

        .treatment-billing-table {
          width: 100%;
          border-collapse: collapse;
        }

        .treatment-billing-thead-tr {
          border-bottom: 2px solid var(--border-color);
          background-color: rgba(255, 255, 255, 0.02);
        }

        .treatment-billing-th {
          padding: 0.85rem 0.75rem;
          font-size: 0.725rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .treatment-billing-row {
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.15s ease;
        }
        .treatment-billing-row:last-child {
          border-bottom: none;
        }
        .treatment-billing-row:hover {
          background-color: rgba(14, 165, 233, 0.04);
        }

        .treatment-billing-sno {
          padding: 0.75rem 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          text-align: center;
        }

        .treatment-billing-desc {
          padding: 0.75rem 0.75rem;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .treatment-billing-multiplier {
          padding: 0.75rem 0.5rem;
          text-align: center;
        }

        .treatment-billing-fixed {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .treatment-multiplier-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }

        .treatment-input-sm {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.4rem 0.5rem;
          font-size: 0.825rem;
          color: var(--text-primary);
          -webkit-text-fill-color: var(--text-primary);
          outline: none;
          font-weight: 600;
          color-scheme: dark;
          -webkit-user-select: text;
          user-select: text;
          text-align: center;
        }
        .treatment-input-sm:focus {
          border-color: var(--primary);
        }

        .treatment-multiplier-unit {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .treatment-billing-amount {
          padding: 0.5rem 0.75rem;
          text-align: right;
        }

        .treatment-amount-input {
          width: 150px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          text-align: right;
          outline: none;
          font-weight: 600;
          color: var(--text-primary);
          -webkit-text-fill-color: var(--text-primary);
          color-scheme: dark;
          -webkit-user-select: text;
          user-select: text;
          -webkit-appearance: none;
          -moz-appearance: textfield;
          appearance: none;
          touch-action: manipulation;
        }
        .treatment-amount-input::-webkit-outer-spin-button,
        .treatment-amount-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .treatment-amount-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-light);
        }
        @media (max-width: 768px) {
          .treatment-amount-input {
            width: 125px;
            font-size: 16px !important;
          }
        }

        .treatment-calc-amount {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary);
          font-family: monospace;
        }

        .treatment-total-banner {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(19, 28, 46, 0.9) 100%);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 12px;
          padding: 1.25rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          color: var(--text-primary);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .treatment-total-label {
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.04em;
          display: block;
          color: var(--text-primary);
        }

        .treatment-total-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .treatment-total-sum {
          font-weight: 900;
          font-size: 1.65rem;
          letter-spacing: -0.02em;
          color: #38bdf8;
          font-family: monospace;
        }

        .treatment-signatures-section {
          border-top: 2px solid var(--border-color);
          padding-top: 2rem;
          margin-bottom: 2rem;
        }

        .treatment-signatures-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .treatment-signatures-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .treatment-sig-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .treatment-sig-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .treatment-sig-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
        }

        .treatment-sig-toggle-box {
          display: flex;
          gap: 0.25rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 2px;
        }

        .treatment-sig-toggle-btn {
          border: none;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
        }
        .treatment-sig-toggle-btn.active {
          background-color: var(--primary);
          color: #ffffff;
        }
        .treatment-sig-toggle-btn.inactive {
          background-color: transparent;
          color: var(--text-muted);
        }

        .treatment-sig-input {
          width: 100%;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.45rem 0.65rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          -webkit-text-fill-color: var(--text-primary);
          margin-bottom: 0.75rem;
          outline: none;
          color-scheme: dark;
          -webkit-user-select: text;
          user-select: text;
        }
        .treatment-sig-input:focus {
          border-color: var(--primary);
        }

        .treatment-sig-display-box {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          text-align: center;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .treatment-sig-draw-trigger {
          cursor: pointer;
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          text-align: center;
          background-color: var(--bg-secondary);
          margin-bottom: 0.75rem;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .treatment-sig-draw-trigger:hover {
          border-color: var(--primary);
          background-color: var(--primary-lightest);
        }

        .treatment-sig-upload-box {
          cursor: pointer;
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 0.65rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--bg-secondary);
          transition: border-color 0.2s ease;
        }
        .treatment-sig-upload-box:hover {
          border-color: var(--primary);
        }

        .treatment-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .treatment-btn-print {
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .treatment-btn-print:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .treatment-btn-submit {
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 0.65rem 1.75rem;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .treatment-btn-submit:hover:not(:disabled) {
          filter: brightness(1.1);
        }

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
