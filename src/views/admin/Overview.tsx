import React from 'react';
import { useReferral } from '../../context/ReferralContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Building, CheckCircle, Clock, Search, X } from 'lucide-react';

export const Overview: React.FC = () => {
  const { referrals, activityLogs } = useReferral();
  const { hospitalsList } = useAuth();

  const [logSearch, setLogSearch] = React.useState('');

  const filteredLogs = (activityLogs || []).filter(log => {
    return (
      log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase())
    );
  });

  const pendingCount = referrals.filter(r => r.status === 'PENDING_ADMIN').length;
  const activeCount = referrals.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED_FORWARDED').length;
  const completedCount = referrals.filter(r => r.status === 'TREATMENT_COMPLETED').length;
  const hospitalCount = hospitalsList.length;
  const hasLogFilters = Boolean(logSearch);
  const clearLogFilters = () => setLogSearch('');



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
      <section className="overflow-hidden rounded-xl border border-border-color bg-bg-secondary shadow-sm">
        <div className="admin-log-toolbar border-b border-border-color bg-bg-primary/40 px-5 py-3">
          <label className="admin-log-search rounded-lg border border-border-color bg-bg-secondary px-3 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-light"><Search size={14} className="shrink-0 text-text-muted" /><input type="text" placeholder="Search records" value={logSearch} onChange={e => setLogSearch(e.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted" />{logSearch && <button onClick={() => setLogSearch('')} aria-label="Clear activity log search" className="text-text-muted hover:text-text-primary"><X size={14} /></button>}</label>
          <div className="admin-log-count"><span className="whitespace-nowrap text-xs font-bold text-text-muted">{filteredLogs.length} record{filteredLogs.length === 1 ? '' : 's'}</span>{hasLogFilters && <button onClick={clearLogFilters} className="rounded-lg px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary-light">Clear</button>}</div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center"><div className="rounded-xl bg-bg-primary p-3 text-text-muted"><ClipboardList size={20} /></div><p className="mt-3 text-sm font-bold text-text-primary">{hasLogFilters ? 'No matching activity' : 'No activity recorded yet'}</p><p className="mt-1 text-xs text-text-muted">{hasLogFilters ? 'Adjust or clear the current filters to see more records.' : 'System events will appear here as they occur.'}</p>{hasLogFilters && <button onClick={clearLogFilters} className="mt-3 text-xs font-bold text-primary hover:text-primary-hover">Clear filters</button>}</div>
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
      </section>

    </div>
  );
};
