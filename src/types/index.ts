export type UserRole = 'SUPER_ADMIN' | 'RETIRED_STAFF' | 'HOSPITAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pensionId?: string; // For Retired Staff
  department?: string; // For Retired Staff
  hospitalId?: string; // For Hospital users
}

export type ReferralStatus =
  | 'PENDING_ADMIN'
  | 'INFO_REQUESTED'
  | 'REJECTED'
  | 'APPROVED_FORWARDED'
  | 'ACCEPTED'
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
  
  doctorSignature?: string;
  doctorSignDate?: string;
  
  // Form Section D Billing
  billingRegistration?: number;
  billingConsultation?: number;
  billingBeddingDays?: number;
  billingBeddingAmount?: number;
  billingFeedingDays?: number;
  billingFeedingAmount?: number;
  billingDrugs?: number;
  billingSurgical?: number;
  billingAnesthesia?: number;
  billingTheater?: number;
  billingLabs?: number;
  billingScans?: number;
  billingBloodPints?: number;
  billingBloodAmount?: number;
  billingInfusionPints?: number;
  billingInfusionAmount?: number;
  billingPhysiotherapy?: number;
  billingNeonatal?: number;
  billingMiscellaneous?: number;
  billingTotal?: number;
  
  // Form Section D Patient/Retiree Confirmation
  confirmedByPatientName?: string;
  patientSignature?: string;
  patientSignDate?: string;
}


export interface ReferralRequest {
  id: string;
  staffId: string;
  staffName: string;
  pensionId?: string;
  hospitalId: string; // Target hospital ID
  hospitalName: string;
  diagnosisDescription: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  attachments: MockFile[];
  status: ReferralStatus;
  adminNotes?: string;
  moreInfoRequestedNotes?: string;
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
