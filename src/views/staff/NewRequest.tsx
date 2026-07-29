import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReferral } from '../../context/ReferralContext';
import {
  CheckCircle2,
  ShieldAlert,
  Play,
  ArrowLeft,
  Building,
  User
} from 'lucide-react';

export const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, hospitalsList } = useAuth();
  const { createReferral } = useReferral();

  if (!currentUser) return null;

  // Form states
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalLocation, setHospitalLocation] = useState('');
  
  // CBN specific fields state
  const [patientRelationship, setPatientRelationship] = useState('Self');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientSex, setPatientSex] = useState<'Male' | 'Female'>('Male');
  const [retireeName, setRetireeName] = useState('');
  const [statusAtExit, setStatusAtExit] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [departmentAtExit, setDepartmentAtExit] = useState('');
  const [branchCenter] = useState('Lafia');
  const [residentialAddress, setResidentialAddress] = useState('');

  // Dynamic placeholders for fallback submission values
  const patientNamePlaceholder = patientRelationship === 'Self' ? (currentUser.name || '') : '';
  const patientIdPlaceholder = patientRelationship === 'Self' ? (currentUser.pensionId || '') : '';
  const departmentPlaceholder = currentUser.department || '';

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedHospital = hospitalsList.find(
    hospital => hospital.name.trim().toLowerCase() === hospitalName.trim().toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fall back to placeholders if state is empty
    const finalPatientName = patientName.trim() || patientNamePlaceholder;
    const finalPatientId = patientId.trim() || patientIdPlaceholder;
    const finalDepartmentAtExit = departmentAtExit.trim() || departmentPlaceholder;

    if (!hospitalName.trim()) {
      setError('Please enter the name of the hospital or clinic.');
      return;
    }
    if (!hospitalLocation.trim()) {
      setError('Please enter the location of the hospital or clinic.');
      return;
    }
    if (!finalPatientName) {
      setError('Please fill in Name of Patient.');
      return;
    }
    if (!finalPatientId) {
      setError('Please enter Patient ID / Pension ID No.');
      return;
    }
    if (!patientAge) {
      setError('Please enter Patient Age.');
      return;
    }
    if (!telephoneNumber) {
      setError('Please enter contact telephone number.');
      return;
    }
    setError(null);
    setLoading(true);

    const cbnFields = {
      patientName: finalPatientName,
      patientRelationship,
      patientAge: Number(patientAge),
      patientSex,
      statusAtExit,
      telephoneNumber,
      departmentAtExit: finalDepartmentAtExit,
      branchCenter,
      residentialAddress
    };

    // Construct description dynamically to satisfy system schemas
    const enteredHospitalName = hospitalName.trim();
    const referralHospitalId = selectedHospital?.id || `external-${Date.now()}`;
    const generatedDescription = `Official CBN Medical Referral Request for patient ${finalPatientName} (${patientRelationship}, Age: ${patientAge}, Sex: ${patientSex}). Beneficiary Branch Currency Center: ${branchCenter}. Status at Exit: ${statusAtExit || 'N/A'}, Department: ${finalDepartmentAtExit || 'N/A'}. Assigned Facility: ${enteredHospitalName} (Location: ${hospitalLocation.trim()}). Residential Address: ${residentialAddress || 'N/A'}.`;

    const res = await createReferral(
      referralHospitalId,
      enteredHospitalName,
      generatedDescription,
      'ROUTINE', // Default urgency
      [],        // No attachments
      cbnFields
    );
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/staff/overview');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      
      {/* Back button link */}
      <div>
        <button
          onClick={() => navigate('/staff/overview')}
          className="px-4 py-2 font-bold text-sm flex items-center gap-2 border border-border-color rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-primary transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </button>
      </div>

      {success ? (
        <div className="bg-bg-secondary border border-border-color rounded-xl p-6 sm:p-8 shadow-md flex flex-col items-center justify-center text-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="font-extrabold text-xl sm:text-2xl text-text-primary m-0">CBN Referral Form Submitted Securely</h2>
          <p className="text-text-muted text-sm max-w-sm m-0 leading-relaxed">
            Your Retiree Medical Referral Form has been filed. We are forwarding you back to the tracker overview tab...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Official CBN Branding Header */}
          <div className="bg-bg-secondary border border-border-color rounded-xl p-6 shadow-sm text-center flex flex-col gap-2">
            <h4 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-widest m-0">
              Central Bank of Nigeria • Lafia Branch
            </h4>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight m-0 uppercase">
              Retiree / Pensioner Medical Referral Form
            </h1>
            <p className="text-text-muted text-xs leading-relaxed max-w-2xl mx-auto m-0">
              Kindly complete the patient profile and medical facility details in Section (B) below. Sections (C) and (D) overleaf will be completed by the hospital partner upon discharge.
            </p>
          </div>

          {error && (
            <div className="bg-danger-bg border border-danger/10 text-danger p-4 rounded-xl flex items-center gap-3 text-sm shadow-sm font-semibold">
              <ShieldAlert size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields Card */}
          <div className="bg-bg-secondary border border-border-color rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
            
            {/* Part 1: Referral Destination */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-border-color pb-2 m-0 flex items-center gap-2">
                <Building size={16} className="text-primary" />
                <span>Referral Destination</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="hospital-name">
                    Name of Hospital / Clinic
                  </label>
                  <input
                    id="hospital-name"
                    type="text"
                    list="registered-hospitals"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder="Enter registered hospital name"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="registered-hospitals">
                    {hospitalsList.map(hospital => (
                      <option key={hospital.id} value={hospital.name} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="hospital-location">
                    Location of Hospital / Clinic
                  </label>
                  <input
                    id="hospital-location"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder="e.g. Plot 244 Central Area, Abuja"
                    value={hospitalLocation}
                    onChange={e => setHospitalLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Part 2: Demographics Section B */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-border-color pb-2 m-0 flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span>To be Completed by the Patient / Beneficiary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="relationship-select">Relationship to Retiree</label>
                  <select
                    id="relationship-select"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all cursor-pointer"
                    value={patientRelationship}
                    onChange={e => setPatientRelationship(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Self">Self (Retiree / Pensioner)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Dependent">Other Dependent</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="patient-name">Name of Patient</label>
                  <input
                    id="patient-name"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder={patientNamePlaceholder || "Full Name of Patient"}
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="pension-id">Patient ID No. / Pension ID</label>
                  <input
                    id="pension-id"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder={patientIdPlaceholder || "ID Number"}
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="patient-age">Patient Age</label>
                  <input
                    id="patient-age"
                    type="number"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder="Age (Years)"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={loading}
                    min={1}
                    max={120}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="patient-sex">Patient Sex</label>
                  <select
                    id="patient-sex"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all cursor-pointer"
                    value={patientSex}
                    onChange={e => setPatientSex(e.target.value as 'Male' | 'Female')}
                    disabled={loading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="retiree-name">Name of Retiree / Pensioner</label>
                  <input
                    id="retiree-name"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder={currentUser.name}
                    value={retireeName}
                    onChange={e => setRetireeName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="status-at-exit">Status / Grade Level at Exit</label>
                  <input
                    id="status-at-exit"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder="e.g. Principal Manager, GL-15"
                    value={statusAtExit}
                    onChange={e => setStatusAtExit(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="dept-at-exit">Department at Exit</label>
                  <input
                    id="dept-at-exit"
                    type="text"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder={departmentPlaceholder || "Department Name"}
                    value={departmentAtExit}
                    onChange={e => setDepartmentAtExit(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="tel-no">Contact Telephone No.</label>
                  <input
                    id="tel-no"
                    type="tel"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    placeholder="e.g. 080XXXXXXXX"
                    value={telephoneNumber}
                    onChange={e => setTelephoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-text-secondary" htmlFor="residential-address">Residential Address</label>
                  <textarea
                    id="residential-address"
                    className="bg-bg-primary text-text-primary border border-border-color rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full transition-all"
                    rows={3}
                    placeholder="Provide complete residential address details..."
                    value={residentialAddress}
                    onChange={e => setResidentialAddress(e.target.value)}
                    disabled={loading}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#005f73] hover:bg-[#005f73]/90 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all text-sm uppercase tracking-wider"
          >
            {loading ? 'Submitting CBN Referral Form...' : (
              <>
                <span>Submit Official Referral Request</span>
                <Play size={14} fill="white" />
              </>
            )}
          </button>
          
          <p className="text-[0.65rem] text-text-muted text-center m-0">
            Note: Duly completed referral forms must be authorized by CBN Super Admin review before treatment intake can commence.
          </p>
        </form>
      )}
    </div>
  );
};
