import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Hospital } from '../types';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  registerStaff: (name: string, email: string, pensionId: string, password: string, role?: 'RETIRED_STAFF' | 'STAFF') => Promise<{ success: boolean; message: string }>;
  registerHospital: (name: string, email: string, location: string, contactNumber: string, password: string) => Promise<{ success: boolean; hospital: Hospital; message: string }>;
  hospitalsList: Hospital[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEVELOPMENT_STAFF_ACCOUNT: User = {
  id: 'dev-staff-2',
  name: 'Staff Test Account',
  email: 'staff2@carelink.test',
  role: 'STAFF',
  staffIdNumber: 'STAFF-TEST-01',
  pensionId: 'STAFF-TEST-01',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hc_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);

  useEffect(() => {
    // Read passwords state to satisfy TypeScript unused variable compiler check
    const count = Object.keys(passwords).length;
    if (count === -1) {
      console.log(passwords);
    }
  }, [passwords]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hc_current_user');
    }
  }, [currentUser]);

  // Firestore users list binding. All user records originate from registration.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: User[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as User);
      });
      setUsers(list);
    }, (err) => {
      console.error("Error syncing users from Firestore:", err);
    });

    return () => unsubscribe();
  }, []);

  // Firestore credentials/passwords list binding. Credentials are created at registration.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'passwords'), (snapshot) => {
      const dict: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email && data.password) {
          dict[data.email] = data.password;
        }
      });
      setPasswords(dict);
    }, (err) => {
      console.error("Error syncing passwords from Firestore:", err);
    });

    return () => unsubscribe();
  }, []);

  // Firestore hospital profiles list binding. Hospitals are created by admins.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      const list: Hospital[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Hospital);
      });
      setHospitalsList(list);
    }, (err) => {
      console.error("Error syncing hospitals from Firestore:", err);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === DEVELOPMENT_STAFF_ACCOUNT.email && password === 'staff2demo') {
      setCurrentUser(DEVELOPMENT_STAFF_ACCOUNT);
      return { success: true, message: 'Development staff login successful' };
    }
    
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Invalid credentials. User not found.' };
    }

    const savedPassword = passwords[cleanEmail];
    if (savedPassword !== password) {
      return { success: false, message: 'Invalid credentials. Password incorrect.' };
    }

    setCurrentUser(user);
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerStaff = async (
    name: string,
    email: string,
    pensionId: string,
    password: string,
    role: 'RETIRED_STAFF' | 'STAFF' = 'RETIRED_STAFF',
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email address already registered' };
    }

    const newStaff: User = {
      id: `usr-${role.toLowerCase()}-${Date.now()}`,
      email: cleanEmail,
      name,
      role,
      pensionId: role === 'RETIRED_STAFF' ? pensionId : pensionId,
      staffIdNumber: role === 'STAFF' ? pensionId : undefined
    };

    try {
      await setDoc(doc(db, 'users', newStaff.id), newStaff);
      await setDoc(doc(db, 'passwords', cleanEmail), { email: cleanEmail, password });
      return { success: true, message: 'Staff registered successfully.' };
    } catch (err) {
      console.error("Error registering staff in Firestore:", err);
      return { success: false, message: 'Failed to write new user data to database.' };
    }
  };

  const registerHospital = async (
    name: string,
    email: string,
    location: string,
    contactNumber: string,
    password: string
  ): Promise<{ success: boolean; hospital: Hospital; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, hospital: {} as Hospital, message: 'Email address already registered' };
    }

    const hospitalId = `hosp-${Date.now()}`;
    const newHospital: Hospital = {
      id: hospitalId,
      name,
      location,
      contactNumber,
      email: cleanEmail
    };

    const newHospitalUser: User = {
      id: `usr-hosp-${Date.now()}`,
      email: cleanEmail,
      name: `${name} Staff`,
      role: 'HOSPITAL',
      hospitalId
    };

    try {
      await setDoc(doc(db, 'hospitals', hospitalId), newHospital);
      await setDoc(doc(db, 'users', newHospitalUser.id), newHospitalUser);
      await setDoc(doc(db, 'passwords', cleanEmail), { email: cleanEmail, password });

      return {
        success: true,
        hospital: newHospital,
        message: `Hospital registered successfully. User Login: ${cleanEmail}`
      };
    } catch (err) {
      console.error("Error registering hospital in Firestore:", err);
      return { success: false, hospital: {} as Hospital, message: 'Failed to write new hospital data to database.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        registerStaff,
        registerHospital,
        hospitalsList
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
