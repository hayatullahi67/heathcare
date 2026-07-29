import React from 'react';
import { useReferral } from '../../context/ReferralContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Building, CheckCircle, Clock } from 'lucide-react';

export const Overview: React.FC = () => {
  const { referrals, activityLogs } = useReferral();
  const { hospitalsList } = useAuth();

  const [logSearch, setLogSearch] = React.useState('');
  const [logFilter, setLogFilter] = React.useState('ALL');

  const filteredLogs = (activityLogs || []).filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase());

    if (logFilter === 'ALL') return matchesSearch;
    if (logFilter === 'USER_AUTH') return matchesSearch && (log.action === 'USER_LOGIN' || log.action === 'USER_LOGOUT');
    if (logFilter === 'REFERRAL') return matchesSearch && (log.action === 'SUBMIT_REFERRAL' || log.action === 'APPROVE_REFERRAL' || log.action === 'REJECT_REFERRAL' || log.action === 'REQUEST_MORE_INFO');
    if (logFilter === 'HOSPITAL_ACT') return matchesSearch && (log.action === 'ACCEPT_REFERRAL' || log.action === 'DECLINE_REFERRAL' || log.action === 'UPDATE_VITALS' || log.action === 'ADD_PROGRESS_NOTE' || log.action === 'COMPLETE_TREATMENT');
    if (logFilter === 'REGISTRATION') return matchesSearch && log.action === 'REGISTER_USER';
    return matchesSearch;
  });

  const pendingCount = referrals.filter(r => r.status === 'PENDING_ADMIN').length;
  const activeCount = referrals.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED_FORWARDED').length;
  const completedCount = referrals.filter(r => r.status === 'TREATMENT_COMPLETED').length;
  const hospitalCount = hospitalsList.length;



  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* Premium Dashboard Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary m-0 tracking-tight">Administrative Overview</h2>
        <p className="text-text-muted text-xs m-0 mt-1">Real-time status metrics, action queues, and system audit logs.</p>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pending */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-warning-bg text-warning flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Pending Review</p>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{pendingCount}</h3>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Active Referrals</p>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{activeCount}</h3>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Completed Cases</p>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{completedCount}</h3>
          </div>
        </div>

        {/* Card 4: Registered Hospitals */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-lg bg-bg-primary text-primary flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider m-0">Partner Clinics</p>
            <h3 className="text-2xl font-extrabold text-text-primary m-0 leading-none mt-1">{hospitalCount}</h3>
          </div>
        </div>
      </div>



      {/* System Audit Logs Section */}
      <div className="bg-bg-secondary border border-border-color rounded-xl p-5 shadow-sm flex flex-col gap-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-4">
          <div>
            <h3 className="font-bold text-xs text-text-primary flex items-center gap-2 m-0 uppercase tracking-wider">
              <ClipboardList size={18} className="text-[#0ea5e9]" />
              <span>Real-Time Audit Trail logs</span>
            </h3>
            <p className="text-text-muted text-xs m-0 mt-1">
              Audit trails monitoring logins, retirees' requests, clinic vitals, and registrations.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter select */}
            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border-color bg-bg-primary text-text-primary cursor-pointer font-semibold outline-none w-full sm:w-[180px]"
            >
              <option value="ALL">All Operations</option>
              <option value="USER_AUTH">User Sessions</option>
              <option value="REFERRAL">Referral Lifecycle</option>
              <option value="HOSPITAL_ACT">Clinical Care Logs</option>
              <option value="REGISTRATION">System Registration</option>
            </select>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border-color bg-bg-primary text-text-primary outline-none w-full sm:w-[220px]"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center p-6 text-text-muted text-sm border border-border-color rounded-lg bg-bg-secondary">No audit logs matching filters found.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden-mobile block w-full overflow-x-auto -webkit-overflow-scrolling-touch border border-border-color rounded-lg max-h-[350px]">
              <table className="w-full border-collapse m-0 min-w-[800px]">
                <thead className="sticky top-0 bg-bg-secondary z-1 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                  <tr className="border-b border-border-color text-text-muted text-xs">
                    <th className="text-left p-3 font-bold uppercase">Timestamp</th>
                    <th className="text-left p-3 font-bold uppercase">Operator</th>
                    <th className="text-left p-3 font-bold uppercase">Action</th>
                    <th className="text-left p-3 font-bold uppercase">Details</th>
                    <th className="text-left p-3 font-bold uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => {
                    let badgeColor = 'text-text-secondary bg-bg-primary border-border-color';
                    if (log.action === 'USER_LOGIN' || log.action === 'APPROVE_REFERRAL' || log.action === 'COMPLETE_TREATMENT') {
                      badgeColor = 'text-success bg-success-bg border-success/10';
                    } else if (log.action === 'REJECT_REFERRAL' || log.action === 'DECLINE_REFERRAL') {
                      badgeColor = 'text-danger bg-danger-bg border-danger/10';
                    } else if (log.action === 'REQUEST_MORE_INFO') {
                      badgeColor = 'text-warning bg-warning-bg border-warning/10';
                    } else if (log.action === 'REGISTER_USER' || log.action === 'SUBMIT_REFERRAL') {
                      badgeColor = 'text-[#0369a1] bg-[#e0f2fe] border-[#0369a1]/10';
                    } else if (log.action === 'ACCEPT_REFERRAL' || log.action === 'ADD_PROGRESS_NOTE' || log.action === 'UPDATE_VITALS') {
                      badgeColor = 'text-[#6d28d9] bg-[#f3e8ff] border-[#6d28d9]/10';
                    }

                    return (
                      <tr key={log.id} className="border-b border-border-color last:border-none hover:bg-bg-primary/30 transition-colors">
                        <td className="p-3 text-[0.825rem] text-text-secondary whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-[0.85rem] text-text-primary">{log.userName}</span>
                            <span className="text-[0.7rem] text-text-muted">
                              {log.userRole === 'SUPER_ADMIN' ? 'Administrator' : log.userRole === 'RETIRED_STAFF' ? 'Retired Staff' : 'Network Clinic'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap inline-block ${badgeColor}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-[0.85rem] text-text-secondary max-w-[400px] leading-relaxed break-words">
                          {log.details}
                        </td>
                        <td className="p-3 text-[0.8rem] font-mono text-text-secondary">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="visible-mobile flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredLogs.map(log => {
                let badgeColor = 'text-text-secondary bg-bg-primary border-border-color';
                if (log.action === 'USER_LOGIN' || log.action === 'APPROVE_REFERRAL' || log.action === 'COMPLETE_TREATMENT') {
                  badgeColor = 'text-success bg-success-bg border-success/10';
                } else if (log.action === 'REJECT_REFERRAL' || log.action === 'DECLINE_REFERRAL') {
                  badgeColor = 'text-danger bg-danger-bg border-danger/10';
                } else if (log.action === 'REQUEST_MORE_INFO') {
                  badgeColor = 'text-warning bg-warning-bg border-warning/10';
                } else if (log.action === 'REGISTER_USER' || log.action === 'SUBMIT_REFERRAL') {
                  badgeColor = 'text-[#0369a1] bg-[#e0f2fe] border-[#0369a1]/10';
                } else if (log.action === 'ACCEPT_REFERRAL' || log.action === 'ADD_PROGRESS_NOTE' || log.action === 'UPDATE_VITALS') {
                  badgeColor = 'text-[#6d28d9] bg-[#f3e8ff] border-[#6d28d9]/10';
                }

                return (
                  <div key={log.id} className="bg-bg-primary border border-border-color rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">{log.userName}</span>
                        <span className="text-[0.7rem] text-text-muted mt-0.5">
                          {log.userRole === 'SUPER_ADMIN' ? 'Administrator' : log.userRole === 'RETIRED_STAFF' ? 'Retired Staff' : 'Network Clinic'}
                        </span>
                      </div>
                      <span className="text-[0.7rem] text-text-muted font-medium">{new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-2 border-t border-border-color pt-2 mt-1">
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap inline-block ${badgeColor}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[0.7rem] font-mono text-text-secondary">{log.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <p className="text-xs text-text-secondary m-0 mt-1.5 break-words leading-relaxed">{log.details}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
