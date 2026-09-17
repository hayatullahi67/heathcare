export type UserRole = 'SUPER_ADMIN' | 'RETIRED_STAFF' | 'STAFF' | 'HOSPITAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pensionId?: string; // For Retired Staff
  staffIdNumber?: string; // For Active Staff
  department?: string; // For Retired Staff / Active Staff
  hospitalId?: string; // For Hospital users
}

export type ReferralStatus =
  | 'PENDING_ADMIN'
  | 'INFO_REQUESTED'
  | 'REJECTED'
  | 'APPROVED_FORWARDED'
  | 'ACCEPTED'
  | 'BILL_SUBMITTED'
  | 'BILL_REJECTED'
  | 'TREATMENT_COMPLETED';

export interface MockFile {
  name: string;
  size: string;
  type: string;
  dataUrl?: string; // Base64 simulated content
}

export interface TreatmentReport {
  id: string;
  diagnosisConfirmed: string;
  treatmentProvided: string;
  physicianName: string;
  reportFile?: MockFile;
  completedAt: string;

  // Form Section C Details
  hospitalClinicName?: string;
  careType?: 'OPD' | 'IN_PATIENT';
  invoiceNo?: string;
  timeReported?: string;
  dateOfAdmission?: string;
  attendingDoctor?: string;
  telOffice?: string;
  telResident?: string;
  
  clinicalInvestigation?: string;
  clinicalMedications?: string;
  
  // Doctor Signatures
  doctorSignature?: string;
  doctorSignatureImage?: string; // Drawn or Uploaded Base64 Data URL
  doctorSignDate?: string;

  // Branch Controller Signatures
  branchControllerSignatureImage?: string; // Uploaded Base64 Data URL
  branchControllerSignName?: string;
  branchControllerSignDate?: string;

  // Branch Support Signatures
  branchSupportSignatureImage?: string; // Uploaded Base64 Data URL
  branchSupportSignName?: string;
  branchSupportSignDate?: string;
  
  // Form Section D Billing
  billingRegistration?: number;
  billingConsultation?: number;
  billingBeddingDays?: number;
  billingBeddingRate?: number;
  billingBeddingAmount?: number;
  billingFeedingDays?: number;
  billingFeedingRate?: number;
  billingFeedingAmount?: number;
  billingDrugs?: number;
  billingSurgical?: number;
  billingAnesthesia?: number;
  billingTheater?: number;
  billingLabs?: number;
  billingScans?: number;
  billingBloodPints?: number;
  billingBloodRate?: number;
  billingBloodAmount?: number;
  billingInfusionPints?: number;
  billingInfusionRate?: number;
  billingInfusionAmount?: number;
  billingPhysiotherapy?: number;
  billingNeonatal?: number;
  billingMiscellaneous?: number;
  billingTotal?: number;
  
  // Form Section D Patient/Retiree Confirmation
  confirmedByPatientName?: string;
  patientSignature?: string;
  patientSignatureImage?: string; // Drawn or Uploaded Base64 Data URL
  patientSignDate?: string;

  // Beneficiary Bill Review & Dispute Lifecycle
  billStatus?: 'PENDING_BENEFICIARY' | 'APPROVED' | 'REJECTED';
  billRejectionReason?: string;
  billRejectedAt?: string;
  billApprovedAt?: string;
  billResubmittedAt?: string;
}


export interface ReferralRequest {
  id: string;
  staffId: string;
  staffName: string;
  requesterRole?: UserRole; // 'RETIRED_STAFF' | 'STAFF'
  pensionId?: string; // For Retired Staff
  staffIdNumber?: string; // For Active Staff
  patientId?: string; // ID inputted for the patient
  hospitalId: string; // Target hospital ID
  hospitalName: string;
  diagnosisDescription: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  attachments: MockFile[];
  status: ReferralStatus;
  adminNotes?: string;
  moreInfoRequestedNotes?: string;
  isResubmitted?: boolean;
  resubmittedAt?: string;
  staffResponseNotes?: string;
  treatmentReport?: TreatmentReport;
  createdAt: string;
  updatedAt: string;
  
  // Central Bank of Nigeria (CBN) Specific Form Metadata
  patientName?: string;
  patientRelationship?: string;
  patientAge?: number;
  patientSex?: 'Male' | 'Female';
  statusAtExit?: string;
  telephoneNumber?: string;
  departmentAtExit?: string;
  branchCenter?: string;
  residentialAddress?: string;
  isSigned?: boolean;

  // Hospital Actions & Clinical Logs Extensions
  progressNotes?: {
    id: string;
    note: string;
    loggedBy: string;
    createdAt: string;
  }[];
  declineReason?: string;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
}

export interface ReferralIdInfo {
  isStaff: boolean;
  idLabel: string;
  idValue: string;
  roleLabel: string;
  deptLabel: string;
  statusLabel: string;
  branchLabel: string;
}

export const getReferralIdInfo = (ref?: Partial<ReferralRequest> | null): ReferralIdInfo => {
  if (!ref) {
    return {
      isStaff: false,
      idLabel: 'Pension ID',
      idValue: 'N/A',
      roleLabel: 'Retiree / Pensioner',
      deptLabel: 'Prior Department',
      statusLabel: 'Status at Exit',
      branchLabel: 'Branch Center'
    };
  }

  // Determine if requester is active staff
  const isStaff = ref.requesterRole === 'STAFF' || Boolean(ref.staffIdNumber && !ref.pensionId);
  const idValue = isStaff 
    ? (ref.staffIdNumber || ref.patientId || ref.pensionId || 'N/A')
    : (ref.pensionId || ref.patientId || ref.staffIdNumber || 'N/A');

  return {
    isStaff,
    idLabel: isStaff ? 'Staff ID' : 'Pension ID',
    idValue,
    roleLabel: isStaff ? 'Staff Member' : 'Retiree / Pensioner',
    deptLabel: isStaff ? 'Department' : 'Prior Department',
    statusLabel: isStaff ? 'Designation / Grade Level' : 'Status at Exit',
    branchLabel: isStaff ? 'Branch' : 'Branch Center'
  };
};

export interface AppNotification {
  id: string;
  userId: string; // Recipient user ID
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referralId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  contactNumber: string;
  email: string;
}

export interface SystemActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

