import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReferralRequest, AppNotification, ReferralStatus, TreatmentReport, MockFile, SystemActivityLog } from '../types';
import { useAuth } from './AuthContext';
import { collection, onSnapshot, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

interface ReferralContextType {
  referrals: ReferralRequest[];
  notifications: AppNotification[];
  createReferral: (
    hospitalId: string,
    hospitalName: string,
    diagnosisDescription: string,
    urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY',
    attachments: MockFile[],
    cbnFields?: {
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
      patientId?: string;
      pensionId?: string;
      staffIdNumber?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  updateReferralStatus: (
    referralId: string,
    status: ReferralStatus,
    notes?: { adminNotes?: string; moreInfoNotes?: string }
  ) => Promise<{ success: boolean; message: string }>;
  resubmitReferral: (
    referralId: string,
    updatedData: {
      diagnosisDescription?: string;
      telephoneNumber?: string;
      residentialAddress?: string;
      departmentAtExit?: string;
      statusAtExit?: string;
      attachments?: MockFile[];
      staffResponseNotes: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  acceptReferral: (referralId: string) => Promise<{ success: boolean; message: string }>;
  completeTreatment: (
    referralId: string,
    report: Omit<TreatmentReport, 'id' | 'completedAt'>
  ) => Promise<{ success: boolean; message: string }>;
  approveMedicalBill: (
    referralId: string,
    options?: { patientSignatureImage?: string; confirmedName?: string }
  ) => Promise<{ success: boolean; message: string }>;
  rejectMedicalBill: (
    referralId: string,
    rejectionReason: string
  ) => Promise<{ success: boolean; message: string }>;
  resubmitMedicalBill: (
    referralId: string,
    updatedReport: Partial<TreatmentReport>
  ) => Promise<{ success: boolean; message: string }>;
  declineReferral: (referralId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  addProgressNote: (referralId: string, note: string, loggedBy: string) => Promise<{ success: boolean; message: string }>;
  updateVitals: (
    referralId: string,
    vitals: { bloodPressure?: string; pulseRate?: number; temperature?: number; oxygenSaturation?: number }
  ) => Promise<{ success: boolean; message: string }>;
  markNotificationAsRead: (notifId: string) => void;
  clearNotifications: () => void;
  getReferralsForUser: () => ReferralRequest[];
  getNotificationsForUser: () => AppNotification[];
  activityLogs: SystemActivityLog[];
  logActivity: (action: string, details: string, customUser?: { id: string; name: string; role: any }) => void;
}

// Helper to recursively strip undefined values and non-POJO entities for Firestore compatibility
const cleanFirestoreData = (val: any): any => {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val)) return val.map(cleanFirestoreData);
  if (typeof val === 'object') {
    // If it's a browser File or Blob instance, convert to plain metadata object
    if (typeof File !== 'undefined' && val instanceof File) {
      return { name: val.name, size: `${(val.size / (1024 * 1024)).toFixed(1)} MB`, type: val.type };
    }
    if (typeof Blob !== 'undefined' && val instanceof Blob) {
      return { size: val.size, type: val.type };
    }
    const cleaned: any = {};
    Object.entries(val).forEach(([k, v]) => {
      if (v !== undefined) {
        cleaned[k] = cleanFirestoreData(v);
      }
    });
    return cleaned;
  }
  return val;
};

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState<ReferralRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);

  // Firestore Bindings for real-time referrals list syncing
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'referrals'), (snapshot) => {
      const list: ReferralRequest[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as ReferralRequest);
      });
      // Sort newest created first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReferrals(list);
    }, (error) => {
      console.error("Firestore database referrals sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Bindings for real-time notifications list syncing
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as AppNotification);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(list);
    }, (error) => {
      console.error("Firestore database notifications sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Bindings for real-time system activity logs syncing
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'activityLogs'), (snapshot) => {
      const list: SystemActivityLog[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as SystemActivityLog);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(list);
    }, (error) => {
      console.error("Firestore database activity logs sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  const logActivity = async (action: string, details: string, customUser?: { id: string; name: string; role: any }) => {
    const activeUser = customUser || currentUser;
    const newLog: SystemActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: activeUser?.id || 'guest',
      userName: activeUser?.name || 'Guest/Anonymous',
      userRole: activeUser?.role || ('RETIRED_STAFF' as any),
      action,
      details,
      ipAddress: '192.168.10.' + Math.floor(Math.random() * 254 + 1)
    };
    try {
      await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
    } catch (e) {
      console.error("Error writing activity log to Firestore:", e);
    }
  };

  const addNotification = async (userId: string, title: string, message: string, referralId?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      referralId
    };
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (e) {
      console.error("Error writing notification to Firestore:", e);
    }
  };

  const createReferral = async (
    hospitalId: string,
    hospitalName: string,
    diagnosisDescription: string,
    urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY',
    attachments: MockFile[],
    cbnFields?: {
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
      patientId?: string;
      pensionId?: string;
      staffIdNumber?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !['RETIRED_STAFF', 'STAFF'].includes(currentUser.role)) {
      return { success: false, message: 'Only staff accounts can request referrals.' };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const isStaff = currentUser.role === 'STAFF';
    const finalPatientId = cbnFields?.patientId?.trim() || '';

    // For Retired Staff: prioritize inputted pensionId or patientId, fallback to currentUser.pensionId
    const finalPensionId = !isStaff
      ? (cbnFields?.pensionId?.trim() || finalPatientId || currentUser.pensionId || '')
      : undefined;

    // For Active Staff: prioritize inputted staffIdNumber or patientId, fallback to currentUser.staffIdNumber or currentUser.pensionId
    const finalStaffIdNumber = isStaff
      ? (cbnFields?.staffIdNumber?.trim() || finalPatientId || currentUser.staffIdNumber || currentUser.pensionId || '')
      : undefined;

    const newReferral: ReferralRequest = {
      id: `ref-${100 + referrals.length + 1}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      hospitalId,
      hospitalName,
      diagnosisDescription,
      urgencyLevel,
      attachments,
      status: 'PENDING_ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cbnFields,
      pensionId: finalPensionId,
      staffIdNumber: finalStaffIdNumber,
      patientId: finalPatientId || (isStaff ? finalStaffIdNumber : finalPensionId),
      requesterRole: currentUser.role
    };

    try {
      await setDoc(doc(db, 'referrals', newReferral.id), cleanFirestoreData(newReferral));

      // Notify Super Admin
      await addNotification(
        'usr-admin',
        'New Treatment Request',
        `${currentUser.name} has submitted a new referral request for ${hospitalName}.`,
        newReferral.id
      );

      logActivity(
        'SUBMIT_REFERRAL',
        `Submitted referral request ${newReferral.id} for patient ${newReferral.patientName || newReferral.staffName} to ${hospitalName}.`
      );

      return { success: true, message: 'Your medical request has been submitted successfully.' };
    } catch (e) {
      console.error("Error creating referral in Firestore:", e);
      return { success: false, message: 'Failed to write to database.' };
    }
  };

  const updateReferralStatus = async (
    referralId: string,
    status: ReferralStatus,
    notes?: { adminNotes?: string; moreInfoNotes?: string }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Permission denied. Admins only.' };
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const updatedRef = {
      ...refObj,
      status: status === 'APPROVED_FORWARDED' ? 'ACCEPTED' : status,
      updatedAt: new Date().toISOString()
    };

    if (notes?.adminNotes !== undefined) {
      updatedRef.adminNotes = notes.adminNotes;
    }
    if (notes?.moreInfoNotes !== undefined) {
      updatedRef.moreInfoRequestedNotes = notes.moreInfoNotes;
      updatedRef.isResubmitted = false;
    }

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Trigger notifications depending on new status
      if (status === 'APPROVED_FORWARDED') {
        // Notify staff
        await addNotification(
          refObj.staffId,
          'Referral Approved!',
          `Your request for ${refObj.hospitalName} was approved.`,
          refObj.id
        );
        // Notify hospital staff
        await addNotification(
          `usr-hosp-${refObj.hospitalId.split('-')[1]}`,
          'New Referral Received',
          `New patient referral received: ${refObj.staffName}.`,
          refObj.id
        );
      } else if (status === 'REJECTED') {
        await addNotification(
          refObj.staffId,
          'Referral Request Rejected',
          `Your request has been declined. Admin notes: ${notes?.adminNotes || 'No reason provided.'}`,
          refObj.id
        );
      } else if (status === 'INFO_REQUESTED') {
        await addNotification(
          refObj.staffId,
          'Clarification Needed',
          `Admin has requested more details regarding your request. Notes: ${notes?.moreInfoNotes}`,
          refObj.id
        );
      }

      const refDetailsName = refObj.patientName || refObj.staffName;
      const hospName = refObj.hospitalName;
      if (status === 'APPROVED_FORWARDED') {
        logActivity('APPROVE_REFERRAL', `Approved referral request ${referralId} for patient ${refDetailsName} and forwarded to ${hospName}.`);
      } else if (status === 'REJECTED') {
        logActivity('REJECT_REFERRAL', `Rejected referral request ${referralId} for patient ${refDetailsName}. Notes: ${notes?.adminNotes || 'None'}`);
      } else if (status === 'INFO_REQUESTED') {
        logActivity('REQUEST_MORE_INFO', `Requested more info on referral ${referralId} for patient ${refDetailsName}. Notes: ${notes?.moreInfoNotes}`);
      }

      return { success: true, message: 'Referral successfully updated.' };
    } catch (e) {
      console.error("Error updating status in Firestore:", e);
      return { success: false, message: 'Failed to update referral in database.' };
    }
  };

  const resubmitReferral = async (
    referralId: string,
    updatedData: {
      diagnosisDescription?: string;
      telephoneNumber?: string;
      residentialAddress?: string;
      departmentAtExit?: string;
      statusAtExit?: string;
      attachments?: MockFile[];
      staffResponseNotes: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Authentication required to resubmit referral.' };
    }

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const now = new Date().toISOString();
    const updatedRef: ReferralRequest = {
      ...refObj,
      status: 'PENDING_ADMIN',
      isResubmitted: true,
      resubmittedAt: now,
      updatedAt: now,
      staffResponseNotes: updatedData.staffResponseNotes,
      diagnosisDescription: updatedData.diagnosisDescription ?? refObj.diagnosisDescription,
      telephoneNumber: updatedData.telephoneNumber ?? refObj.telephoneNumber,
      residentialAddress: updatedData.residentialAddress ?? refObj.residentialAddress,
      departmentAtExit: updatedData.departmentAtExit ?? refObj.departmentAtExit,
      statusAtExit: updatedData.statusAtExit ?? refObj.statusAtExit,
      attachments: updatedData.attachments ?? refObj.attachments
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Super Admin
      await addNotification(
        'usr-admin',
        'Referral Request Resubmitted',
        `${currentUser.name} has provided updated information for referral ${refObj.id}.`,
        refObj.id
      );

      const patientName = refObj.patientName || refObj.staffName;
      logActivity(
        'RESUBMIT_REFERRAL',
        `Resubmitted referral ${referralId} for patient ${patientName} with updated information. Response: "${updatedData.staffResponseNotes}"`
      );

      return { success: true, message: 'Referral successfully resubmitted to Administrator.' };
    } catch (e) {
      console.error("Error resubmitting referral in Firestore:", e);
      return { success: false, message: 'Failed to resubmit referral in database.' };
    }
  };

  const acceptReferral = async (referralId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can accept referrals.' };
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const updatedRef = {
      ...refObj,
      status: 'ACCEPTED' as ReferralStatus,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Staff
      await addNotification(
        refObj.staffId,
        'Hospital Accepted Referral',
        `${refObj.hospitalName} has accepted your referral. They are preparing for your arrival.`,
        refObj.id
      );
      // Notify Admin
      await addNotification(
        'usr-admin',
        'Referral Accepted by Hospital',
        `${refObj.hospitalName} accepted the referral for ${refObj.staffName}.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('ACCEPT_REFERRAL', `Accepted referral request ${referralId} for patient ${refDetailsName} at ${currentUser.name}.`);

      return { success: true, message: 'Referral accepted. Status updated to in-progress.' };
    } catch (e) {
      console.error("Error accepting referral in Firestore:", e);
      return { success: false, message: 'Failed to accept referral.' };
    }
  };

  const completeTreatment = async (
    referralId: string,
    report: Omit<TreatmentReport, 'id' | 'completedAt'>
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can complete treatments.' };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const finalReport: TreatmentReport = {
      ...report,
      id: `rep-${Date.now()}`,
      completedAt: new Date().toISOString(),
      billStatus: 'PENDING_BENEFICIARY'
    };

    const updatedRef = {
      ...refObj,
      status: 'BILL_SUBMITTED' as ReferralStatus,
      treatmentReport: finalReport,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Staff
      await addNotification(
        refObj.staffId,
        'Medical Bill Ready for Review',
        `${refObj.hospitalName} has completed your clinical treatment and submitted a medical bill of ₦${(finalReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}. Please review and approve or reject.`,
        refObj.id
      );
      // Notify Admin
      await addNotification(
        'usr-admin',
        'Treatment Completed & Bill Submitted',
        `${refObj.hospitalName} completed treatment and submitted a medical bill (₦${(finalReport.billingTotal || 0).toLocaleString()}) for ${refObj.staffName}. Awaiting beneficiary review.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('COMPLETE_TREATMENT', `Submitted discharge report and medical bill (₦${(finalReport.billingTotal || 0).toLocaleString()}) for referral ${referralId} (Patient: ${refDetailsName}). Sent to beneficiary for review.`);

      return { success: true, message: 'Treatment report and medical bill submitted successfully. Sent to patient for review.' };
    } catch (e) {
      console.error("Error completing treatment in Firestore:", e);
      return { success: false, message: 'Failed to submit treatment report.' };
    }
  };

  const approveMedicalBill = async (
    referralId: string,
    options?: { patientSignatureImage?: string; confirmedName?: string }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Authentication required to approve medical bill.' };
    }

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj || !refObj.treatmentReport) {
      return { success: false, message: 'Referral or medical bill not found.' };
    }

    const now = new Date().toISOString();
    const updatedReport: TreatmentReport = {
      ...refObj.treatmentReport,
      billStatus: 'APPROVED',
      billApprovedAt: now,
      confirmedByPatientName: options?.confirmedName || refObj.treatmentReport.confirmedByPatientName || currentUser.name,
      patientSignature: 'Digitally Signed & Confirmed',
      patientSignatureImage: options?.patientSignatureImage || refObj.treatmentReport.patientSignatureImage,
      patientSignDate: now.split('T')[0]
    };

    const updatedRef: ReferralRequest = {
      ...refObj,
      status: 'TREATMENT_COMPLETED' as ReferralStatus,
      treatmentReport: updatedReport,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Hospital
      if (refObj.hospitalId) {
        await addNotification(
          refObj.hospitalId,
          'Medical Bill Approved by Beneficiary',
          `${currentUser.name} has reviewed and approved the medical bill for referral ${refObj.id}. Case marked completed.`,
          refObj.id
        );
      }

      // Notify Admin
      await addNotification(
        'usr-admin',
        'Medical Bill Approved by Beneficiary',
        `${currentUser.name} approved the medical bill from ${refObj.hospitalName} for referral ${refObj.id}.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('APPROVE_BILL', `Beneficiary ${currentUser.name} approved the medical bill (₦${(updatedReport.billingTotal || 0).toLocaleString()}) for referral ${referralId} (Patient: ${refDetailsName}).`);

      return { success: true, message: 'Medical bill approved successfully. Treatment is completed.' };
    } catch (e) {
      console.error("Error approving medical bill in Firestore:", e);
      return { success: false, message: 'Failed to approve medical bill.' };
    }
  };

  const rejectMedicalBill = async (
    referralId: string,
    rejectionReason: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Authentication required to reject medical bill.' };
    }

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj || !refObj.treatmentReport) {
      return { success: false, message: 'Referral or medical bill not found.' };
    }

    const now = new Date().toISOString();
    const updatedReport: TreatmentReport = {
      ...refObj.treatmentReport,
      billStatus: 'REJECTED',
      billRejectionReason: rejectionReason,
      billRejectedAt: now
    };

    const updatedRef: ReferralRequest = {
      ...refObj,
      status: 'BILL_REJECTED' as ReferralStatus,
      treatmentReport: updatedReport,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Hospital with reason
      if (refObj.hospitalId) {
        await addNotification(
          refObj.hospitalId,
          'Medical Bill Disputed / Rejected',
          `${currentUser.name} has disputed/rejected the medical bill for referral ${refObj.id}. Reason: "${rejectionReason}". Please edit and resend the bill.`,
          refObj.id
        );
      }

      // Notify Admin
      await addNotification(
        'usr-admin',
        'Medical Bill Disputed by Beneficiary',
        `${currentUser.name} has disputed the bill from ${refObj.hospitalName} for referral ${refObj.id}. Reason: "${rejectionReason}".`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('REJECT_BILL', `Beneficiary ${currentUser.name} disputed medical bill for referral ${referralId} (Patient: ${refDetailsName}). Reason: "${rejectionReason}"`);

      return { success: true, message: 'Medical bill dispute submitted to hospital for revision.' };
    } catch (e) {
      console.error("Error rejecting medical bill in Firestore:", e);
      return { success: false, message: 'Failed to reject medical bill.' };
    }
  };

  const resubmitMedicalBill = async (
    referralId: string,
    updatedReport: Partial<TreatmentReport>
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can revise and resubmit medical bills.' };
    }

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj || !refObj.treatmentReport) {
      return { success: false, message: 'Referral or previous report not found.' };
    }

    const now = new Date().toISOString();
    const finalReport: TreatmentReport = {
      ...refObj.treatmentReport,
      ...updatedReport,
      billStatus: 'PENDING_BENEFICIARY',
      billResubmittedAt: now
    };

    const updatedRef: ReferralRequest = {
      ...refObj,
      status: 'BILL_SUBMITTED' as ReferralStatus,
      treatmentReport: finalReport,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Staff
      await addNotification(
        refObj.staffId,
        'Revised Medical Bill Submitted',
        `${refObj.hospitalName} has revised and resubmitted your medical bill (₦${(finalReport.billingTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}). Please review and approve.`,
        refObj.id
      );

      // Notify Admin
      await addNotification(
        'usr-admin',
        'Hospital Resubmitted Revised Medical Bill',
        `${refObj.hospitalName} has revised the disputed bill for ${refObj.staffName}.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('RESUBMIT_BILL', `Hospital ${currentUser.name} revised and resubmitted medical bill for referral ${referralId} (Patient: ${refDetailsName}). Total: ₦${(finalReport.billingTotal || 0).toLocaleString()}`);

      return { success: true, message: 'Revised medical bill successfully resubmitted to beneficiary.' };
    } catch (e) {
      console.error("Error resubmitting medical bill in Firestore:", e);
      return { success: false, message: 'Failed to resubmit revised medical bill.' };
    }
  };

  const declineReferral = async (referralId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can decline referrals.' };
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const updatedRef = {
      ...refObj,
      status: 'PENDING_ADMIN' as ReferralStatus,
      declineReason: reason,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Admin
      await addNotification(
        'usr-admin',
        'Referral Declined by Hospital',
        `${refObj.hospitalName} has declined the referral for ${refObj.patientName || refObj.staffName}. Reason: ${reason}`,
        refObj.id
      );
      // Notify Staff/User
      await addNotification(
        refObj.staffId,
        'Referral Status Reset',
        `${refObj.hospitalName} is unable to accept your referral. It has been routed back to CareLink Admins.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('DECLINE_REFERRAL', `Declined referral request ${referralId} for patient ${refDetailsName} at ${currentUser.name}. Reason: ${reason}`);

      return { success: true, message: 'Referral declined and sent back to admin queue.' };
    } catch (e) {
      console.error("Error declining referral in Firestore:", e);
      return { success: false, message: 'Failed to decline referral.' };
    }
  };

  const addProgressNote = async (referralId: string, note: string, loggedBy: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can add clinical progress notes.' };
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const notes = refObj.progressNotes || [];
    const newNote = {
      id: `pnote-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      note,
      loggedBy,
      createdAt: new Date().toISOString()
    };

    const updatedRef = {
      ...refObj,
      progressNotes: [...notes, newNote],
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('ADD_PROGRESS_NOTE', `Added clinical progress note by ${loggedBy} to referral ${referralId} (Patient: ${refDetailsName}): "${note.substring(0, 60)}${note.length > 60 ? '...' : ''}"`);

      return { success: true, message: 'Progress note added successfully.' };
    } catch (e) {
      console.error("Error adding progress note to Firestore:", e);
      return { success: false, message: 'Failed to add progress note.' };
    }
  };

  const updateVitals = async (
    referralId: string,
    vitals: { bloodPressure?: string; pulseRate?: number; temperature?: number; oxygenSaturation?: number }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'HOSPITAL') {
      return { success: false, message: 'Only hospital users can update patient vitals.' };
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const refObj = referrals.find(r => r.id === referralId);
    if (!refObj) {
      return { success: false, message: 'Referral request not found.' };
    }

    const updatedRef = {
      ...refObj,
      vitals: {
        ...(refObj.vitals || {}),
        ...vitals
      },
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      const refDetailsName = refObj.patientName || refObj.staffName;
      const bp = vitals.bloodPressure ? `BP: ${vitals.bloodPressure}` : '';
      const pr = vitals.pulseRate ? `HR: ${vitals.pulseRate} bpm` : '';
      const temp = vitals.temperature ? `Temp: ${vitals.temperature}°C` : '';
      const ox = vitals.oxygenSaturation ? `SpO2: ${vitals.oxygenSaturation}%` : '';
      const vitalsStr = [bp, pr, temp, ox].filter(Boolean).join(', ');
      const vitalsStrOutput = vitalsStr ? `: ${vitalsStr}` : '';
      logActivity('UPDATE_VITALS', `Updated vitals for referral ${referralId} (Patient: ${refDetailsName})${vitalsStrOutput}`);

      return { success: true, message: 'Vitals updated successfully.' };
    } catch (e) {
      console.error("Error updating vitals in Firestore:", e);
      return { success: false, message: 'Failed to update vitals.' };
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;
    try {
      await setDoc(doc(db, 'notifications', notifId), { ...notif, isRead: true });
    } catch (e) {
      console.error("Error marking notification as read in Firestore:", e);
    }
  };

  const clearNotifications = async () => {
    if (!currentUser) return;
    try {
      const batch = writeBatch(db);
      let count = 0;
      notifications.forEach(n => {
        if (!n.isRead && (n.userId === currentUser.id || (currentUser.role === 'SUPER_ADMIN' && n.userId === 'usr-admin'))) {
          const docRef = doc(db, 'notifications', n.id);
          batch.set(docRef, { ...n, isRead: true });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
      }
    } catch (e) {
      console.error("Error clearing notifications in Firestore:", e);
    }
  };

  const getReferralsForUser = (): ReferralRequest[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'SUPER_ADMIN') return referrals;
    if (currentUser.role === 'RETIRED_STAFF' || currentUser.role === 'STAFF') {
      return referrals.filter(r => r.staffId === currentUser.id);
    }
    if (currentUser.role === 'HOSPITAL') {
      return referrals.filter(
        r => r.status === 'APPROVED_FORWARDED' ||
             r.status === 'ACCEPTED' ||
             r.status === 'BILL_SUBMITTED' ||
             r.status === 'BILL_REJECTED' ||
             r.status === 'TREATMENT_COMPLETED'
      );
    }
    return [];
  };

  const getNotificationsForUser = (): AppNotification[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'SUPER_ADMIN') {
      return notifications.filter(n => n.userId === 'usr-admin');
    }
    return notifications.filter(n => n.userId === currentUser.id);
  };

  return (
    <ReferralContext.Provider
      value={{
        referrals,
        notifications,
        createReferral,
        updateReferralStatus,
        resubmitReferral,
        acceptReferral,
        completeTreatment,
        approveMedicalBill,
        rejectMedicalBill,
        resubmitMedicalBill,
        declineReferral,
        addProgressNote,
        updateVitals,
        markNotificationAsRead,
        clearNotifications,
        getReferralsForUser,
        getNotificationsForUser,
        activityLogs,
        logActivity
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (!context) throw new Error('useReferral must be used within a ReferralProvider');
  return context;
};
