import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Inbox } from 'lucide-react';
import { useReferral } from '../../context/ReferralContext';
import type { ReferralRequest } from '../../types';

const nameOf = (referral: ReferralRequest) => referral.patientName || referral.staffName || 'Unnamed patient';
const dateOf = (date: string) => new Date(date).toLocaleDateString([], { day: 'numeric', month: 'short' });

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { getReferralsForUser } = useReferral();
  const referrals = getReferralsForUser();
  const awaiting = referrals.filter(referral => referral.status === 'ACCEPTED');
  const completed = referrals.filter(referral => referral.status === 'TREATMENT_COMPLETED');
  const history = [...referrals].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 animate-fade-in">
    <section className="hospital-overview-metrics" aria-label="Clinical workload summary"><Metric label="Awaiting care" value={awaiting.length} helper="Accepted referrals" icon={<Inbox size={18} />} tone="primary" /><Metric label="Completed care" value={completed.length} helper="Treatment reports filed" icon={<CheckCircle2 size={18} />} tone="success" /><Metric label="Total referrals" value={referrals.length} helper="Facility record" icon={<ClipboardList size={18} />} tone="neutral" /></section>
    <section className="overflow-hidden rounded-xl border border-border-color bg-bg-secondary shadow-sm"><div className="flex items-center justify-between border-b border-border-color px-5 py-4"><div><h2 className="text-sm font-extrabold text-text-primary">Referral history</h2><p className="mt-0.5 text-xs text-text-muted">All referrals received by this facility.</p></div><span className="text-xs font-bold text-text-muted">{history.length} records</span></div>{history.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center"><div className="rounded-xl bg-primary-light p-3 text-primary"><Inbox size={21} /></div><p className="mt-3 text-sm font-bold text-text-primary">No referral records yet</p><p className="mt-1 text-xs text-text-muted">Referral activity will appear here once it is received.</p></div> : <div className="divide-y divide-border-color">{history.map(referral => <HistoryReferral key={referral.id} referral={referral} onOpen={() => navigate(referral.status === 'ACCEPTED' ? '/hospital/incoming' : '/hospital/patient-care')} />)}</div>}</section>
  </main>;
};

function Metric({ label, value, helper, icon, tone }: { label: string; value: number; helper: string; icon: React.ReactNode; tone: 'primary' | 'danger' | 'success' | 'neutral' }) { const styles = { primary: 'bg-primary-light text-primary', danger: 'bg-danger-bg text-danger', success: 'bg-success-bg text-success', neutral: 'bg-bg-primary text-text-secondary' }; return <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border-color bg-bg-secondary p-4 shadow-sm"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles[tone]}`}>{icon}</div><div className="min-w-0"><p className="text-xl font-extrabold leading-none text-text-primary">{value}</p><p className="mt-1 truncate text-[0.63rem] font-extrabold uppercase tracking-[0.1em] text-text-secondary">{label}</p><p className="mt-0.5 truncate text-[0.68rem] text-text-muted">{helper}</p></div></div>; }
function HistoryReferral({ referral, onOpen }: { referral: ReferralRequest; onOpen: () => void }) { const completed = referral.status === 'TREATMENT_COMPLETED'; return <button onClick={onOpen} className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-primary-lightest"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-extrabold text-primary">{nameOf(referral)[0].toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-text-primary">{nameOf(referral)}</p><p className="mt-0.5 text-xs text-text-muted">{referral.branchCenter || 'Branch not supplied'} · {dateOf(referral.updatedAt)}</p></div><span className={`hidden rounded-full px-2 py-1 text-[0.6rem] font-bold uppercase sm:inline-block ${completed ? 'bg-success-bg text-success' : 'bg-primary-light text-primary'}`}>{completed ? 'Completed' : 'Awaiting care'}</span><ArrowRight size={15} className="shrink-0 text-text-muted" /></button>; }
