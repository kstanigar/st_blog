import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

type Tab = 'signin' | 'signup';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = useAuthContext();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: authError } = tab === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (authError) {
      setError((authError as { message?: string }).message ?? 'An error occurred');
    } else if (tab === 'signup') {
      setSuccess('Check your email to confirm your account.');
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(7, 9, 14, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm"
        style={{ border: '2px solid var(--primary-glow-md)', background: 'var(--background)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--primary-glow-md)' }}
        >
          <span className="font-mono text-[10px] tracking-[0.35em] text-primary">
            AUTH://STANDING_TIGER
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex" style={{ borderBottom: '1px solid var(--primary-glow-md)' }}>
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="flex-1 py-3 font-mono text-[9px] tracking-widest transition-colors"
              style={{
                color: tab === t ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: tab === t ? '1px solid var(--primary)' : '1px solid transparent',
                marginBottom: -1,
              }}
            >
              {t === 'signin' ? 'SIGN IN' : 'SIGN UP'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] tracking-widest text-muted-foreground">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-transparent border px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors"
              style={{ borderColor: 'var(--primary-glow-md)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--primary-glow-md)')}
              placeholder="user@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] tracking-widest text-muted-foreground">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-transparent border px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors"
              style={{ borderColor: 'var(--primary-glow-md)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--primary-glow-md)')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="font-mono text-[9px] text-red-400 border border-red-400/30 px-3 py-2">
              ERR: {error}
            </div>
          )}

          {success && (
            <div className="font-mono text-[9px] border px-3 py-2" style={{ color: 'var(--primary)', borderColor: 'var(--primary-glow-md)' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-mono text-[10px] tracking-widest transition-opacity disabled:opacity-50"
            style={{ color: 'var(--background)', background: 'var(--primary)' }}
          >
            {loading ? 'PROCESSING...' : tab === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
