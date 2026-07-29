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
    }
  ) => Promise<{ success: boolean; message: string }>;
  updateReferralStatus: (
    referralId: string,
    status: ReferralStatus,
    notes?: { adminNotes?: string; moreInfoNotes?: string }
  ) => Promise<{ success: boolean; message: string }>;
  acceptReferral: (referralId: string) => Promise<{ success: boolean; message: string }>;
  completeTreatment: (
    referralId: string,
    report: Omit<TreatmentReport, 'id' | 'completedAt'>
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

// Helper to recursively strip undefined values for Firestore compatibility
const cleanFirestoreData = (val: any): any => {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val)) return val.map(cleanFirestoreData);
  if (typeof val === 'object') {
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
    }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'RETIRED_STAFF') {
      return { success: false, message: 'Only retired staff can request referrals.' };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const newReferral: ReferralRequest = {
      id: `ref-${100 + referrals.length + 1}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      pensionId: currentUser.pensionId,
      hospitalId,
      hospitalName,
      diagnosisDescription,
      urgencyLevel,
      attachments,
      status: 'PENDING_ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cbnFields
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
      completedAt: new Date().toISOString()
    };

    const updatedRef = {
      ...refObj,
      status: 'TREATMENT_COMPLETED' as ReferralStatus,
      treatmentReport: finalReport,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'referrals', referralId), cleanFirestoreData(updatedRef));

      // Notify Staff
      await addNotification(
        refObj.staffId,
        'Treatment Completed',
        `${refObj.hospitalName} has completed your treatment and uploaded the medical report.`,
        refObj.id
      );
      // Notify Admin
      await addNotification(
        'usr-admin',
        'Treatment Completed & Report Uploaded',
        `${refObj.hospitalName} has completed treatment for ${refObj.staffName}.`,
        refObj.id
      );

      const refDetailsName = refObj.patientName || refObj.staffName;
      logActivity('COMPLETE_TREATMENT', `Submitted discharge report, final billing invoice, and marked treatment completed for referral ${referralId} (Patient: ${refDetailsName}).`);

      return { success: true, message: 'Treatment completed successfully. Report submitted.' };
    } catch (e) {
      console.error("Error completing treatment in Firestore:", e);
      return { success: false, message: 'Failed to submit treatment report.' };
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
    if (currentUser.role === 'RETIRED_STAFF') {
      return referrals.filter(r => r.staffId === currentUser.id);
    }
    if (currentUser.role === 'HOSPITAL') {
      return referrals.filter(
        r => r.status === 'APPROVED_FORWARDED' ||
             r.status === 'ACCEPTED' ||
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
        acceptReferral,
        completeTreatment,
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
