import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, FileText, Inbox, Search, X } from 'lucide-react';
import { useReferral } from '../../context/ReferralContext';
import type { ReferralRequest } from '../../types';

const urgencyStyle = {
  EMERGENCY: 'border-danger/20 bg-danger-bg text-danger',
  URGENT: 'border-warning/20 bg-warning-bg text-warning',
  ROUTINE: 'border-success/20 bg-success-bg text-success',
} as const;

const patientName = (referral: ReferralRequest) => referral.patientName || referral.staffName || 'Unnamed patient';
const formatDate = (date: string) => new Date(date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

function Priority({ referral }: { referral: ReferralRequest }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.63rem] font-extrabold uppercase tracking-wide ${urgencyStyle[referral.urgencyLevel]}`}>{referral.urgencyLevel}</span>;
}

function ReferralReview({ referral, onClose, onTreat }: { referral: ReferralRequest; onClose: () => void; onTreat: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-5" onClick={onClose}>
      <section role="dialog" aria-modal="true" className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border-color bg-bg-secondary shadow-2xl sm:rounded-2xl" onClick={event => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border-color px-5 py-4"><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-text-muted">Patient referral</p><h2 className="text-base font-extrabold text-text-primary">{patientName(referral)}</h2></div><button onClick={onClose} aria-label="Close review" className="rounded-lg p-2 text-text-muted hover:bg-bg-primary hover:text-text-primary"><X size={18} /></button></header>
        <div className="space-y-5 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><Priority referral={referral} /><span className="text-xs text-text-muted">Received {formatDate(referral.updatedAt)}</span></div>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border-color"><Detail label="Pension ID" value={referral.pensionId || 'Not provided'} /><Detail label="Relationship" value={referral.patientRelationship || 'Self'} /><Detail label="Age / sex" value={referral.patientAge ? `${referral.patientAge} / ${referral.patientSex}` : 'Not provided'} /><Detail label="Branch centre" value={referral.branchCenter || 'Not provided'} /></div>
          <div><p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-muted">Clinical summary</p><p className="rounded-xl bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">{referral.diagnosisDescription || 'No clinical summary provided.'}</p></div>
          {referral.adminNotes && <div><p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-muted">Administrator notes</p><p className="rounded-xl border border-warning/20 bg-warning-bg p-4 text-sm leading-relaxed text-text-secondary">{referral.adminNotes}</p></div>}
          {referral.attachments.length > 0 && <div><p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-muted">Attachments</p><div className="space-y-2">{referral.attachments.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-border-color p-3"><FileText size={16} className="text-primary" /><span className="min-w-0 flex-1 truncate text-xs font-bold text-text-primary">{file.name}</span><span className="text-[0.68rem] text-text-muted">{file.size}</span></div>)}</div></div>}
        </div>
        <footer className="flex gap-3 border-t border-border-color bg-bg-primary/50 p-4"><button onClick={onClose} className="rounded-lg border border-border-color bg-bg-secondary px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-primary">Close</button><button onClick={onTreat} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover"><CheckCircle2 size={14} /> Begin treatment</button></footer>
      </section>
    </div>, document.body,
  );
}

export const IncomingReferrals: React.FC = () => {
  const navigate = useNavigate();
  const { getReferralsForUser } = useReferral();
  const referrals = getReferralsForUser().filter(referral => referral.status === 'ACCEPTED');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ReferralRequest | null>(null);
  const query = search.trim().toLowerCase();
  const filtered = referrals.filter(referral => !query || patientName(referral).toLowerCase().includes(query) || (referral.pensionId || '').toLowerCase().includes(query));
  const treat = () => navigate('/hospital/patient-care');

  return <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 animate-fade-in">
    <label className="flex max-w-xl items-center gap-2.5 rounded-xl border border-border-color bg-bg-secondary px-3.5 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-light"><Search size={17} className="text-text-muted" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search patient name or pension ID" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" className="text-text-muted hover:text-text-primary"><X size={16} /></button>}</label>
    {filtered.length === 0 ? <EmptyState searching={Boolean(query)} /> : <section className="overflow-hidden rounded-xl border border-border-color bg-bg-secondary shadow-sm"><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[850px] border-collapse"><thead><tr className="border-b border-border-color bg-bg-primary/60"><Heading>Patient</Heading><Heading>Pension ID</Heading><Heading>Priority</Heading><Heading>Branch centre</Heading><Heading>Received</Heading><Heading /></tr></thead><tbody>{filtered.map(referral => <tr key={referral.id} className="border-b border-border-color last:border-0 hover:bg-primary-lightest"><td className="px-5 py-4"><Patient referral={referral} /></td><td className="px-5 py-4 font-mono text-xs font-bold text-text-secondary">{referral.pensionId || '—'}</td><td className="px-5 py-4"><Priority referral={referral} /></td><td className="px-5 py-4 text-sm font-semibold text-text-secondary">{referral.branchCenter || '—'}</td><td className="px-5 py-4 text-sm text-text-muted">{formatDate(referral.updatedAt)}</td><td className="px-5 py-4"><Actions onReview={() => setSelected(referral)} onTreat={treat} /></td></tr>)}</tbody></table></div><div className="divide-y divide-border-color lg:hidden">{filtered.map(referral => <article key={referral.id} className="p-4"><div className="flex items-start justify-between gap-3"><Patient referral={referral} /><Priority referral={referral} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-border-color py-3"><Detail label="Pension ID" value={referral.pensionId || '—'} compact /><Detail label="Received" value={formatDate(referral.updatedAt)} compact /><Detail label="Branch centre" value={referral.branchCenter || '—'} compact /><Detail label="Age / sex" value={referral.patientAge ? `${referral.patientAge} / ${referral.patientSex}` : '—'} compact /></div><div className="mt-4"><Actions onReview={() => setSelected(referral)} onTreat={treat} /></div></article>)}</div></section>}
    {selected && <ReferralReview referral={selected} onClose={() => setSelected(null)} onTreat={() => { setSelected(null); treat(); }} />}
  </main>;
};

function Heading({ children }: { children?: React.ReactNode }) { return <th className="px-5 py-3 text-left text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-text-muted">{children}</th>; }
function Patient({ referral }: { referral: ReferralRequest }) { const name = patientName(referral); return <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-extrabold text-primary">{name[0].toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-extrabold text-text-primary">{name}</p><p className="text-xs text-text-muted">{referral.patientRelationship || 'Self referral'}</p></div></div>; }
function Detail({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) { return <div className={compact ? '' : 'border-b border-border-color p-3.5 even:border-l'}><p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-text-muted">{label}</p><p className="mt-1 truncate text-xs font-bold text-text-secondary">{value}</p></div>; }
function Actions({ onReview, onTreat }: { onReview: () => void; onTreat: () => void }) { return <div className="flex justify-end gap-2"><button onClick={onReview} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-color px-3 py-2 text-xs font-bold text-text-secondary hover:bg-bg-primary lg:flex-none"><Eye size={14} /> Review</button><button onClick={onTreat} className="inline-flex flex-[1.2] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover lg:flex-none">Treat <ArrowRight size={14} /></button></div>; }
function EmptyState({ searching }: { searching: boolean }) { return <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-color bg-bg-secondary p-6 text-center"><div className="rounded-xl bg-primary-light p-3 text-primary"><Inbox size={22} /></div><h2 className="mt-3 text-base font-extrabold text-text-primary">{searching ? 'No matching referrals' : 'No incoming referrals'}</h2><p className="mt-1 text-sm text-text-muted">{searching ? 'Try a different patient name or pension ID.' : 'Accepted referrals will appear here.'}</p></section>; }
