'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';

interface AdminLoginGateProps {
  onAuthenticated: () => void;
}

export function AdminLoginGate({ onAuthenticated }: AdminLoginGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify your administrator password.');
        setLoading(false);
        return;
      }

      onAuthenticated();
    } catch {
      setError('Unable to reach authentication server. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-7 h-7" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Administrator Portal
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Enter your admin passphrase to access curation and live publishing.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Administrator Passphrase
            </label>
            <div className="mt-1.5 relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passphrase..."
                autoComplete="current-password"
                required
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
              <KeyRound
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Unlock Admin Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Protected with server-side HMAC session tokens &amp; brute-force protection.
          </p>
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
            Default passphrase: <code className="text-blue-600 dark:text-blue-400 font-semibold">usefulhub@admin2026</code>
          </p>
        </div>
      </div>
    </div>
  );
}
