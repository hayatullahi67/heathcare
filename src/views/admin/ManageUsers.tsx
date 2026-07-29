import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useReferral } from '../../context/ReferralContext';
import { UserPlus, Building, Key, CheckCircle2, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const { registerStaff, registerHospital, users, hospitalsList } = useAuth();
  const { logActivity } = useReferral();

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatUserId = (id: string) => {
    const numericPart = id.replace(/[^0-9]/g, '');
    return `#USR-${numericPart.padStart(5, '0')}`;
  };

  const getAvatar = (name: string, role: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    let bg = 'linear-gradient(135deg, #0ea5e9, #2563eb)';
    if (role === 'SUPER_ADMIN') bg = 'linear-gradient(135deg, #ef4444, #b91c1c)';
    else if (role === 'HOSPITAL') bg = 'linear-gradient(135deg, #10b981, #047857)';
    else if (role === 'RETIRED_STAFF') bg = 'linear-gradient(135deg, #f59e0b, #d97706)';

    return (
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: bg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 700,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {initials}
      </div>
    );
  };

  const getHospitalName = (hospId?: string) => {
    if (!hospId) return 'N/A';
    const hosp = hospitalsList.find(h => h.id === hospId);
    return hosp ? hosp.name : 'Unknown Clinic';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.pensionId && user.pensionId.toLowerCase().includes(userSearch.toLowerCase()));

    if (userRoleFilter === 'ALL') return matchesSearch;
    return matchesSearch && user.role === userRoleFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Active form tab ('STAFF' or 'HOSPITAL')
  const [activeFormTab, setActiveFormTab] = useState<'STAFF' | 'HOSPITAL'>('STAFF');
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST');

  // Staff Form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [pensionId, setPensionId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Hospital Form state
  const [hospName, setHospName] = useState('');
  const [hospEmail, setHospEmail] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [showHospitalPassword, setShowHospitalPassword] = useState(false);

  // Status & Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    role: 'STAFF' | 'HOSPITAL';
    email: string;
    tempPass: string;
    msg: string;
  } | null>(null);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !pensionId || !staffPassword) {
      setError('Please fill in all staff details.');
      return;
    }
    if (staffPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setSuccessData(null);
    setLoading(true);
    const res = await registerStaff(staffName, staffEmail, pensionId, staffPassword);
    setLoading(false);

    if (res.success) {
      setSuccessData({
        role: 'STAFF',
        email: staffEmail.trim().toLowerCase(),
        tempPass: staffPassword,
        msg: res.message
      });
      logActivity('REGISTER_USER', `Registered new retired staff member: ${staffName} (${staffEmail.trim().toLowerCase()}).`);
      // Reset form
      setStaffName('');
      setStaffEmail('');
      setPensionId('');
      setStaffPassword('');
    } else {
      setError(res.message);
    }
  };

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospEmail || !location || !contact || !hospitalPassword) {
      setError('Please fill in all hospital details.');
      return;
    }
    if (hospitalPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setSuccessData(null);
    setLoading(true);
    const res = await registerHospital(hospName, hospEmail, location, contact, hospitalPassword);
    setLoading(false);

    if (res.success) {
      setSuccessData({
        role: 'HOSPITAL',
        email: hospEmail.trim().toLowerCase(),
        tempPass: hospitalPassword,
        msg: res.message
      });
      logActivity('REGISTER_USER', `Registered new network hospital partner: ${hospName} (${hospEmail.trim().toLowerCase()}).`);
      // Reset form
      setHospName('');
      setHospEmail('');
      setLocation('');
      setContact('');
      setHospitalPassword('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="manage-users flex flex-col gap-6 w-full animate-fade-in">
      {viewMode === 'LIST' ? (
        <>
          {/* Title & Register Header Row */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Registered Users Database</h2>
              <p className="text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Manage and audit system access for all clinical and administrative personnel.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              {/* Quick Search bar */}
              <input
                type="text"
                placeholder="Search users by name, email..."
                value={userSearch}
                onChange={e => {
                  setUserSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-control w-full sm:w-[250px]"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => {
                  setViewMode('CREATE');
                  setError(null);
                  setSuccessData(null);
                }}
                className="btn btn-primary w-full sm:w-auto whitespace-nowrap justify-center"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                <UserPlus size={16} />
                <span>Register New User</span>
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem', marginBottom: '0.5rem' }}>
            {/* Metric 1 */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Users</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {users.length.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ↑ +12% from last month
              </span>
            </div>

            {/* Metric 2 */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Super Admins</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={16} style={{ color: '#dc2626' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {users.filter(u => u.role === 'SUPER_ADMIN').length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Critical system access
              </span>
            </div>

            {/* Metric 3 */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Partners</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {users.filter(u => u.role === 'HOSPITAL').length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Hospital facility nodes
              </span>
            </div>

            {/* Metric 4 */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Retired Staff</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={16} style={{ color: '#475569' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {users.filter(u => u.role === 'RETIRED_STAFF').length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Restricted read-only
              </span>
            </div>
          </div>

          {/* Filters Bar & Users Table Wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Filters and Date Row */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderBottom: 'none', borderRadius: '12px 12px 0 0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Filter by Role select dropdown */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={userRoleFilter}
                    onChange={e => {
                      setUserRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="form-control"
                    style={{ padding: '0.5rem 1rem 0.5rem 2rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', appearance: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    <option value="ALL">Filter by Role</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="RETIRED_STAFF">Retired Staff</option>
                    <option value="HOSPITAL">Hospital Partner</option>
                  </select>
                  <div style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <UserPlus size={14} />
                  </div>
                </div>

                {/* Registration Date placeholder select */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    style={{ padding: '0.5rem 1rem 0.5rem 2rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', appearance: 'none', cursor: 'pointer', fontWeight: 500 }}
                    defaultValue="ALL"
                  >
                    <option value="ALL">Registration Date</option>
                    <option value="RECENT">Last 30 Days</option>
                    <option value="YEAR">This Year</option>
                  </select>
                  <div style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <Building size={14} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Displaying {filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: currentPage === 1 ? 'var(--bg-primary)' : 'var(--bg-secondary)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &lt;
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: currentPage >= totalPages ? 'var(--bg-primary)' : 'var(--bg-secondary)', color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden-mobile table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'var(--bg-secondary)', borderTop: 'none', borderBottom: 'none' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>User / Email</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>User ID</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>System Role</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Account Details</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Login Username</th>
                    <th style={{ textAlign: 'center', padding: '0.85rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map(user => {
                      let roleColor = '#64748b';
                      let roleBg = '#f1f5f9';
                      let roleLabel = user.role as string;
                      let dotColor = '#94a3b8';

                      if (user.role === 'SUPER_ADMIN') {
                        roleColor = '#b91c1c';
                        roleBg = '#fee2e2';
                        roleLabel = 'Super Admin';
                        dotColor = '#dc2626';
                      } else if (user.role === 'RETIRED_STAFF') {
                        roleColor = '#475569';
                        roleBg = '#f1f5f9';
                        roleLabel = 'Retired Staff';
                        dotColor = '#94a3b8';
                      } else if (user.role === 'HOSPITAL') {
                        roleColor = '#0f766e';
                        roleBg = '#ccfbf1';
                        roleLabel = 'Hospital Partner';
                        dotColor = '#0d9488';
                      }

                      return (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {getAvatar(user.name, user.role)}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            {formatUserId(user.id)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px', color: roleColor, backgroundColor: roleBg, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: dotColor, borderRadius: '1px' }}></span>
                              {roleLabel.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                            {user.role === 'RETIRED_STAFF' && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Pension ID: {user.pensionId}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prior Dept: {user.department}</span>
                              </div>
                            )}
                            {user.role === 'HOSPITAL' && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getHospitalName(user.hospitalId)}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facility ID: {user.hospitalId || 'CGH-202'}</span>
                              </div>
                            )}
                            {user.role === 'SUPER_ADMIN' && (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Chief Medical Informatics</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept ID: MD-206</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: user.role === 'SUPER_ADMIN' ? '#eff6ff' : user.role === 'HOSPITAL' ? '#f0fdfa' : '#f8fafc',
                              color: user.role === 'SUPER_ADMIN' ? '#2563eb' : user.role === 'HOSPITAL' ? '#0d9488' : '#64748b',
                              border: '1px solid currentColor',
                              borderWidth: '0.05rem',
                              opacity: 0.95
                            }}>
                              {user.email.split('@')[0]}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}>
                              ⋮
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="visible-mobile flex flex-col gap-3 p-4 bg-bg-secondary border border-border-color border-t-none">
              {paginatedUsers.length === 0 ? (
                <div className="text-center p-6 text-text-muted text-sm border border-border-color rounded-lg bg-bg-secondary">
                  No users found matching current filters.
                </div>
              ) : (
                paginatedUsers.map(user => {
                  let roleColor = '#64748b';
                  let roleBg = '#f1f5f9';
                  let roleLabel = user.role as string;
                  let dotColor = '#94a3b8';

                  if (user.role === 'SUPER_ADMIN') {
                    roleColor = '#b91c1c';
                    roleBg = '#fee2e2';
                    roleLabel = 'Super Admin';
                    dotColor = '#dc2626';
                  } else if (user.role === 'RETIRED_STAFF') {
                    roleColor = '#475569';
                    roleBg = '#f1f5f9';
                    roleLabel = 'Retired Staff';
                    dotColor = '#94a3b8';
                  } else if (user.role === 'HOSPITAL') {
                    roleColor = '#0f766e';
                    roleBg = '#ccfbf1';
                    roleLabel = 'Hospital Partner';
                    dotColor = '#0d9488';
                  }

                  return (
                    <div key={user.id} className="bg-bg-primary border border-border-color rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          {getAvatar(user.name, user.role)}
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-text-primary">{user.name}</span>
                            <span className="text-[0.7rem] text-text-secondary">{user.email}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', color: roleColor, backgroundColor: roleBg, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: dotColor, borderRadius: '50%' }}></span>
                          {roleLabel.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-border-color pt-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">User ID:</span>
                          <span className="font-mono text-text-secondary">{formatUserId(user.id)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Username:</span>
                          <span className="font-mono text-text-secondary">{user.email.split('@')[0]}</span>
                        </div>
                        {user.role === 'RETIRED_STAFF' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Pension ID:</span>
                              <span className="text-text-secondary font-semibold">{user.pensionId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Prior Dept:</span>
                              <span className="text-text-secondary font-semibold">{user.department}</span>
                            </div>
                          </>
                        )}
                        {user.role === 'HOSPITAL' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Facility:</span>
                              <span className="text-text-secondary font-semibold">{getHospitalName(user.hospitalId)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Facility ID:</span>
                              <span className="text-text-secondary font-semibold">{user.hospitalId || 'CGH-202'}</span>
                            </div>
                          </>
                        )}
                        {user.role === 'SUPER_ADMIN' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Role Title:</span>
                              <span className="text-text-secondary font-semibold">Chief Medical Informatics</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-text-muted">Dept ID:</span>
                              <span className="text-text-secondary font-semibold">MD-206</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Database Table Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderTop: 'none', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 12px 12px' }}>
              <div>
                <select
                  value={rowsPerPage}
                  onChange={e => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value={5}>5 rows per page</option>
                  <option value={10}>10 rows per page</option>
                  <option value={20}>20 rows per page</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isSelected = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Back Header navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setViewMode('LIST');
                setError(null);
                setSuccessData(null);
              }}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              ← Back to Database
            </button>
          </div>

          {/* Account Provisioning Card (rendered in-page) */}
          <div className="card w-full responsive-form-card" style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>

            {/* Form Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#005f73', color: '#ffffff', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>Account Provisioning</h3>
                  <p className="text-muted text-xs" style={{ margin: 0, marginTop: '0.15rem' }}>Issue new system credentials for medical personnel.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewMode('LIST');
                  setError(null);
                  setSuccessData(null);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Toggle Switcher */}
            <div className="modal-tab-container" style={{ margin: '0 0 1.5rem 0', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab('STAFF');
                  setError(null);
                  setSuccessData(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: activeFormTab === 'STAFF' ? '#ffffff' : 'transparent',
                  color: activeFormTab === 'STAFF' ? '#0f172a' : '#64748b',
                  boxShadow: activeFormTab === 'STAFF' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Retired Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab('HOSPITAL');
                  setError(null);
                  setSuccessData(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: activeFormTab === 'HOSPITAL' ? '#ffffff' : 'transparent',
                  color: activeFormTab === 'HOSPITAL' ? '#0f172a' : '#64748b',
                  boxShadow: activeFormTab === 'HOSPITAL' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Hospital Partner
              </button>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="alert-message error flex align-center gap-3" style={{ marginBottom: '1.25rem' }}>
                <ShieldAlert size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Success boxes */}
            {successData && (
              <div className="registration-success-card fade-in card flex flex-col gap-4" style={{ marginBottom: '1.25rem', border: '1px solid var(--success)', backgroundColor: 'var(--success-bg)', padding: '1rem', borderRadius: '8px' }}>
                <div className="flex align-center gap-3 text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={24} />
                  <h4 className="font-semibold text-md" style={{ margin: 0 }}>Registration Successful</h4>
                </div>
                <p className="text-sm" style={{ margin: 0 }}>{successData.msg}</p>
                <div className="credentials-box flex flex-col gap-2" style={{ marginTop: '0.5rem' }}>
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">Role</span>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {successData.role === 'STAFF' ? 'Retired Staff' : 'Hospital Portal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">Login Username</span>
                    <span className="font-mono font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{successData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">Temporary Password</span>
                    <span className="font-mono font-semibold text-sm flex align-center gap-1 text-primary-color" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Key size={14} />
                      {successData.tempPass}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted" style={{ margin: 0, marginTop: '0.5rem' }}>
                  Provide these credentials to the user. They can now log in securely using the portal.
                </p>
              </div>
            )}

            {/* Forms fields */}
            <div>
              {activeFormTab === 'STAFF' ? (
                <form onSubmit={handleStaffSubmit} className="user-form flex flex-col gap-4">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="staff-name">Full Name</label>
                      <input
                        id="staff-name"
                        type="text"
                        className="form-control"
                        placeholder="Dr. Julian Moore"
                        value={staffName}
                        onChange={e => setStaffName(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="staff-email">Email Address</label>
                      <input
                        id="staff-email"
                        type="email"
                        className="form-control"
                        placeholder="j.moore@hospital-network.org"
                        value={staffEmail}
                        onChange={e => setStaffEmail(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pension-id">Pension Reg. ID</label>
                      <input
                        id="pension-id"
                        type="text"
                        className="form-control"
                        placeholder="P-7728-102"
                        value={pensionId}
                        onChange={e => setPensionId(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="staff-password">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="staff-password"
                          type={showStaffPassword ? 'text' : 'password'}
                          minLength={6}
                          className="form-control"
                          placeholder="At least 6 characters"
                          value={staffPassword}
                          onChange={e => setStaffPassword(e.target.value)}
                          disabled={loading}
                          style={{ width: '100%', paddingRight: '2.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPassword(value => !value)}
                          aria-label={showStaffPassword ? 'Hide password' : 'Show password'}
                          style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                        >
                          {showStaffPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* alert verification info */}
                  <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--primary-lightest)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', marginTop: '1.25rem' }}>
                    <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'flex-start', marginTop: '0.1rem' }}>
                      <ShieldAlert size={16} />
                    </div>
                    {/* <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Registration will trigger an automated verification against the National Healthcare Staff Database (NHSD).
                    </p> */}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setViewMode('LIST');
                        setError(null);
                        setSuccessData(null);
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#005f73', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                      Register Staff
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleHospitalSubmit} className="user-form flex flex-col gap-4">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="hosp-name">Hospital Name</label>
                      <input
                        id="hosp-name"
                        type="text"
                        className="form-control"
                        placeholder="e.g. City General Hospital"
                        value={hospName}
                        onChange={e => setHospName(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="hosp-email">Authorized Contact Email</label>
                      <input
                        id="hosp-email"
                        type="email"
                        className="form-control"
                        placeholder="e.g. city@hospital.org"
                        value={hospEmail}
                        onChange={e => setHospEmail(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="hosp-location">Facility Address / Location</label>
                      <input
                        id="hosp-location"
                        type="text"
                        className="form-control"
                        placeholder="e.g. 100 Medical Plaza, Downtown"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="hosp-contact">Emergency Contact Number</label>
                      <input
                        id="hosp-contact"
                        type="text"
                        className="form-control"
                        placeholder="e.g. +1 (555) 019-2834"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="hospital-password">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="hospital-password"
                          type={showHospitalPassword ? 'text' : 'password'}
                          minLength={6}
                          className="form-control"
                          placeholder="At least 6 characters"
                          value={hospitalPassword}
                          onChange={e => setHospitalPassword(e.target.value)}
                          disabled={loading}
                          style={{ width: '100%', paddingRight: '2.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowHospitalPassword(value => !value)}
                          aria-label={showHospitalPassword ? 'Hide password' : 'Show password'}
                          style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                        >
                          {showHospitalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* alert verification info */}
                  <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--primary-lightest)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', marginTop: '1.25rem' }}>
                    <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'flex-start', marginTop: '0.1rem' }}>
                      <ShieldAlert size={16} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Registration will trigger an automated verification against the National Healthcare Staff Database (NHSD).
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setViewMode('LIST');
                        setError(null);
                        setSuccessData(null);
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#005f73', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                      Register Partner
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      <style>{`
        .form-toggle-bar {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          gap: 1.5rem;
        }

        .toggle-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: -2px;
        }

        .toggle-tab-btn:hover {
          color: var(--primary);
        }

        .toggle-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .alert-message {
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .alert-message.error {
          background-color: var(--danger-bg);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .registration-success-card {
          border: 1px solid var(--success);
          background-color: var(--success-bg);
        }

        .credentials-box {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .m-t-4 {
          margin-top: 1.5rem;
        }

        /* Modal UI Enhancements */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 1000;
          overflow-y: auto;
          padding: 2rem 1rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        .modal-content {
          background-color: var(--bg-secondary) !important;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 95%;
          max-width: 600px;
          margin: auto;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 0 0.5rem 0;
          margin-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .modal-close-btn:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .toggle-tab-btn {
          outline: none !important;
        }

        @media (max-width: 991px) {
          .manage-users > div:first-child {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .manage-users > div:first-child > div:last-child {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .manage-users > div:first-child > div:last-child input {
            width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          .responsive-form-card {
            padding: 1.25rem !important;
          }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
