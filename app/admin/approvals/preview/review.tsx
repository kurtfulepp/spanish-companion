'use client';
/* oxlint-disable next/no-html-link-for-pages -- full document navigation follows the app's vinext navigation convention. */

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Clock3, Mail, Search, ShieldCheck, X } from 'lucide-react';
import { Brand } from '@/components/brand';
import styles from './review.module.css';

type Status = 'pending' | 'approved' | 'declined';
type Request = { id: string; name: string; email: string; note: string; requested: string; status: Status };
const initialRequests: Request[] = [
  { id: 'sample-1', name: 'Alex Morgan', email: 'alex@example.com', note: 'I’d like to practice Spanish before a trip to Madrid.', requested: '13 Sep 2026', status: 'pending' },
  { id: 'sample-2', name: 'Sam Rivera', email: 'sam@example.com', note: 'I’m returning to Spanish after a few years and would like to try the app.', requested: '12 Sep 2026', status: 'pending' },
  { id: 'sample-3', name: 'Jamie Lee', email: 'jamie@example.com', note: '', requested: '12 Sep 2026', status: 'pending' },
];
const labels: Record<Status, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

export function ApprovalPreview() {
  const [requests, setRequests] = useState(initialRequests);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('sample-1');
  const [decision, setDecision] = useState<'approved' | 'declined'>('approved');
  const [announcement, setAnnouncement] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = requests.filter(request => request.status === 'pending').length;
  const visible = requests.filter(request => (tab === 'pending' ? request.status === 'pending' : request.status !== 'pending') && `${request.name} ${request.email}`.toLowerCase().includes(search.toLowerCase().trim()));
  const selected = visible.find(request => request.id === selectedId) ?? visible[0];

  function confirmDecision() {
    if (!selected || selected.status !== 'pending') return;
    setRequests(current => current.map(request => request.id === selected.id ? { ...request, status: decision } : request));
    setAnnouncement(`Preview: ${selected.name} ${decision}. No account was changed or email sent.`);
    dialog.current?.close();
  }

  function openDecision(value: 'approved' | 'declined') {
    setDecision(value);
    dialog.current?.showModal();
  }

  return (
    <main className={styles.page}>
      <header className={`app-header ${styles.header}`}>
        <a href="/home" aria-label="KurtES home"><Brand compact /></a>
        <a href="/home" className={styles.back}><ArrowLeft size={16} /> Back to app</a>
      </header>

      <div className={styles.preview}>
        <span><strong>Interface preview</strong> · Sample requests. Decisions reset on refresh. Live approval is not enabled.</span>
        <button type="button" onClick={() => { setRequests(initialRequests); setSelectedId('sample-1'); setTab('pending'); setSearch(''); setAnnouncement('Sample requests reset.'); }}>Reset preview</button>
      </div>

      <section className={`brand-hero ${styles.hero}`} aria-labelledby="page-title">
        <div><p className={styles.eyebrow}>Closed alpha</p><h1 id="page-title">Access requests</h1></div>
        <div className={styles.count}><Clock3 size={20} /><strong>{pending}</strong><span>pending review</span></div>
      </section>

      <div className={styles.layout}>
        <section className={styles.inbox} aria-label="Access request inbox">
          <div className={styles.tabs} aria-label="Request status">
            <button type="button" aria-pressed={tab === 'pending'} onClick={() => setTab('pending')}>Pending <span>{pending}</span></button>
            <button type="button" aria-pressed={tab === 'history'} onClick={() => setTab('history')}>History <span>{requests.length - pending}</span></button>
          </div>
          <label className={styles.search}><Search size={18} /><span className="sr-only">Search requests</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email" /></label>
          <ul className={styles.requests}>
            {visible.map(request => (
              <li key={request.id}><button type="button" className={`${styles.request} ${selected?.id === request.id ? styles.selected : ''}`} onClick={() => setSelectedId(request.id)} aria-pressed={selected?.id === request.id}>
                <span className={styles.avatar} aria-hidden="true">{request.name.split(' ').map(part => part[0]).join('')}</span>
                <span className={styles.person}><strong>{request.name}</strong><span>{request.email}</span><small>{request.requested} · {labels[request.status]}</small></span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </button></li>
            ))}
          </ul>
          {!visible.length && <div className={styles.empty}><Check size={24} /><h2>{search ? 'No matching requests' : tab === 'pending' ? 'No pending requests' : 'No decisions yet'}</h2><p>{search ? 'Try a different name or email.' : tab === 'pending' ? 'New requests will appear here.' : 'Reviewed requests will appear here.'}</p></div>}
        </section>

        <section className={styles.detail} aria-label="Request details">
          {selected ? <>
            <div className={styles.detailTop}><span className={styles.status}>{labels[selected.status]}</span><span className={styles.sample}>Sample applicant</span></div>
            <div className={styles.identity}><span className={styles.largeAvatar} aria-hidden="true">{selected.name.split(' ').map(part => part[0]).join('')}</span><div><h2>{selected.name}</h2><p>{selected.email}</p></div></div>
            <dl className={styles.facts}><div><dt>Requested</dt><dd>{selected.requested}</dd></div><div><dt>Access</dt><dd>Closed alpha</dd></div></dl>
            <div className={styles.note}><h3>Note from applicant</h3><p>{selected.note || 'No note provided.'}</p></div>
            {selected.status === 'pending' ? <div className={styles.decisionArea}>
              <p>Review this request before granting access.</p>
              <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => openDecision('declined')}><X size={18} /> Decline</button><button type="button" className={styles.primary} onClick={() => openDecision('approved')}><Check size={18} /> Approve</button></div>
              <small>Preview actions do not send an invitation.</small>
            </div> : <div className={styles.decisionArea}><h3>{labels[selected.status]} in this preview</h3><p>No account was changed or email sent.</p></div>}
          </> : <div className={styles.empty}><ShieldCheck size={32} /><h2>Select a request</h2><p>Applicant details and review actions appear here.</p></div>}
        </section>
      </div>

      <aside className={styles.settings} aria-label="Approval setup">
        <div><ShieldCheck size={21} /><span><strong>Admin access verified</strong><small>Supabase admin role required. Signup enforcement is not connected.</small></span></div>
        <div><Mail size={21} /><span><strong>kurtfulepp@gmail.com</strong><small>Notification destination · Email delivery not connected</small></span></div>
      </aside>
      <output className={styles.announcement} aria-live="polite">{announcement}</output>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="decision-title" aria-describedby="decision-description">
        <h2 id="decision-title">{decision === 'approved' ? 'Approve' : 'Decline'} this request?</h2>
        <p id="decision-description">{selected?.name} · {selected?.email}</p>
        <p>This is a preview. No account will be created and no email will be sent.</p>
        <div className={styles.actions}><button type="button" autoFocus className={styles.secondary} onClick={() => dialog.current?.close()}>Cancel</button><button type="button" className={styles.primary} onClick={confirmDecision}>{decision === 'approved' ? 'Approve' : 'Decline'} in preview</button></div>
      </dialog>
    </main>
  );
}
