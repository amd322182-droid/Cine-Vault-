import React, { useState } from 'react';
import { X, User, Lock, Mail, Bookmark, History, Download, LogOut, CheckCircle2 } from 'lucide-react';
import { Movie, VideoQualityLevel } from '../types/index.js';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    favorites: string[];
    downloadHistory: any[];
  } | null;
  onLogin: (email: string, name?: string) => void;
  onLogout: () => void;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  allMovies,
  onSelectMovie
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'profile' | 'watchlist' | 'history'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email, name || email.split('@')[0]);
    setMsg('Signed in successfully!');
    setTimeout(() => {
      setMsg('');
      onClose();
    }, 1000);
  };

  const favoriteMovies = allMovies.filter((m) => currentUser?.favorites?.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121828] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              {currentUser ? 'My CineVault Account' : tab === 'register' ? 'Create Account' : 'Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs if logged in */}
        {currentUser && (
          <div className="flex border-b border-slate-800 bg-[#0a0d16] text-xs">
            <button
              onClick={() => setTab('profile')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors ${
                tab === 'profile' || tab === 'login' ? 'text-rose-400 border-b-2 border-rose-500 bg-slate-900/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setTab('watchlist')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors ${
                tab === 'watchlist' ? 'text-rose-400 border-b-2 border-rose-500 bg-slate-900/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved ({currentUser.favorites?.length || 0})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors ${
                tab === 'history' ? 'text-rose-400 border-b-2 border-rose-500 bg-slate-900/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Downloads ({currentUser.downloadHistory?.length || 0})
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-4">
          {msg && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          {!currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                {tab === 'register' ? 'Create Account' : 'Sign In to CineVault'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                {tab === 'register' ? (
                  <span>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')} className="text-rose-400 font-semibold hover:underline">
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setTab('register')} className="text-rose-400 font-semibold hover:underline">
                      Sign Up Free
                    </button>
                  </span>
                )}
              </div>
            </form>
          ) : (
            <div>
              {/* Profile Overview */}
              {(tab === 'profile' || tab === 'login') && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs text-slate-400 block">Logged In As</span>
                    <div className="text-base font-bold text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-xl font-bold text-amber-400">{currentUser.favorites?.length || 0}</span>
                      <span className="text-xs text-slate-400 block">Watchlist Titles</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-xl font-bold text-blue-400">{currentUser.downloadHistory?.length || 0}</span>
                      <span className="text-xs text-slate-400 block">Downloads Completed</span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}

              {/* Watchlist */}
              {tab === 'watchlist' && (
                <div className="space-y-3">
                  {favoriteMovies.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Your watchlist is currently empty.</p>
                  ) : (
                    favoriteMovies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectMovie(m);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img src={m.posterUrl} alt="" className="w-10 h-14 object-cover rounded bg-slate-800 shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-xs text-white">{m.title}</h4>
                          <span className="text-[11px] text-slate-400">{m.releaseYear} · {m.category}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Download History */}
              {tab === 'history' && (
                <div className="space-y-2">
                  {currentUser.downloadHistory?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No downloads recorded yet.</p>
                  ) : (
                    currentUser.downloadHistory?.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white block">{item.movieTitle}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.downloadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 font-bold text-[10px] block">
                            {item.quality}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.fileSizeDisplay}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
