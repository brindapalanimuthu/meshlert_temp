import { useState } from 'react';
import { AlertCircle, MapPin, Loader2, CheckCircle2, Clock } from 'lucide-react';
import localDB from '@/db/localDB';
import { queueSync, flushSyncQueue } from '@/db/syncEngine';
import type { StatusType } from '@/types';

const TYPES = ['Medical', 'Trapped', 'Fire', 'Flood', 'Structural Damage', 'Missing Person', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

interface IncidentFormProps {
  onReported?: () => void;
}

interface FormState {
  type: string;
  severity: string;
  description: string;
}

function getLocation(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { timeout: 5000 }
    );
  });
}

export default function IncidentForm({ onReported }: IncidentFormProps) {
  const [form, setForm] = useState<FormState>({ type: 'Medical', severity: 'Medium', description: '' });
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const location = await getLocation();
    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const localId = await localDB.incidents.add({
      meshId: localStorage.getItem('meshalert_meshid') || 'unknown',
      type: form.type,
      severity: form.severity,
      description: form.description,
      location,
      clientId,
      status: 'Reported',
      synced: 0,
      createdAt: new Date().toISOString(),
    });

    await queueSync('incident', localId!, 'create');
    const result = await flushSyncQueue();

    setStatus(
      result.pushed > 0
        ? { type: 'success', message: 'Incident reported and synced.' }
        : { type: 'pending', message: 'Saved locally. Will sync when connection is available.' }
    );
    setForm({ type: 'Medical', severity: 'Medium', description: '' });
    setSubmitting(false);
    if (onReported) onReported();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[460px] flex flex-col gap-[1.1rem] rounded-2xl border border-ink-200/70 bg-white/90 p-8 shadow-lg shadow-ink-900/5 glass-surface animate-card-rise dark:border-ink-700/50 dark:bg-ink-800/40 dark:shadow-black/30"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-primary-500 dark:text-primary-400" />
        <h2 className="text-[1.3rem] font-display font-semibold text-ink-900 dark:text-white">Report an incident</h2>
      </div>

      <label className="flex flex-col gap-[0.4rem]">
        <span className="text-[0.8rem] font-medium text-ink-500 dark:text-ink-300">Type</span>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="rounded-xl border border-ink-200 bg-ink-50/60 px-[0.85rem] py-[0.7rem] text-[0.95rem] text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-ink-600/50 dark:bg-ink-900/50 dark:text-white"
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-[0.4rem]">
        <span className="text-[0.8rem] font-medium text-ink-500 dark:text-ink-300">Severity</span>
        <select
          name="severity"
          value={form.severity}
          onChange={handleChange}
          className="rounded-xl border border-ink-200 bg-ink-50/60 px-[0.85rem] py-[0.7rem] text-[0.95rem] text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-ink-600/50 dark:bg-ink-900/50 dark:text-white"
        >
          {SEVERITIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-[0.4rem]">
        <span className="text-[0.8rem] font-medium text-ink-500 dark:text-ink-300">Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          maxLength={1000}
          rows={4}
          placeholder="What's happening, and what help is needed?"
          className="resize-vertical rounded-xl border border-ink-200 bg-ink-50/60 px-[0.85rem] py-[0.7rem] text-[0.95rem] text-ink-900 transition-colors placeholder:text-ink-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-ink-600/50 dark:bg-ink-900/50 dark:text-white dark:placeholder:text-ink-500"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-[0.85rem] py-[0.85rem] text-[0.95rem] font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Report incident
          </>
        )}
      </button>

      {status && (
        <p
          className={`flex items-center gap-2 rounded-lg px-3 py-[0.6rem] text-[0.85rem] animate-status-in ${
            status.type === 'success'
              ? 'bg-success-500/12 text-success-600 dark:text-success-400'
              : 'bg-warning-500/12 text-warning-600 dark:text-warning-400'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <Clock className="h-4 w-4 shrink-0" />
          )}
          {status.message}
        </p>
      )}
    </form>
  );
}
